/**
 * Full-Stack End-to-End Integration Smoke Test
 * Tests Express dev server + Python ML backend reverse proxy in a real network environment.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEST_CLIENT_PORT = 3099;
const TEST_BACKEND_PORT = 5099;

console.log('='.repeat(70));
console.log('   GLUCOSESENSE FULL-STACK REVERSE-PROXY INTEGRATION TEST');
console.log('='.repeat(70));

let devProcess = null;

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('Request timeout')));
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runIntegrationTest() {
  console.log(`[*] Starting unified dev-server on Ports (Client: ${TEST_CLIENT_PORT}, Backend: ${TEST_BACKEND_PORT})...`);

  const env = {
    ...process.env,
    CLIENT_PORT: String(TEST_CLIENT_PORT),
    PORT: String(TEST_CLIENT_PORT),
    BACKEND_PORT: String(TEST_BACKEND_PORT),
    BROWSER: 'none',
    CI: 'true'
  };

  devProcess = spawn('node', [
    'scripts/dev-server.js',
    '--no-open',
    '--port', String(TEST_CLIENT_PORT),
    '--backend-port', String(TEST_BACKEND_PORT)
  ], {
    cwd: PROJECT_ROOT,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  devProcess.stdout.on('data', (d) => {
    console.log(`[DEV-OUT] ${d.toString().trim()}`);
  });
  devProcess.stderr.on('data', (d) => {
    console.error(`[DEV-ERR] ${d.toString().trim()}`);
  });

  // Wait up to 10 seconds for servers to start
  console.log('[*] Polling http://localhost:' + TEST_CLIENT_PORT + '/api/health through proxy...');
  let healthy = false;
  for (let i = 0; i < 20; i++) {
    await delay(500);
    try {
      const res = await request(`http://127.0.0.1:${TEST_CLIENT_PORT}/api/health`);
      if (res.status === 200 && res.body && (res.body.success || res.body.status === 'online')) {
        healthy = true;
        console.log('[PASS] Received healthy response from Python backend via Express reverse-proxy!');
        console.log(`[INFO] Model: ${res.body.data?.model_name || res.body.model_name}`);
        break;
      }
    } catch (e) {
      // Still booting
    }
  }

  if (!healthy) {
    throw new Error('Dev server failed to respond on /api/health within 10 seconds.');
  }

  // Test Prediction via Proxy
  console.log('\n[*] Testing POST /api/predict via reverse-proxy...');
  const predPayload = {
    pregnancies: 1,
    glucose: 145,
    bloodPressure: 84,
    skinThickness: 28,
    insulin: 110,
    bmi: 28.5,
    diabetesPedigree: 0.52,
    age: 44
  };

  const predRes = await request(`http://127.0.0.1:${TEST_CLIENT_PORT}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, predPayload);

  if (predRes.status !== 200) {
    throw new Error(`Expected status 200 from /api/predict, got ${predRes.status}: ${JSON.stringify(predRes.body)}`);
  }

  const result = predRes.body.data || predRes.body;
  console.log('[PASS] Prediction successfully processed!');
  console.log(`       Risk Category: ${result.risk}`);
  console.log(`       Probability:   ${result.probability}%`);
  console.log(`       Confidence:    ${result.confidence}%`);
  console.log(`       SHAP Factors:  ${result.shap?.length} feature attributions computed`);

  // Test static file serving
  console.log('\n[*] Testing static asset delivery (GET /index.html)...');
  const staticRes = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${TEST_CLIENT_PORT}/index.html`, (res) => {
      resolve({ status: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', reject);
  });

  if (staticRes.status === 200) {
    console.log('[PASS] Static index.html served successfully (HTTP 200)');
  } else {
    throw new Error(`Static delivery returned status ${staticRes.status}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('[SUCCESS] Full-stack reverse-proxy and ML inference test PASSED!');
  console.log('='.repeat(70));
}

runIntegrationTest()
  .then(() => {
    if (devProcess) {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        try { execSync(`taskkill /pid ${devProcess.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
      } else {
        devProcess.kill('SIGTERM');
      }
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[FAIL] Integration test failed:', err.message);
    if (devProcess) {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        try { execSync(`taskkill /pid ${devProcess.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
      } else {
        devProcess.kill('SIGTERM');
      }
    }
    process.exit(1);
  });
