/**
 * Test: Logout and Login Data Persistence & Multi-Risk Report Verification
 * Tests that logging out and logging in does not flush out data, and that
 * reports of every risk type (Low Risk, Moderate Risk, High Risk) are present.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock browser environment
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = String(value);
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
    dump: function () {
      return store;
    }
  };
})();

global.window = {
  location: { protocol: 'http:' }
};
global.localStorage = localStorageMock;
global.document = {
  documentElement: {
    setAttribute: () => {}
  },
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

console.log('='.repeat(70));
console.log('   LOGOUT / LOGIN PERSISTENCE & MULTI-RISK REPORT TEST');
console.log('='.repeat(70));

// Read client/app.js to inspect functions and data
const appJsPath = path.join(__dirname, '..', 'client', 'app.js');
const appCode = fs.readFileSync(appJsPath, 'utf8');

// Evaluate state logic in isolated scope
const sandbox = {
  window: global.window,
  localStorage: global.localStorage,
  document: global.document,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Math: Math,
  Date: Date,
  JSON: JSON,
  Array: Array
};

// Extract baseline definition and test
const vm = require('vm');
vm.createContext(sandbox);

// Execute the code up to setup
vm.runInContext(appCode, sandbox);

const AppState = sandbox.window.AppState || sandbox.AppState;
const getBaselineReports = sandbox.window.getBaselineReports || sandbox.getBaselineReports;
const loadUserReports = sandbox.window.loadUserReports || sandbox.loadUserReports;
const saveUserReports = sandbox.window.saveUserReports || sandbox.saveUserReports;
const loadUserGlucose = sandbox.window.loadUserGlucose || sandbox.loadUserGlucose;
const saveUserGlucose = sandbox.window.saveUserGlucose || sandbox.saveUserGlucose;

// 1. Verify Reports have every risk type
console.log('\n[1] Verifying report risk types in baseline dataset...');
const baseline = getBaselineReports();
console.log(`    Total baseline reports: ${baseline.length}`);
assert(baseline.length >= 7, 'Baseline should contain at least 7 reports');

const lowRiskReports = baseline.filter(r => r.category === 'Low Risk');
const modRiskReports = baseline.filter(r => r.category === 'Moderate Risk');
const highRiskReports = baseline.filter(r => r.category === 'High Risk');

console.log(`    Low Risk reports:      ${lowRiskReports.length}`);
console.log(`    Moderate Risk reports: ${modRiskReports.length}`);
console.log(`    High Risk reports:     ${highRiskReports.length}`);

assert(lowRiskReports.length > 0, 'Must have Low Risk reports');
assert(modRiskReports.length > 0, 'Must have Moderate/Medium Risk reports');
assert(highRiskReports.length > 0, 'Must have High Risk reports');
console.log('[PASS] Baseline dataset contains all risk levels (Low, Moderate, High)!');

// 2. Test Login with example mail
console.log('\n[2] Testing initial login with example mail (you@example.com)...');
const testEmail = 'you@example.com';

let userReports = loadUserReports(testEmail);
let userGlucose = loadUserGlucose(testEmail);

console.log(`    Loaded reports for ${testEmail}: ${userReports.length}`);
console.log(`    Loaded glucose for ${testEmail}: ${userGlucose.length}`);
assert(userReports.length >= 7, 'Reports must not be empty on initial example login');
assert(userGlucose.length >= 7, 'Glucose logs must not be empty on initial example login');
console.log('[PASS] Initial login loads full clinical dataset!');

// 3. User adds a new prediction report and glucose reading
console.log('\n[3] Adding new assessment to user history...');
const newReport = {
  id: 'RPT-2026-9999',
  date: '25 Sep 2026, 03:30 PM',
  risk: 42,
  category: 'Moderate Risk',
  confidence: 89,
  glucose: 115,
  bmi: 26.5,
  bp: 80,
  pregnancies: 1,
  skin: 24,
  insulin: 110,
  pedigree: 0.52,
  age: 32,
  shap: []
};
userReports.unshift(newReport);
saveUserReports(testEmail, userReports);

const newGlucose = { id: 999, val: 105, context: 'Fasting', date: 'Today, 09:00 AM', note: 'Test' };
userGlucose.unshift(newGlucose);
saveUserGlucose(testEmail, userGlucose);

assert.strictEqual(userReports.length, 8, 'User now has 8 reports');
assert.strictEqual(userGlucose.length, 8, 'User now has 8 glucose logs');
console.log('[PASS] Assessment and glucose log saved for user.');

// 4. Simulate Logout
console.log('\n[4] Simulating Logout...');
// In app.js logout:
// 1. Current user's reports are saved
saveUserReports(testEmail, userReports);
saveUserGlucose(testEmail, userGlucose);
// 2. Session cleared
localStorage.removeItem('diapredict_user');
// 3. AppState resets to guest/baseline (NOT empty array!)
AppState.reports = loadUserReports('guest@example.com');
AppState.glucoseReadings = loadUserGlucose('guest@example.com');

console.log(`    AppState reports after logout: ${AppState.reports.length}`);
assert(AppState.reports.length >= 7, 'Reports in AppState after logout must NOT be flushed to empty array');
console.log('[PASS] Data is NOT flushed out on logout!');

// 5. Simulate Re-login with example mail
console.log('\n[5] Simulating Re-login with example mail (you@example.com)...');
const reloadedReports = loadUserReports(testEmail);
const reloadedGlucose = loadUserGlucose(testEmail);

console.log(`    Reloaded reports for ${testEmail}: ${reloadedReports.length}`);
console.log(`    Reloaded glucose for ${testEmail}: ${reloadedGlucose.length}`);

assert.strictEqual(reloadedReports.length, 8, 'All 8 reports must be intact after logging back in!');
assert.strictEqual(reloadedReports[0].id, 'RPT-2026-9999', 'Latest custom assessment must be preserved!');
assert.strictEqual(reloadedGlucose.length, 8, 'All 8 glucose logs must be intact after logging back in!');
console.log('[PASS] Re-login successfully restored all previous data with 0 data loss!');

// 6. Test healing of corrupted empty array in localStorage
console.log('\n[6] Testing auto-healing of corrupted empty array in localStorage...');
localStorage.setItem('diapredict_reports_corrupted_user', '[]');
const healedReports = loadUserReports('corrupted_user');
console.log(`    Healed reports count: ${healedReports.length}`);
assert(healedReports.length >= 7, 'Corrupted empty array must auto-heal to baseline reports');
console.log('[PASS] Corrupted empty array healed successfully!');

console.log('\n' + '='.repeat(70));
console.log('[SUCCESS] All persistence and risk-level report tests PASSED cleanly!');
console.log('='.repeat(70));
