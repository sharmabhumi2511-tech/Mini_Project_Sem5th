#!/usr/bin/env node

/**
 * Test Runner Script — Runs both backend and client integration tests
 */

const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('='.repeat(70));
console.log('   GLUCOSESENSE TEST SUITE EXECUTION');
console.log('='.repeat(70));

let failures = 0;

// 1. Backend Python Unit Tests
console.log('\n[*] Running Backend Python Test Suite (server/tests)...');
try {
  execSync('python -m unittest discover -s server/tests', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });
  console.log('[PASS] Backend tests completed successfully.');
} catch (e) {
  console.error('[FAIL] Backend unit tests failed.');
  failures++;
}

// 2. Integration / Model Artifact Verification
console.log('\n[*] Verifying Machine Learning Model Artifacts...');
const fs = require('fs');
const modelPath = path.join(PROJECT_ROOT, 'ml', 'models', 'diabetes_model.pkl');
const datasetPath = path.join(PROJECT_ROOT, 'ml', 'data', 'diabetes.csv');

if (fs.existsSync(modelPath)) {
  const size = fs.statSync(modelPath).size;
  console.log(`[PASS] Model artifact found: ml/models/diabetes_model.pkl (${size} bytes)`);
} else {
  console.error('[FAIL] Missing model artifact at ml/models/diabetes_model.pkl');
  failures++;
}

if (fs.existsSync(datasetPath)) {
  const size = fs.statSync(datasetPath).size;
  console.log(`[PASS] Dataset found: ml/data/diabetes.csv (${size} bytes)`);
} else {
  console.error('[FAIL] Missing dataset at ml/data/diabetes.csv');
  failures++;
}

// 3. Full-Stack End-to-End Reverse-Proxy Test
console.log('\n[*] Running Full-Stack Reverse-Proxy Integration Test (tests/test_integration.js)...');
try {
  execSync('node tests/test_integration.js', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });
  console.log('[PASS] Full-stack integration smoke test succeeded.');
} catch (e) {
  console.error('[FAIL] Full-stack integration test failed.');
  failures++;
}

// 4. Data Persistence & Multi-Risk Reports Verification
console.log('\n[*] Running Logout/Login Data Persistence & Multi-Risk Report Test (tests/test_logout_login_persistence.js)...');
try {
  execSync('node tests/test_logout_login_persistence.js', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });
  console.log('[PASS] Data persistence and multi-risk reports verified.');
} catch (e) {
  console.error('[FAIL] Data persistence test failed.');
  failures++;
}

console.log('\n' + '='.repeat(70));
if (failures === 0) {
  console.log('[SUCCESS] All GlucoseSense tests passed cleanly!');
  console.log('='.repeat(70));
  process.exit(0);
} else {
  console.error(`[ERROR] Test suite finished with ${failures} failure(s).`);
  console.log('='.repeat(70));
  process.exit(1);
}
