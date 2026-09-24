#!/usr/bin/env node
/**
 * GlucoseSense / DIA-PREDICT — Single-Command Development Orchestrator
 * ===================================================================
 * Starts the Python ML service and the frontend Express server with
 * integrated API reverse-proxy, health probe, and graceful shutdown.
 */

const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(PROJECT_ROOT, 'client');
const SERVER_APP_PATH = path.join(PROJECT_ROOT, 'server', 'app.py');

const args = process.argv.slice(2);
function getCliArg(flag, defaultVal) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return defaultVal;
}

const CLIENT_PORT = parseInt(getCliArg('--port', process.env.CLIENT_PORT || process.env.PORT || '3000'), 10);
const BACKEND_PORT = parseInt(getCliArg('--backend-port', process.env.BACKEND_PORT || '5000'), 10);
const SHOULD_OPEN_BROWSER = !args.includes('--no-open') && process.env.BROWSER !== 'none' && !process.env.CI;

let pythonProcess = null;
let expressServer = null;
let isShuttingDown = false;

// 1. Detect Python Command
function getPythonCommand() {
  const candidates = process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python'];

  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch (e) {
      // Try next candidate
    }
  }
  return 'python';
}

// 2. Start Python Backend Subprocess
function startPythonBackend(pythonCmd) {
  console.log(`[INIT] Spawning Machine Learning Service via: ${pythonCmd} server/app.py ...`);

  const env = {
    ...process.env,
    BACKEND_PORT: String(BACKEND_PORT),
    PORT: String(BACKEND_PORT),
    HOST: '127.0.0.1',
    PYTHONUNBUFFERED: '1'
  };

  pythonProcess = spawn(pythonCmd, [SERVER_APP_PATH], {
    cwd: PROJECT_ROOT,
    env,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  pythonProcess.stdout.on('data', (data) => {
    const text = data.toString().trim();
    if (text) {
      console.log(`[ML Backend] ${text}`);
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    const text = data.toString().trim();
    // Filter out scikit-learn deprecation notices or standard log warnings
    if (text && !text.includes('FutureWarning')) {
      console.error(`[ML Backend Warning] ${text}`);
    }
  });

  pythonProcess.on('error', (err) => {
    console.error(`[FATAL] Failed to start Python backend: ${err.message}`);
    console.error(`[TIP] Verify Python is installed and run 'pip install -r server/requirements.txt'`);
  });

  pythonProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      console.warn(`[WARN] Python backend exited unexpectedly (Code: ${code}, Signal: ${signal})`);
    }
  });
}

// 3. Poll Backend Health
function pollBackendReady(maxAttempts = 30, intervalMs = 300) {
  return new Promise((resolve) => {
    let attempts = 0;
    const probe = () => {
      attempts++;
      const req = http.get(`http://127.0.0.1:${BACKEND_PORT}/api/health`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(body);
              const modelName = (parsed.data && parsed.data.model_name) || parsed.model_name || 'Active';
              resolve({ ok: true, modelName });
              return;
            } catch (e) {}
          }
          if (attempts < maxAttempts) setTimeout(probe, intervalMs);
          else resolve({ ok: false });
        });
      });

      req.on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(probe, intervalMs);
        } else {
          resolve({ ok: false });
        }
      });
      req.setTimeout(500, () => req.destroy());
    };
    probe();
  });
}

// 4. Start Express Dev Server with Reverse-Proxy
async function startDevServer() {
  const app = express();

  // Reverse proxy for /api routes
  const apiProxy = createProxyMiddleware({
    target: `http://127.0.0.1:${BACKEND_PORT}`,
    changeOrigin: true,
    onError: (err, req, res) => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: {
            code: 'BACKEND_INITIALIZING',
            message: 'ML Service is still starting or initializing. Please retry in a few seconds.'
          }
        });
      }
    }
  });

  app.use('/api', apiProxy);
  app.use('/health', apiProxy);
  app.use('/predict', apiProxy);

  // Serve static client assets (supports both modular client/ and root fallback)
  app.use(express.static(CLIENT_DIR));
  app.use(express.static(PROJECT_ROOT));

  // Default SPA / index handler
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const clientIndex = path.join(CLIENT_DIR, 'index.html');
    const rootIndex = path.join(PROJECT_ROOT, 'index.html');
    res.sendFile(clientIndex, (err) => {
      if (err) res.sendFile(rootIndex);
    });
  });

  return new Promise((resolve, reject) => {
    expressServer = app.listen(CLIENT_PORT, () => {
      resolve();
    });
    expressServer.on('error', reject);
  });
}

// 5. Graceful Process Cleanup
function setupGracefulShutdown() {
  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log('\n[SHUTDOWN] Terminating GlucoseSense development servers cleanly...');

    if (expressServer) {
      expressServer.close();
    }

    if (pythonProcess && pythonProcess.pid) {
      if (process.platform === 'win32') {
        try {
          execSync(`taskkill /pid ${pythonProcess.pid} /T /F`, { stdio: 'ignore' });
        } catch (e) {
          try { pythonProcess.kill('SIGTERM'); } catch (err) {}
        }
      } else {
        try {
          pythonProcess.kill('SIGTERM');
        } catch (e) {}
      }
    }

    setTimeout(() => {
      process.exit(0);
    }, 400);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', shutdown);
}

// 6. Main Orchestrator
async function main() {
  setupGracefulShutdown();

  const pythonCmd = getPythonCommand();
  startPythonBackend(pythonCmd);
  await startDevServer();

  console.log('[PROBE] Waiting for Machine Learning Engine to initialize...');
  const health = await pollBackendReady();

  console.log('\n' + '='.repeat(70));
  console.log('   GLUCOSESENSE / DIA-PREDICT — UNIFIED HEALTHCARE DECISION SUPPORT');
  console.log('='.repeat(70));
  console.log(`   🌐 Web Application:   http://localhost:${CLIENT_PORT}`);
  console.log(`   🔬 Python ML Service:  http://127.0.0.1:${BACKEND_PORT} (Internal)`);
  console.log(`   🔀 API Reverse Proxy:  http://localhost:${CLIENT_PORT}/api -> :${BACKEND_PORT}/api`);
  console.log(`   🩺 Health Diagnostic: http://localhost:${CLIENT_PORT}/api/health`);
  console.log(`   🧠 Active ML Engine:  ${health.modelName || 'Loaded'}`);
  console.log('='.repeat(70));
  console.log('   [Ready] Press Ctrl+C to terminate all services gracefully.\n');

  if (SHOULD_OPEN_BROWSER) {
    try {
      const open = require('open');
      await open(`http://localhost:${CLIENT_PORT}`);
    } catch (e) {
      // Non-fatal if browser opening fails in headless/restricted environment
    }
  }
}

main().catch(err => {
  console.error('[FATAL] Initialization error:', err);
  process.exit(1);
});
