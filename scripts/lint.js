#!/usr/bin/env node
/**
 * Lightweight Code Linter & Quality Checker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[LINT] Verifying JavaScript and Python syntax...');
let errors = 0;

// Verify JS files parse without syntax errors
const jsFiles = [
  'scripts/dev-server.js',
  'scripts/run-tests.js',
  'scripts/clean.js'
];

for (const file of jsFiles) {
  const filePath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    try {
      execSync(`node -c "${filePath}"`);
      console.log(`[PASS] ${file}`);
    } catch (e) {
      console.error(`[FAIL] ${file} has syntax errors!`);
      errors++;
    }
  }
}

// Check Python files with py_compile
const pyFiles = [
  'server/app.py',
  'ml/scripts/train_model.py',
  'server/src/config/settings.py',
  'server/src/services/ml_service.py',
  'server/src/services/shap_service.py',
  'server/src/controllers/prediction_controller.py',
  'server/src/controllers/health_controller.py'
];

for (const file of pyFiles) {
  const filePath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    try {
      execSync(`python -m py_compile "${filePath}"`);
      console.log(`[PASS] ${file}`);
    } catch (e) {
      console.error(`[FAIL] ${file} has syntax errors!`);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log('[SUCCESS] All audited files passed lint checks!');
  process.exit(0);
} else {
  console.error(`[FAIL] Found ${errors} syntax errors.`);
  process.exit(1);
}
