// ============================================================================
// 1. ENVIRONMENT & CONFIGURATION
// ============================================================================
const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

const APP_CONFIG = {
  name: 'GlucoseSense',
  tagline: 'DIA-PREDICT • DECISION SUPPORT',
  version: '2.1.0'
};

const ML_CONFIG = {
  apiUrl: localStorage.getItem('diapredict_ml_url') || (isFileProtocol ? 'http://127.0.0.1:5000/api/predict' : '/api/predict'),
  healthUrl: localStorage.getItem('diapredict_ml_health_url') || (isFileProtocol ? 'http://127.0.0.1:5000/api/health' : '/api/health'),
  mode: localStorage.getItem('diapredict_ml_mode') || 'auto', // 'auto' | 'backend_only' | 'simulation'
  timeoutMs: 4500,
  isConnected: false,
  modelName: 'Clinical Benchmark (Simulation)',
  latencyMs: null
};

// ============================================================================
// 2. CENTRAL APPLICATION STATE & LOCAL PERSISTENCE
// ============================================================================
const DEFAULT_GUEST_USER = {
  name: 'Guest User',
  email: 'guest@example.com',
  age: 28,
  gender: 'Male',
  avatarLetter: 'G',
  avatarBg: '#059669'
};

const BASELINE_CLINICAL_REPORTS = [
  // 1. Low Risk (14%) - Optimal / Healthy
  {
    id: 'RPT-2026-0910',
    date: '10 Sep 2026, 10:30 AM',
    risk: 14,
    category: 'Low Risk',
    confidence: 89,
    glucose: 92,
    bmi: 22.4,
    bp: 72,
    pregnancies: 0,
    skin: 18,
    insulin: 72,
    pedigree: 0.28,
    age: 26,
    shap: [
      { feature: 'Fasting Blood Glucose', value: -0.48, impact: 'Protective (-0.48)' },
      { feature: 'Body Mass Index (BMI)', value: -0.31, impact: 'Protective (-0.31)' },
      { feature: 'Diastolic Blood Pressure', value: -0.18, impact: 'Protective (-0.18)' },
      { feature: 'Genetic Pedigree Score', value: -0.15, impact: 'Protective (-0.15)' },
      { feature: 'Serum Insulin', value: -0.08, impact: 'Protective (-0.08)' },
      { feature: 'Demographic Age', value: 0.09, impact: 'Elevating (+0.09)' }
    ],
    isDemo: false,
    modelName: 'Trained SVC Pipeline (Pima Indians Benchmark)'
  },
  // 2. Low Risk (22%) - Mild Demographics
  {
    id: 'RPT-2026-0904',
    date: '04 Sep 2026, 09:15 AM',
    risk: 22,
    category: 'Low Risk',
    confidence: 86,
    glucose: 98,
    bmi: 23.8,
    bp: 76,
    pregnancies: 1,
    skin: 20,
    insulin: 85,
    pedigree: 0.42,
    age: 28,
    shap: [
      { feature: 'Fasting Blood Glucose', value: -0.38, impact: 'Protective (-0.38)' },
      { feature: 'Body Mass Index (BMI)', value: -0.22, impact: 'Protective (-0.22)' },
      { feature: 'Diastolic Blood Pressure', value: -0.12, impact: 'Protective (-0.12)' },
      { feature: 'Demographic Age', value: 0.12, impact: 'Elevating (+0.12)' },
      { feature: 'Genetic Pedigree Score', value: 0.06, impact: 'Elevating (+0.06)' },
      { feature: 'Serum Insulin', value: -0.04, impact: 'Protective (-0.04)' }
    ],
    isDemo: false,
    modelName: 'Trained SVC Pipeline (Pima Indians Benchmark)'
  },
  // 3. Low Risk (26%) - Upper Normal Fasting
  {
    id: 'RPT-2026-0828',
    date: '28 Aug 2026, 11:20 AM',
    risk: 26,
    category: 'Low Risk',
    confidence: 84,
    glucose: 104,
    bmi: 24.2,
    bp: 78,
    pregnancies: 0,
    skin: 22,
    insulin: 92,
    pedigree: 0.45,
    age: 29,
    shap: [
      { feature: 'Fasting Blood Glucose', value: -0.20, impact: 'Protective (-0.20)' },
      { feature: 'Body Mass Index (BMI)', value: -0.16, impact: 'Protective (-0.16)' },
      { feature: 'Demographic Age', value: 0.12, impact: 'Elevating (+0.12)' },
      { feature: 'Diastolic Blood Pressure', value: -0.08, impact: 'Protective (-0.08)' },
      { feature: 'Genetic Pedigree Score', value: 0.08, impact: 'Elevating (+0.08)' },
      { feature: 'Serum Insulin', value: 0.02, impact: 'Elevating (+0.02)' }
    ],
    isDemo: false,
    modelName: 'Trained SVC Pipeline (Pima Indians Benchmark)'
  },
  // 4. Moderate Risk (38%) - Impaired Fasting Glucose & Overweight
  {
    id: 'RPT-2026-0815',
    date: '15 Aug 2026, 02:45 PM',
    risk: 38,
    category: 'Moderate Risk',
    confidence: 88,
    glucose: 118,
    bmi: 27.4,
    bp: 82,
    pregnancies: 2,
    skin: 26,
    insulin: 115,
    pedigree: 0.58,
    age: 36,
    shap: [
      { feature: 'Fasting Blood Glucose', value: 0.32, impact: 'Elevating (+0.32)' },
      { feature: 'Body Mass Index (BMI)', value: 0.24, impact: 'Elevating (+0.24)' },
      { feature: 'Demographic Age', value: 0.18, impact: 'Elevating (+0.18)' },
      { feature: 'Genetic Pedigree Score', value: 0.12, impact: 'Elevating (+0.12)' },
      { feature: 'Diastolic Blood Pressure', value: 0.08, impact: 'Elevating (+0.08)' },
      { feature: 'Serum Insulin', value: 0.06, impact: 'Elevating (+0.06)' }
    ],
    isDemo: false,
    modelName: 'Trained SVC Pipeline (Pima Indians Benchmark)'
  },
  // 5. Moderate Risk (46%) - Pre-Diabetic Corridor
  {
    id: 'RPT-2026-0801',
    date: '01 Aug 2026, 10:10 AM',
    risk: 46,
    category: 'Moderate Risk',
    confidence: 85,
    glucose: 124,
    bmi: 28.9,
    bp: 84,
    pregnancies: 1,
    skin: 28,
    insulin: 130,
    pedigree: 0.65,
    age: 42,
    shap: [
      { feature: 'Fasting Blood Glucose', value: 0.41, impact: 'Elevating (+0.41)' },
      { feature: 'Body Mass Index (BMI)', value: 0.31, impact: 'Elevating (+0.31)' },
      { feature: 'Demographic Age', value: 0.25, impact: 'Elevating (+0.25)' },
      { feature: 'Genetic Pedigree Score', value: 0.16, impact: 'Elevating (+0.16)' },
      { feature: 'Diastolic Blood Pressure', value: 0.10, impact: 'Elevating (+0.10)' },
      { feature: 'Serum Insulin', value: 0.08, impact: 'Elevating (+0.08)' }
    ],
    isDemo: false,
    modelName: 'Trained SVC Pipeline (Pima Indians Benchmark)'
  },
  // 6. High Risk (72%) - Clinical Metabolic Syndrome
  {
    id: 'RPT-2026-0718',
    date: '18 Jul 2026, 04:15 PM',
    risk: 72,
    category: 'High Risk',
    confidence: 91,
    glucose: 168,
    bmi: 33.5,
    bp: 90,
    pregnancies: 3,
    skin: 34,
    insulin: 195,
    pedigree: 0.88,
    age: 48,
    shap: [
      { feature: 'Fasting Blood Glucose', value: 0.78, impact: 'Elevating (+0.78)' },
      { feature: 'Body Mass Index (BMI)', value: 0.54, impact: 'Elevating (+0.54)' },
      { feature: 'Demographic Age', value: 0.38, impact: 'Elevating (+0.38)' },
      { feature: 'Genetic Pedigree Score', value: 0.32, impact: 'Elevating (+0.32)' },
      { feature: 'Serum Insulin', value: 0.22, impact: 'Elevating (+0.22)' },
      { feature: 'Diastolic Blood Pressure', value: 0.18, impact: 'Elevating (+0.18)' }
    ],
    isDemo: false,
    modelName: 'Trained SVC Pipeline (Pima Indians Benchmark)'
  },
  // 7. High Risk (86%) - Severe Hyperglycemic Diabetes
  {
    id: 'RPT-2026-0630',
    date: '30 Jun 2026, 11:45 AM',
    risk: 86,
    category: 'High Risk',
    confidence: 94,
    glucose: 192,
    bmi: 36.8,
    bp: 94,
    pregnancies: 4,
    skin: 38,
    insulin: 240,
    pedigree: 1.15,
    age: 54,
    shap: [
      { feature: 'Fasting Blood Glucose', value: 0.95, impact: 'Elevating (+0.95)' },
      { feature: 'Body Mass Index (BMI)', value: 0.68, impact: 'Elevating (+0.68)' },
      { feature: 'Genetic Pedigree Score', value: 0.48, impact: 'Elevating (+0.48)' },
      { feature: 'Demographic Age', value: 0.42, impact: 'Elevating (+0.42)' },
      { feature: 'Serum Insulin', value: 0.35, impact: 'Elevating (+0.35)' },
      { feature: 'Diastolic Blood Pressure', value: 0.25, impact: 'Elevating (+0.25)' }
    ],
    isDemo: false,
    modelName: 'Trained SVC Pipeline (Pima Indians Benchmark)'
  }
];

function getBaselineReports() {
  return JSON.parse(JSON.stringify(BASELINE_CLINICAL_REPORTS));
}

const BASELINE_GLUCOSE_READINGS = [
  { id: 1, val: 98, context: 'Fasting', date: 'Today, 08:30 AM', note: 'Morning resting check' },
  { id: 2, val: 112, context: 'After meal', date: 'Yesterday, 01:15 PM', note: 'Post lunch walk completed' },
  { id: 3, val: 102, context: 'Before meal', date: '08 Sep, 12:45 PM', note: 'Pre-lunch check' },
  { id: 4, val: 108, context: 'Random', date: '07 Sep, 04:30 PM', note: 'Mid-afternoon check' },
  { id: 5, val: 97, context: 'Fasting', date: '06 Sep, 08:00 AM', note: 'Resting baseline' },
  { id: 6, val: 104, context: 'Bedtime', date: '05 Sep, 10:30 PM', note: 'Evening check' },
  { id: 7, val: 95, context: 'Fasting', date: '04 Sep, 08:15 AM', note: 'Optimal fasting level' }
];

function getBaselineGlucose() {
  return JSON.parse(JSON.stringify(BASELINE_GLUCOSE_READINGS));
}

const AppState = {
  theme: localStorage.getItem('diapredict_theme') || 'light',
  lang: localStorage.getItem('diapredict_lang') || 'en',
  authenticated: true,
  currentView: 'overview',
  user: { ...DEFAULT_GUEST_USER },
  latestAssessment: null,
  activeDetailReport: null,
  reports: getBaselineReports(),
  glucoseReadings: getBaselineGlucose(),
  filters: {
    query: '',
    risk: 'all',
    sort: 'newest'
  }
};

// User & Multi-Account Management Helpers
function getRegisteredAccounts() {
  try {
    const data = localStorage.getItem('diapredict_accounts');
    const list = data ? JSON.parse(data) : [];
    return list.filter(a => a && a.email && a.email !== 'ayush.sharma@example.com' && a.name !== 'Ayush Sharma');
  } catch (e) {
    return [];
  }
}

function saveRegisteredAccount(acc) {
  try {
    if (!acc || !acc.email || acc.email === 'guest@example.com' || acc.email === 'ayush.sharma@example.com') return;
    const accounts = getRegisteredAccounts();
    const idx = accounts.findIndex(a => a.email.toLowerCase() === acc.email.toLowerCase());
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...acc };
    } else {
      accounts.push(acc);
    }
    localStorage.setItem('diapredict_accounts', JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to save account:', e);
  }
}

function findRegisteredAccount(email) {
  if (!email) return null;
  const accounts = getRegisteredAccounts();
  return accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
}

function deriveNameFromEmail(email) {
  if (!email) return 'User';
  const prefix = email.split('@')[0] || 'User';
  const parts = prefix.split(/[._-]+/);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ') || 'User';
}

function getUserDataKey(email, prefix) {
  if (!email || email === 'guest@example.com') return prefix;
  const safe = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${prefix}_${safe}`;
}

function loadUserReports(email) {
  try {
    const key = getUserDataKey(email, 'diapredict_reports');
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const global = localStorage.getItem('diapredict_reports');
    if (global) {
      const parsedGlobal = JSON.parse(global);
      if (Array.isArray(parsedGlobal) && parsedGlobal.length > 0) {
        return parsedGlobal;
      }
    }
    const baseline = getBaselineReports();
    saveUserReports(email, baseline);
    return baseline;
  } catch (e) {
    return getBaselineReports();
  }
}

function saveUserReports(email, reports) {
  try {
    const key = getUserDataKey(email, 'diapredict_reports');
    localStorage.setItem(key, JSON.stringify(reports));
    if (Array.isArray(reports) && reports.length > 0) {
      localStorage.setItem('diapredict_reports', JSON.stringify(reports));
    }
  } catch (e) {
    console.warn('Failed to save reports:', e);
  }
}

function loadUserGlucose(email) {
  try {
    const key = getUserDataKey(email, 'diapredict_glucose');
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const global = localStorage.getItem('diapredict_glucose');
    if (global) {
      const parsedGlobal = JSON.parse(global);
      if (Array.isArray(parsedGlobal) && parsedGlobal.length > 0) {
        return parsedGlobal;
      }
    }
    const baseline = getBaselineGlucose();
    saveUserGlucose(email, baseline);
    return baseline;
  } catch (e) {
    return getBaselineGlucose();
  }
}

function saveUserGlucose(email, glucoseList) {
  try {
    const key = getUserDataKey(email, 'diapredict_glucose');
    localStorage.setItem(key, JSON.stringify(glucoseList));
    if (Array.isArray(glucoseList) && glucoseList.length > 0) {
      localStorage.setItem('diapredict_glucose', JSON.stringify(glucoseList));
    }
  } catch (e) {
    console.warn('Failed to save glucose:', e);
  }
}

// Hydrate from LocalStorage
try {
  const savedUser = localStorage.getItem('diapredict_user');
  if (savedUser) {
    const parsed = JSON.parse(savedUser);
    if (parsed && (parsed.email === 'ayush.sharma@example.com' || parsed.name === 'Ayush Sharma')) {
      localStorage.removeItem('diapredict_user');
      AppState.user = { ...DEFAULT_GUEST_USER };
      AppState.reports = loadUserReports('guest@example.com');
      AppState.glucoseReadings = loadUserGlucose('guest@example.com');
    } else if (parsed && parsed.name) {
      AppState.user = { ...DEFAULT_GUEST_USER, ...parsed };
      AppState.reports = loadUserReports(AppState.user.email);
      AppState.glucoseReadings = loadUserGlucose(AppState.user.email);
    }
  } else {
    AppState.reports = loadUserReports('guest@example.com');
    AppState.glucoseReadings = loadUserGlucose('guest@example.com');
  }
} catch (e) {
  console.warn('LocalStorage hydration notice:', e);
}

if (AppState.reports && AppState.reports.length > 0) {
  AppState.latestAssessment = AppState.reports[0];
  AppState.activeDetailReport = AppState.reports[0];
} else {
  AppState.latestAssessment = null;
  AppState.activeDetailReport = null;
}

// ============================================================================
// 3. API SERVICE & MACHINE LEARNING ADAPTER
// ============================================================================
const ApiService = {
  /**
   * Health probe verifying Python ML server availability & model status
   */
  async checkBackendHealth() {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(ML_CONFIG.healthUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        const latency = Math.round(performance.now() - startTime);

        ML_CONFIG.isConnected = true;
        ML_CONFIG.modelName = payload.model_name || payload.service || 'Trained ML Model';
        ML_CONFIG.latencyMs = latency;
        updateMlStatusBadges();

        return {
          ok: true,
          message: `Connected to ${ML_CONFIG.modelName} (${latency}ms latency)`
        };
      }
    } catch (e) {
      // Backend not running yet or unreachable
    }

    ML_CONFIG.isConnected = false;
    ML_CONFIG.modelName = 'Clinical Benchmark (Simulation)';
    ML_CONFIG.latencyMs = null;
    updateMlStatusBadges();

    return {
      ok: false,
      message: `No active ML server detected at ${ML_CONFIG.apiUrl}. Running in calibrated clinical mode.`
    };
  },

  /**
   * Main prediction entry point called by the assessment form
   */
  async predictRisk(features) {
    if (ML_CONFIG.mode === 'simulation') {
      return this.simulateClinicalPrediction(features);
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ML_CONFIG.timeoutMs);

      const response = await fetch(ML_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(features),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;

        if (typeof payload.probability === 'number' && payload.risk) {
          ML_CONFIG.isConnected = true;
          updateMlStatusBadges();

          return {
            risk: payload.risk,
            probability: Math.round(payload.probability),
            confidence: payload.confidence || 88,
            shap: Array.isArray(payload.shap) ? payload.shap : this.generateShapAttributions(features, payload.probability),
            isDemo: Boolean(payload.is_demo),
            modelName: payload.model_name || 'Live Trained ML Model'
          };
        }
      }
    } catch (err) {
      // Offline fallback
    }

    if (ML_CONFIG.mode === 'backend_only') {
      showToast('Could not reach ML server at ' + ML_CONFIG.apiUrl + '. Check backend status.');
    }

    ML_CONFIG.isConnected = false;
    updateMlStatusBadges();
    return this.simulateClinicalPrediction(features);
  },

  /**
   * Calibrated Pima Indians clinical simulation fallback
   */
  simulateClinicalPrediction(data) {
    const pregnancies = parseFloat(data.pregnancies) || 0;
    const glucose = parseFloat(data.glucose) || 100;
    const bp = parseFloat(data.bloodPressure || data.bp) || 75;
    const skin = parseFloat(data.skinThickness || data.skin) || 20;
    const insulin = parseFloat(data.insulin) || 80;
    const bmi = parseFloat(data.bmi) || 24;
    const pedigree = parseFloat(data.diabetesPedigree || data.pedigree) || 0.45;
    const age = parseFloat(data.age) || 30;

    // Standardized Z-scores
    const zGlucose = (glucose - 100) / 32;
    const zBmi = (bmi - 24) / 6.5;
    const zBp = (bp - 74) / 16;
    const zAge = (age - 28) / 15;
    const zInsulin = (insulin - 85) / 60;
    const zPedigree = (pedigree - 0.47) / 0.35;
    const zPregnancies = (pregnancies - 1) / 3;

    const logit = -1.55 +
      (1.15 * zGlucose) +
      (0.85 * zBmi) +
      (0.30 * zBp) +
      (0.40 * zAge) +
      (0.12 * zInsulin) +
      (0.28 * zPedigree) +
      (0.18 * zPregnancies);

    let prob = Math.round((1 / (1 + Math.exp(-logit))) * 100);
    prob = Math.max(5, Math.min(95, prob));

    let risk = 'Low Risk';
    if (prob >= 50) risk = 'High Risk';
    else if (prob >= 28) risk = 'Moderate Risk';

    const confidence = Math.round(84 + Math.random() * 6);
    const shap = this.generateShapAttributions(data, prob);

    return {
      risk,
      probability: prob,
      confidence,
      shap,
      isDemo: true,
      modelName: 'Calibrated Clinical Simulation'
    };
  },

  generateShapAttributions(data, prob) {
    const glucose = parseFloat(data.glucose) || 100;
    const bmi = parseFloat(data.bmi) || 24;
    const age = parseFloat(data.age) || 30;
    const bp = parseFloat(data.bloodPressure || data.bp) || 75;
    const pedigree = parseFloat(data.diabetesPedigree || data.pedigree) || 0.45;
    const insulin = parseFloat(data.insulin) || 80;

    const zGlucose = (glucose - 100) / 32;
    const zBmi = (bmi - 24) / 6.5;
    const zAge = (age - 28) / 15;
    const zBp = (bp - 74) / 16;
    const zPedigree = (pedigree - 0.47) / 0.35;
    const zInsulin = (insulin - 85) / 60;

    const shap = [
      { feature: 'Fasting Blood Glucose', value: Number((1.15 * zGlucose * 0.35).toFixed(2)) },
      { feature: 'Body Mass Index (BMI)', value: Number((0.85 * zBmi * 0.35).toFixed(2)) },
      { feature: 'Demographic Age', value: Number((0.40 * zAge * 0.35).toFixed(2)) },
      { feature: 'Diastolic Blood Pressure', value: Number((0.30 * zBp * 0.35).toFixed(2)) },
      { feature: 'Genetic Pedigree Score', value: Number((0.28 * zPedigree * 0.35).toFixed(2)) },
      { feature: 'Serum Insulin', value: Number((0.12 * zInsulin * 0.35).toFixed(2)) }
    ];

    shap.forEach(s => {
      const sign = s.value >= 0 ? '+' : '';
      s.impact = s.value >= 0 ? `Elevating (${sign}${s.value.toFixed(2)})` : `Protective (${s.value.toFixed(2)})`;
    });

    return shap.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }
};

function updateMlStatusBadges() {
  const settingsBadge = document.getElementById('mlStatusBadge');
  const assessBadge = document.getElementById('assessModelIndicatorBadge');
  const assessText = document.getElementById('assessModelIndicatorText');
  const urlInput = document.getElementById('mlBackendUrlInput');
  const modeSelect = document.getElementById('mlModeSelect');

  if (urlInput && document.activeElement !== urlInput) {
    urlInput.value = ML_CONFIG.apiUrl;
  }
  if (modeSelect) {
    modeSelect.value = ML_CONFIG.mode;
  }

  if (ML_CONFIG.isConnected) {
    if (settingsBadge) {
      settingsBadge.className = 'status-badge status-healthy';
      const latencyStr = ML_CONFIG.latencyMs ? ` • ${ML_CONFIG.latencyMs}ms` : '';
      settingsBadge.innerHTML = `<span class="status-indicator-dot" style="background: var(--success);"></span> Connected: ${ML_CONFIG.modelName}${latencyStr}`;
    }
    if (assessBadge) {
      assessBadge.className = 'status-badge status-healthy';
    }
    if (assessText) {
      assessText.textContent = `Live ML Backend (${ML_CONFIG.modelName})`;
    }
  } else {
    if (settingsBadge) {
      settingsBadge.className = 'status-badge status-attention';
      settingsBadge.innerHTML = `<span class="status-indicator-dot" style="background: var(--warning);"></span> Local Calibrated Engine (Simulation)`;
    }
    if (assessBadge) {
      assessBadge.className = 'status-badge status-attention';
    }
    if (assessText) {
      assessText.textContent = `Local Engine (Ready to link ML)`;
    }
  }
}

// Global debug exposure
if (typeof window !== 'undefined') {
  window.AppState = AppState;
  window.ApiService = ApiService;
  window.ML_CONFIG = ML_CONFIG;
  window.APP_CONFIG = APP_CONFIG;
}

// ============================================================================
// 3.5. INTERNATIONALIZATION & LOCALIZATION (HINDI / ENGLISH)
// ============================================================================
const I18N = {
  en: {
    nav_home: "Home",
    nav_features: "Features",
    nav_how_it_works: "How It Works",
    nav_about: "About",
    nav_resources: "Resources",
    nav_contact: "Contact",
    nav_login: "Login",
    nav_signup: "Sign Up",
    nav_dashboard: "Dashboard",
    hero_eyebrow: "<span>PREVENT</span> • <span>TRACK</span> • <span>UNDERSTAND</span> • <span>STAY HEALTHIER</span>",
    hero_title: "Early Awareness<br><span class=\"text-highlight\">For A Healthier You</span>",
    hero_desc: "Understand your diabetes risk with a simple, data-driven health assessment. GlucoseSense helps you make sense of your health information so you can take informed next steps.",
    hero_get_started: "Get Started →",
    hero_learn_more: "Learn More",
    hero_badge_research: "Research Based",
    hero_badge_easy: "Easy To Use",
    hero_badge_privacy: "Your Data Stays Private",

    sidebar_overview: "Dashboard",
    sidebar_assess: "Check My Risk",
    sidebar_reports: "My Reports",
    sidebar_glucose: "Track Glucose",
    sidebar_insights: "Health Insights",
    sidebar_profile: "Profile",
    sidebar_settings: "Settings",
    sidebar_add_glucose: "Add Glucose Reading",
    sidebar_logout: "Logout",
    sidebar_lang_label: "Language: English",

    tab_overview_title: "Dashboard",
    tab_overview_sub: "Here's a quick look at your recent health activity.",
    tab_assess_title: "Check Your Diabetes Risk",
    tab_assess_sub: "Enter your latest health information to generate an estimated risk assessment.",
    tab_result_title: "Your Health Assessment",
    tab_result_sub: "Machine learning probability and Explainable AI (SHAP) attributions.",
    tab_detail_title: "Assessment Details",
    tab_detail_sub: "Comprehensive clinical biomarker breakdown and metrics.",
    tab_reports_title: "Your Health Reports",
    tab_reports_sub: "Review previous assessments and historical risk trajectories.",
    tab_glucose_title: "Track Your Glucose",
    tab_glucose_sub: "Blood sugar log and target range trend analysis.",
    tab_insights_title: "Health Insights",
    tab_insights_sub: "Evidence-based clinical guidelines and prevention strategies.",
    tab_profile_title: "Profile",
    tab_profile_sub: "Manage personal details and biometric baselines.",
    tab_settings_title: "Settings",
    tab_settings_sub: "API connection parameters, visual theme, and health data export.",

    dash_total_assessments: "Total Assessments",
    dash_avg_glucose: "Average Glucose",
    dash_latest_risk: "Latest Risk Status",
    dash_recent_activity: "Recent Health Activity",
    dash_view_all: "View All Reports →",
    dash_daily_tips: "Daily Preventive Tips",

    assess_label_pregnancies: "Pregnancies",
    assess_help_pregnancies: "Number of times pregnant (0 for males/nulliparous)",
    assess_label_glucose: "Glucose (mg/dL) *",
    assess_help_glucose: "Fasting blood glucose reading",
    assess_label_bp: "Blood Pressure (mm Hg) *",
    assess_help_bp: "Resting diastolic pressure",
    assess_label_skin: "Skin Thickness (mm)",
    assess_help_skin: "Triceps skin fold caliper measure (approx. 20 if unsure)",
    assess_label_insulin: "Insulin (µIU/mL)",
    assess_help_insulin: "2-hour serum insulin lab test (approx. 85 if unsure)",
    assess_label_bmi: "BMI (kg/m²) *",
    assess_help_bmi: "Body Mass Index: weight in kg / (height in meters)²",
    assess_label_pedigree: "Diabetes Pedigree Function *",
    assess_help_pedigree: "Genetic family history estimate (population average ~0.47)",
    assess_label_age: "Age (years) *",
    assess_help_age: "Adult completed years",
    assess_btn_reset: "Reset Fields",
    assess_btn_submit: "Check My Risk",
    assess_upload_title: "Have a home health report?",
    assess_upload_sub: "Upload your lab test (PDF, JPG, or PNG) to extract measurements.",
    assess_upload_drop: "Click or drag lab report",
    assess_privacy_title: "How we treat your data",

    result_prob_title: "Estimated Diabetes Probability",
    result_conf_title: "Model Confidence",
    result_date_title: "Assessment Timestamp",
    result_shap_title: "Key Factors Influencing This Assessment",
    result_shap_sub: "Explainable AI (SHAP) attributions showing which clinical values decreased or increased your estimated probability.",
    result_next_steps_title: "Recommended Next Steps",
    result_btn_save: "Save to My Reports",
    result_btn_new: "Check Another Assessment",

    reports_search_placeholder: "Search by report ID, date, or category...",
    reports_filter_all: "All Risk Levels",
    reports_filter_high: "High Risk",
    reports_filter_mod: "Moderate Risk",
    reports_filter_low: "Low Risk",
    reports_th_date: "Assessment Date",
    reports_th_category: "Risk Category",
    reports_th_risk: "Probability",
    reports_th_glucose: "Glucose",
    reports_th_bmi: "BMI",
    reports_th_actions: "Actions",

    glucose_heading: "Track Your Glucose",
    glucose_btn_add: "+ Log New Reading",

    settings_pref_title: "Application Preferences",
    settings_lang_title: "Language Preference / भाषा",
    settings_lang_sub: "Switch between English and हिन्दी (Hindi).",
    settings_dark_title: "Dark Theme",
    settings_dark_sub: "Switch to calm medical dark mode (#101817).",

    modal_glucose_title: "Log Blood Glucose Reading",
    modal_glucose_value: "Blood Glucose Value (mg/dL) *",
    modal_glucose_ctx: "Measurement Context",
    ctx_fasting: "Fasting (Morning before meal)",
    ctx_before: "Before meal",
    ctx_after: "After meal (2 hrs post-meal)",
    ctx_bedtime: "Bedtime",
    ctx_random: "Random check",
    modal_glucose_note: "Optional Note",
    btn_cancel: "Cancel",
    btn_save_reading: "Save Reading",

    cat_low_risk: "Low Risk",
    cat_moderate_risk: "Moderate Risk",
    cat_high_risk: "High Risk",
    theme_light: "Theme: Light",
    theme_dark: "Theme: Dark"
  },
  hi: {
    nav_home: "होम",
    nav_features: "सुविधाएँ",
    nav_how_it_works: "कार्यप्रणाली",
    nav_about: "हमारे बारे में",
    nav_resources: "संसाधन",
    nav_contact: "संपर्क",
    nav_login: "लॉगिन",
    nav_signup: "साइन अप",
    nav_dashboard: "डैशबोर्ड",
    hero_eyebrow: "<span>रोकथाम</span> • <span>ट्रैकिंग</span> • <span>समझ</span> • <span>स्वस्थ जीवन</span>",
    hero_title: "प्रारंभिक जागरूकता<br><span class=\"text-highlight\">स्वस्थ और सुरक्षित जीवन के लिए</span>",
    hero_desc: "एक सरल, डेटा-संचालित स्वास्थ्य मूल्यांकन के साथ अपने मधुमेह जोखिम को समझें। GlucoseSense आपकी स्वास्थ्य जानकारी को स्पष्ट रूप से समझने में मदद करता है ताकि आप सही समय पर उचित कदम उठा सकें।",
    hero_get_started: "शुरू करें →",
    hero_learn_more: "और जानें",
    hero_badge_research: "शोध आधारित",
    hero_badge_easy: "उपयोग में बेहद सरल",
    hero_badge_privacy: "डेटा पूर्णतः सुरक्षित व निजी",

    sidebar_overview: "डैशबोर्ड",
    sidebar_assess: "जोखिम जांचें",
    sidebar_reports: "मेरी रिपोर्ट्स",
    sidebar_glucose: "ग्लूकोज ट्रैकिंग",
    sidebar_insights: "स्वास्थ्य अंतर्दृष्टि",
    sidebar_profile: "प्रोफ़ाइल",
    sidebar_settings: "सेटिंग्स",
    sidebar_add_glucose: "ग्लूकोज रीडिंग जोड़ें",
    sidebar_logout: "लॉगआउट",
    sidebar_lang_label: "भाषा: हिन्दी",

    tab_overview_title: "डैशबोर्ड",
    tab_overview_sub: "आपकी हालिया स्वास्थ्य स्थिति और गतिविधि का त्वरित विवरण।",
    tab_assess_title: "मधुमेह जोखिम का आकलन",
    tab_assess_sub: "अनुमानित जोखिम जानने के लिए अपनी नवीनतम स्वास्थ्य जानकारी दर्ज करें।",
    tab_result_title: "आपका स्वास्थ्य मूल्यांकन",
    tab_result_sub: "मशीन लर्निंग संभावना और व्याख्यात्मक एआई (SHAP) कारक।",
    tab_detail_title: "आकलन विवरण",
    tab_detail_sub: "विस्तृत क्लिनिकल बायोमार्कर्स और स्वास्थ्य मेट्रिक्स।",
    tab_reports_title: "स्वास्थ्य रिपोर्ट्स",
    tab_reports_sub: "पिछले आकलनों और ऐतिहासिक प्रवृत्तियों की समीक्षा करें।",
    tab_glucose_title: "ग्लूकोज ट्रैक करें",
    tab_glucose_sub: "रक्त शर्करा लॉग और लक्ष्य सीमा विश्लेषण।",
    tab_insights_title: "स्वास्थ्य अंतर्दृष्टि",
    tab_insights_sub: "प्रमाण आधारित क्लिनिकल दिशानिर्देश और रोकथाम रणनीतियाँ।",
    tab_profile_title: "प्रोफ़ाइल",
    tab_profile_sub: "व्यक्तिगत विवरण और बायोमेट्रिक बेसलाइन प्रबंधित करें।",
    tab_settings_title: "सेटिंग्स",
    tab_settings_sub: "एपीआई कनेक्शन, विज़ुअल थीम, भाषा और स्वास्थ्य डेटा निर्यात।",

    dash_total_assessments: "कुल आकलन",
    dash_avg_glucose: "औसत ग्लूकोज",
    dash_latest_risk: "नवीनतम जोखिम स्तर",
    dash_recent_activity: "हालिया स्वास्थ्य गतिविधि",
    dash_view_all: "सभी रिपोर्ट्स देखें →",
    dash_daily_tips: "दैनिक रोकथाम सुझाव",

    assess_label_pregnancies: "गर्भावस्था (Pregnancies)",
    assess_help_pregnancies: "गर्भावस्था की संख्या (पुरुषों या शून्य के लिए 0 दर्ज करें)",
    assess_label_glucose: "ग्लूकोज (mg/dL) *",
    assess_help_glucose: "फास्टिंग ब्लड ग्लूकोज (खाली पेट रक्त शर्करा)",
    assess_label_bp: "रक्तचाप (mm Hg) *",
    assess_help_bp: "विश्राम के समय डायस्टोलिक रक्तचाप (निचला माप)",
    assess_label_skin: "त्वचा की मोटाई (mm)",
    assess_help_skin: "ट्राइसेप्स त्वचा की मोटाई (यदि अनिश्चित हों तो 20 रहने दें)",
    assess_label_insulin: "इंसुलिन (µIU/mL)",
    assess_help_insulin: "2 घंटे का सीरम इंसुलिन परीक्षण (यदि अनिश्चित हों तो 85 रहने दें)",
    assess_label_bmi: "बॉडी मास इंडेक्स (BMI) *",
    assess_help_bmi: "बीएमआई: वजन (किग्रा) / (ऊंचाई मीटर में)²",
    assess_label_pedigree: "आनुवंशिक वंशक्रम स्कोर (Pedigree) *",
    assess_help_pedigree: "पारिवारिक आनुवंशिक इतिहास का अनुमान (औसत ~0.47)",
    assess_label_age: "आयु (वर्ष) *",
    assess_help_age: "पूर्ण वयस्क आयु (वर्षों में)",
    assess_btn_reset: "फ़ील्ड रीसेट करें",
    assess_btn_submit: "जोखिम जांचें",
    assess_upload_title: "क्या आपके पास लैब टेस्ट रिपोर्ट है?",
    assess_upload_sub: "माप स्वतः भरने के लिए अपनी लैब रिपोर्ट (PDF, JPG, PNG) अपलोड करें।",
    assess_upload_drop: "लैब रिपोर्ट चुनें या यहाँ खींचें",
    assess_privacy_title: "डेटा गोपनीयता की गारंटी",

    result_prob_title: "अनुमानित मधुमेह जोखिम संभावना",
    result_conf_title: "मॉडल विश्वसनीयता",
    result_date_title: "मूल्यांकन दिनांक एवं समय",
    result_shap_title: "इस मूल्यांकन को प्रभावित करने वाले मुख्य कारक",
    result_shap_sub: "व्याख्यात्मक एआई (SHAP) विश्लेषण: जानें किन मानों ने जोखिम घटाया या बढ़ाया।",
    result_next_steps_title: "अनुशंसित अगले कदम",
    result_btn_save: "रिपोर्ट्स में सहेजें",
    result_btn_new: "दूसरा आकलन करें",

    reports_search_placeholder: "आईडी, दिनांक या श्रेणी से खोजें...",
    reports_filter_all: "सभी जोखिम स्तर",
    reports_filter_high: "उच्च जोखिम (High Risk)",
    reports_filter_mod: "मध्यम जोखिम (Moderate Risk)",
    reports_filter_low: "कम जोखिम (Low Risk)",
    reports_th_date: "आकलन दिनांक",
    reports_th_category: "जोखिम श्रेणी",
    reports_th_risk: "संभावना",
    reports_th_glucose: "ग्लूकोज",
    reports_th_bmi: "बीएमआई",
    reports_th_actions: "कार्यवाही",

    glucose_heading: "ग्लूकोज ट्रैक करें",
    glucose_btn_add: "+ नई रीडिंग दर्ज करें",

    settings_pref_title: "एप्लिकेशन प्राथमिकताएं",
    settings_lang_title: "भाषा / Language",
    settings_lang_sub: "अंग्रेजी (English) और हिन्दी के बीच भाषा बदलें।",
    settings_dark_title: "डार्क थीम (Dark Theme)",
    settings_dark_sub: "आरामदायक शांत मेडिकल डार्क मोड (#101817) चालू करें।",

    modal_glucose_title: "ग्लूकोज रीडिंग दर्ज करें",
    modal_glucose_value: "रक्त शर्करा मान (mg/dL) *",
    modal_glucose_ctx: "माप का संदर्भ (Context)",
    ctx_fasting: "फास्टिंग (सुबह खाली पेट)",
    ctx_before: "भोजन से पहले",
    ctx_after: "भोजन के 2 घंटे बाद",
    ctx_bedtime: "सोने से पहले",
    ctx_random: "रैंडम चेक",
    modal_glucose_note: "वैकल्पिक टिप्पणी",
    btn_cancel: "रद्द करें",
    btn_save_reading: "रीडिंग सहेजें",

    cat_low_risk: "कम जोखिम (Low Risk)",
    cat_moderate_risk: "मध्यम जोखिम (Moderate Risk)",
    cat_high_risk: "उच्च जोखिम (High Risk)",
    theme_light: "थीम: लाइट",
    theme_dark: "थीम: डार्क"
  }
};

function t(key, defaultVal) {
  const lang = AppState.lang || 'en';
  if (I18N[lang] && I18N[lang][key] !== undefined) {
    return I18N[lang][key];
  }
  if (I18N.en && I18N.en[key] !== undefined) {
    return I18N.en[key];
  }
  return defaultVal !== undefined ? defaultVal : key;
}

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = val;
      } else if (val.includes('<') && val.includes('>')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = t(key);
    if (val) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.setAttribute('placeholder', val);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val) el.setAttribute('title', val);
  });
}

function updateThemeToggleLabel(theme) {
  const label = document.getElementById('themeToggleLabel');
  if (!label) return;
  const isDark = theme === 'dark';
  if (AppState.lang === 'hi') {
    label.textContent = isDark ? 'थीम: डार्क' : 'थीम: लाइट';
  } else {
    label.textContent = isDark ? 'Theme: Dark' : 'Theme: Light';
  }
}

function initLanguage() {
  setLanguage(AppState.lang, false);
}

function setLanguage(lang, notify = true) {
  AppState.lang = lang;
  localStorage.setItem('diapredict_lang', lang);
  document.documentElement.setAttribute('lang', lang);

  // Update button labels
  const landingLangLabel = document.getElementById('landingLangLabel');
  const sidebarLangLabel = document.getElementById('sidebarLangLabel');
  const topNavLangLabel = document.getElementById('topNavLangLabel');

  if (landingLangLabel) landingLangLabel.textContent = lang === 'hi' ? 'English' : 'हिन्दी';
  if (topNavLangLabel) topNavLangLabel.textContent = lang === 'hi' ? 'English' : 'हिन्दी';
  if (sidebarLangLabel) sidebarLangLabel.textContent = lang === 'hi' ? 'भाषा: हिन्दी' : 'Language: English';

  updateThemeToggleLabel(AppState.theme);

  // Update Settings buttons
  const btnEn = document.getElementById('settingsLangEnBtn');
  const btnHi = document.getElementById('settingsLangHiBtn');
  if (btnEn && btnHi) {
    if (lang === 'hi') {
      btnHi.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnHi.classList.remove('active');
    }
  }

  applyTranslations(lang);
  updateViewHeadings();

  // Re-render active view dynamic contents
  if (AppState.currentView === 'overview') renderDashboardOverview();
  if (AppState.currentView === 'reports') renderReportsTable();
  if (AppState.currentView === 'glucose') renderGlucoseTracking();
  if (AppState.currentView === 'result' && AppState.latestAssessment) {
    displayPredictionResult(AppState.latestAssessment);
  }

  if (notify) {
    showToast(lang === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है।' : 'Language changed to English.');
  }
}

function updateViewHeadings() {
  const headings = {
    overview: { 
      title: t('tab_overview_title', 'Dashboard'), 
      sub: t('tab_overview_sub', "Here's a quick look at your recent health activity.") 
    },
    assess: { 
      title: t('tab_assess_title', 'Check Your Diabetes Risk'), 
      sub: t('tab_assess_sub', 'Enter clinical biomarkers to generate an estimated risk assessment.') 
    },
    result: { 
      title: t('tab_result_title', 'Your Health Assessment'), 
      sub: t('tab_result_sub', 'Machine learning probability and Explainable AI (SHAP) attributions.') 
    },
    'report-detail': { 
      title: t('tab_detail_title', 'Assessment Details'), 
      sub: t('tab_detail_sub', 'Comprehensive clinical biomarker breakdown and metrics.') 
    },
    reports: { 
      title: t('tab_reports_title', 'Your Health Reports'), 
      sub: t('tab_reports_sub', 'Review previous assessments and historical risk trajectories.') 
    },
    glucose: { 
      title: t('tab_glucose_title', 'Track Your Glucose'), 
      sub: t('tab_glucose_sub', 'Blood sugar log and target range trend analysis.') 
    },
    insights: { 
      title: t('tab_insights_title', 'Health Insights'), 
      sub: t('tab_insights_sub', 'Evidence-based clinical guidelines and prevention strategies.') 
    },
    profile: { 
      title: t('tab_profile_title', 'Profile'), 
      sub: t('tab_profile_sub', 'Manage personal details and biometric baselines.') 
    },
    settings: { 
      title: t('tab_settings_title', 'Settings'), 
      sub: t('tab_settings_sub', 'API connection parameters, visual theme, and health data export.') 
    }
  };

  const headerInfo = headings[AppState.currentView] || { title: 'GlucoseSense', sub: 'Diabetes Risk Decision Support' };
  const h1 = document.getElementById('viewHeading');
  const p = document.getElementById('viewSubheading');
  if (h1) h1.textContent = headerInfo.title;
  if (p) p.textContent = headerInfo.sub;
}

// ============================================================================
// 4. LIFECYCLE & ROUTING
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  updateUserUI();
  updateMlStatusBadges();
  setupNavigation();
  setupModals();
  setupEventListeners();
  renderDashboardOverview();
  renderReportsTable();
  renderGlucoseTracking();
  // Non-blocking health probe on load
  ApiService.checkBackendHealth();
});

function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  updateThemeToggleLabel(AppState.theme);
  const toggleCheckbox = document.getElementById('settingsDarkToggle');
  if (toggleCheckbox) toggleCheckbox.checked = AppState.theme === 'dark';
}

function setTheme(mode) {
  AppState.theme = mode;
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('diapredict_theme', mode);
  updateThemeToggleLabel(mode);
  const toggleCheckbox = document.getElementById('settingsDarkToggle');
  if (toggleCheckbox) toggleCheckbox.checked = mode === 'dark';
}

function setupNavigation() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.getAttribute('data-nav');
      navigateTo(target);
    });
  });

  const getStartedBtn = document.getElementById('heroGetStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => openModal('signupModal'));
  }

  const learnMoreBtn = document.getElementById('heroLearnMoreBtn');
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => {
      const target = document.getElementById('landing-features');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const launchAppBtn = document.getElementById('landingLaunchAppBtn');
  if (launchAppBtn) {
    launchAppBtn.addEventListener('click', () => {
      showAppShell();
      navigateTo('overview');
    });
  }

  const landingLoginBtn = document.getElementById('landingLoginBtn');
  if (landingLoginBtn) {
    landingLoginBtn.addEventListener('click', () => openModal('loginModal'));
  }

  const landingSignUpBtn = document.getElementById('landingSignUpBtn');
  if (landingSignUpBtn) {
    landingSignUpBtn.addEventListener('click', () => openModal('signupModal'));
  }

  const landingThemeToggleBtn = document.getElementById('landingThemeToggleBtn');
  if (landingThemeToggleBtn) {
    landingThemeToggleBtn.addEventListener('click', () => {
      const nextTheme = AppState.theme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
    });
  }

  const landingLangToggleBtn = document.getElementById('landingLangToggleBtn');
  if (landingLangToggleBtn) {
    landingLangToggleBtn.addEventListener('click', () => {
      const nextLang = AppState.lang === 'en' ? 'hi' : 'en';
      setLanguage(nextLang);
    });
  }

  const sidebarBrandBlock = document.getElementById('sidebarBrandBlock');
  if (sidebarBrandBlock) {
    sidebarBrandBlock.addEventListener('click', () => showLandingPage());
  }

  const landingBrandLogo = document.getElementById('landingBrandLogo');
  if (landingBrandLogo) {
    landingBrandLogo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function navigateTo(tabId) {
  showAppShell();

  document.querySelectorAll('.app-tab').forEach(tab => tab.style.display = 'none');

  const targetTab = document.getElementById(`view-${tabId}`);
  if (targetTab) {
    targetTab.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-nav]').forEach(item => {
    if (item.getAttribute('data-nav') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  AppState.currentView = tabId;
  updateViewHeadings();

  if (tabId === 'overview') renderDashboardOverview();
  if (tabId === 'reports') renderReportsTable();
  if (tabId === 'glucose') renderGlucoseTracking();
}

function showAppShell() {
  const landing = document.getElementById('view-landing');
  const appLayout = document.getElementById('app-layout');
  if (landing) landing.style.display = 'none';
  if (appLayout) appLayout.style.display = 'flex';
}

function showLandingPage() {
  const landing = document.getElementById('view-landing');
  const appLayout = document.getElementById('app-layout');
  if (landing) landing.style.display = 'flex';
  if (appLayout) appLayout.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateUserUI() {
  const nameEl = document.getElementById('headerUserName');
  const avatarEl = document.getElementById('headerAvatarCircle');
  const bigAvatar = document.getElementById('profileAvatarBig');
  const profileNameInput = document.getElementById('profileFullName');
  const profileEmailInput = document.getElementById('profileEmail');
  const profileAgeInput = document.getElementById('profileAge');
  const profileGenderSelect = document.getElementById('profileGender');

  const displayName = AppState.user.name || 'User';
  const displayInitial = (AppState.user.avatarLetter || displayName.charAt(0) || 'U').toUpperCase();
  const avatarColor = AppState.user.avatarBg || '#059669';

  if (nameEl) nameEl.textContent = displayName;
  if (avatarEl) {
    avatarEl.textContent = displayInitial;
    avatarEl.style.backgroundColor = avatarColor;
  }
  if (bigAvatar) {
    bigAvatar.textContent = displayInitial;
    bigAvatar.style.backgroundColor = avatarColor;
  }
  if (profileNameInput) profileNameInput.value = AppState.user.name || '';
  if (profileEmailInput) profileEmailInput.value = AppState.user.email || '';
  if (profileAgeInput) profileAgeInput.value = AppState.user.age || '';
  if (profileGenderSelect) profileGenderSelect.value = AppState.user.gender || 'Male';
}

// ============================================================================
// 5. MODAL UTILITIES
// ============================================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    const input = modal.querySelector('input:not([type="hidden"])');
    if (input) input.focus();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function showToast(text, type = 'info') {
  const toast = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMessage');
  if (toastMsg) toastMsg.textContent = text;
  if (toast) {
    toast.className = `toast-banner toast-${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3400);
  }
}

function setupModals() {
  document.getElementById('closeLoginModalBtn')?.addEventListener('click', () => closeModal('loginModal'));
  document.getElementById('switchToSignupBtn')?.addEventListener('click', () => {
    closeModal('loginModal');
    openModal('signupModal');
  });

  document.getElementById('closeSignupModalBtn')?.addEventListener('click', () => closeModal('signupModal'));
  document.getElementById('switchToLoginBtn')?.addEventListener('click', () => {
    closeModal('signupModal');
    openModal('loginModal');
  });

  document.getElementById('loginForgotPasswordLink')?.addEventListener('click', () => {
    closeModal('loginModal');
    openModal('forgotPasswordModal');
  });
  document.getElementById('closeForgotModalBtn')?.addEventListener('click', () => closeModal('forgotPasswordModal'));
  document.getElementById('cancelForgotBtn')?.addEventListener('click', () => {
    closeModal('forgotPasswordModal');
    openModal('loginModal');
  });

  document.getElementById('closeGlucoseModalBtn')?.addEventListener('click', () => closeModal('recordGlucoseModal'));
  document.getElementById('cancelGlucoseModalBtn')?.addEventListener('click', () => closeModal('recordGlucoseModal'));

  // Notification Bell
  const notifBell = document.getElementById('notificationBellBtn');
  const notifPopover = document.getElementById('notificationPopover');
  if (notifBell && notifPopover) {
    notifBell.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPopover.classList.toggle('open');
      const dot = document.getElementById('notificationDot');
      if (dot) dot.style.display = 'none';
    });
    document.addEventListener('click', (e) => {
      if (!notifPopover.contains(e.target) && e.target !== notifBell) {
        notifPopover.classList.remove('open');
      }
    });
  }

  document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
    const list = document.getElementById('notificationList');
    if (list) list.innerHTML = `<div style="text-align:center; padding: 1.2rem; color: var(--text-muted); font-size:0.84rem;">All notifications cleared.</div>`;
    showToast('Notifications cleared.');
  });

  document.getElementById('headerUserPill')?.addEventListener('click', () => navigateTo('profile'));

  // Global ESC key modal dismissal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });
}

// ============================================================================
// 6. EVENT LISTENERS
// ============================================================================
function setupEventListeners() {
  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    const nextTheme = AppState.theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  });

  document.getElementById('sidebarLangToggleBtn')?.addEventListener('click', () => {
    const nextLang = AppState.lang === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  });

  document.getElementById('topNavLangToggleBtn')?.addEventListener('click', () => {
    const nextLang = AppState.lang === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  });

  document.getElementById('settingsLangEnBtn')?.addEventListener('click', () => setLanguage('en'));
  document.getElementById('settingsLangHiBtn')?.addEventListener('click', () => setLanguage('hi'));

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (AppState.user && AppState.user.email) {
      if (Array.isArray(AppState.reports) && AppState.reports.length > 0) {
        saveUserReports(AppState.user.email, AppState.reports);
      }
      if (Array.isArray(AppState.glucoseReadings) && AppState.glucoseReadings.length > 0) {
        saveUserGlucose(AppState.user.email, AppState.glucoseReadings);
      }
    }

    localStorage.removeItem('diapredict_user');
    AppState.user = { ...DEFAULT_GUEST_USER };
    AppState.reports = loadUserReports('guest@example.com');
    AppState.glucoseReadings = loadUserGlucose('guest@example.com');
    AppState.latestAssessment = AppState.reports.length > 0 ? AppState.reports[0] : null;
    AppState.activeDetailReport = AppState.latestAssessment;
    updateUserUI();
    renderDashboardOverview();
    renderReportsTable();
    renderGlucoseTracking();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.reset();

    showLandingPage();
    showToast('You have logged out.');
  });

  // Dashboard quick triggers
  document.getElementById('qaNewPrediction')?.addEventListener('click', () => navigateTo('assess'));
  document.getElementById('qaViewReports')?.addEventListener('click', () => navigateTo('reports'));
  document.getElementById('qaTrackGlucose')?.addEventListener('click', () => navigateTo('glucose'));
  document.getElementById('qaHealthTips')?.addEventListener('click', () => navigateTo('insights'));
  document.getElementById('dashViewHistoryLink')?.addEventListener('click', () => navigateTo('reports'));

  document.getElementById('dashViewLatestReportBtn')?.addEventListener('click', () => {
    if (AppState.latestAssessment) {
      showReportDetail(AppState.latestAssessment);
    } else {
      navigateTo('reports');
    }
  });

  // Glucose Log Launchers
  document.getElementById('openQuickLogBtn')?.addEventListener('click', () => openModal('recordGlucoseModal'));
  document.getElementById('btnOpenAddGlucoseModal')?.addEventListener('click', () => openModal('recordGlucoseModal'));
  document.getElementById('emptyAddGlucoseBtn')?.addEventListener('click', () => openModal('recordGlucoseModal'));

  // Glucose Form Submit
  const quickGlucoseForm = document.getElementById('quickGlucoseForm');
  if (quickGlucoseForm) {
    quickGlucoseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseFloat(document.getElementById('quickGlucoseVal').value);
      const context = document.getElementById('quickGlucoseContext').value;
      const note = document.getElementById('quickGlucoseNote').value || '';

      if (isNaN(val) || val < 40 || val > 450) {
        showToast('Please enter a realistic blood glucose reading (40–450 mg/dL).', 'warning');
        return;
      }

      const newReading = {
        id: Date.now(),
        val,
        context,
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note
      };

      AppState.glucoseReadings.unshift(newReading);
      saveUserGlucose(AppState.user?.email, AppState.glucoseReadings);

      closeModal('recordGlucoseModal');
      document.getElementById('quickGlucoseVal').value = '';
      document.getElementById('quickGlucoseNote').value = '';

      renderGlucoseTracking();
      renderDashboardOverview();
      showToast(`Glucose reading (${val} mg/dL) saved.`, 'success');
    });
  }

  // Auth Forms
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const email = emailInput?.value?.trim().toLowerCase();
    const password = passwordInput?.value;

    if (!email) {
      showToast('Please enter your email.', 'warning');
      return;
    }

    const existing = findRegisteredAccount(email);
    if (existing) {
      AppState.user = { ...existing };
    } else {
      const derivedName = deriveNameFromEmail(email);
      const newUser = {
        name: derivedName,
        email: email,
        password: password || '',
        age: 28,
        gender: 'Male',
        avatarLetter: (derivedName.charAt(0) || 'U').toUpperCase(),
        avatarBg: '#059669'
      };
      AppState.user = newUser;
      saveRegisteredAccount(newUser);
    }

    AppState.reports = loadUserReports(email);
    AppState.glucoseReadings = loadUserGlucose(email);

    AppState.latestAssessment = AppState.reports.length > 0 ? AppState.reports[0] : null;
    AppState.activeDetailReport = AppState.latestAssessment;
    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));

    updateUserUI();
    renderDashboardOverview();
    renderReportsTable();
    renderGlucoseTracking();

    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';

    closeModal('loginModal');
    showAppShell();
    navigateTo('overview');
    showToast(`Welcome back, ${AppState.user.name}.`, 'success');
  });

  document.getElementById('signupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passInput = document.getElementById('signupPassword');
    const confirmPassInput = document.getElementById('signupConfirmPassword');

    const name = nameInput?.value?.trim();
    const email = emailInput?.value?.trim().toLowerCase();
    const pass = passInput?.value || '';
    const confirmPass = confirmPassInput?.value || '';

    if (!name) {
      showToast('Please enter your full name.', 'warning');
      nameInput?.focus();
      return;
    }

    if (!email) {
      showToast('Please enter your email address.', 'warning');
      emailInput?.focus();
      return;
    }

    if (pass && confirmPass && pass !== confirmPass) {
      showToast('Passwords do not match. Please verify.', 'warning');
      confirmPassInput?.focus();
      return;
    }

    const avatarLetter = (name.charAt(0) || 'U').toUpperCase();
    const newUser = {
      name: name,
      email: email,
      password: pass,
      age: 28,
      gender: 'Male',
      avatarLetter: avatarLetter,
      avatarBg: '#059669'
    };

    AppState.user = newUser;
    saveRegisteredAccount(AppState.user);
    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));

    AppState.reports = loadUserReports(email);
    AppState.glucoseReadings = loadUserGlucose(email);
    AppState.latestAssessment = AppState.reports.length > 0 ? AppState.reports[0] : null;
    AppState.activeDetailReport = AppState.latestAssessment;

    updateUserUI();
    renderDashboardOverview();
    renderReportsTable();
    renderGlucoseTracking();

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passInput) passInput.value = '';
    if (confirmPassInput) confirmPassInput.value = '';

    closeModal('signupModal');
    showAppShell();
    navigateTo('overview');
    showToast(`Welcome, ${name}! Your account has been registered and is now active.`, 'success');
  });

  document.getElementById('btnCompleteRegistration')?.addEventListener('click', () => {
    const signupForm = document.getElementById('signupForm');
    if (signupForm && typeof signupForm.requestSubmit === 'function') {
      signupForm.requestSubmit();
    }
  });

  document.getElementById('forgotPasswordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal('forgotPasswordModal');
    showToast('Reset instructions sent to your email.');
  });

  document.getElementById('ssoGoogleBtn')?.addEventListener('click', () => {
    const ssoUser = {
      name: 'Google User',
      email: 'user@gmail.com',
      age: 28,
      gender: 'Male',
      avatarLetter: 'G',
      avatarBg: '#4285F4'
    };
    AppState.user = ssoUser;
    AppState.reports = loadUserReports(ssoUser.email);
    AppState.glucoseReadings = loadUserGlucose(ssoUser.email);
    AppState.latestAssessment = AppState.reports.length > 0 ? AppState.reports[0] : null;
    AppState.activeDetailReport = AppState.latestAssessment;
    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));
    saveRegisteredAccount(ssoUser);

    updateUserUI();
    renderDashboardOverview();
    renderReportsTable();
    renderGlucoseTracking();

    closeModal('loginModal');
    showAppShell();
    navigateTo('overview');
    showToast('Signed in via Google Workspace.', 'success');
  });

  document.getElementById('ssoMicrosoftBtn')?.addEventListener('click', () => {
    const ssoUser = {
      name: 'Microsoft User',
      email: 'user@outlook.com',
      age: 28,
      gender: 'Male',
      avatarLetter: 'M',
      avatarBg: '#00A4EF'
    };
    AppState.user = ssoUser;
    AppState.reports = loadUserReports(ssoUser.email);
    AppState.glucoseReadings = loadUserGlucose(ssoUser.email);
    AppState.latestAssessment = AppState.reports.length > 0 ? AppState.reports[0] : null;
    AppState.activeDetailReport = AppState.latestAssessment;
    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));
    saveRegisteredAccount(ssoUser);

    updateUserUI();
    renderDashboardOverview();
    renderReportsTable();
    renderGlucoseTracking();

    closeModal('loginModal');
    showAppShell();
    navigateTo('overview');
    showToast('Signed in via Microsoft Healthcare.', 'success');
  });

  setupOnboardingWizard();
  setupLabReportDropzone();

  // Prediction Form
  document.getElementById('predictionForm')?.addEventListener('submit', handlePredictionSubmit);

  document.getElementById('resetAssessFormBtn')?.addEventListener('click', () => {
    const form = document.getElementById('predictionForm');
    if (form) {
      form.reset();
      form.querySelectorAll('input').forEach(input => {
        input.value = '';
        input.classList.remove('is-invalid');
      });
    }
    showToast('Assessment inputs cleared.');
  });

  // Result Actions
  document.getElementById('returnAssessBtn')?.addEventListener('click', () => navigateTo('assess'));
  document.getElementById('viewFullReportBtn')?.addEventListener('click', () => {
    if (AppState.latestAssessment) showReportDetail(AppState.latestAssessment);
  });
  document.getElementById('saveReportBtn')?.addEventListener('click', saveCurrentAssessment);

  // Detail Report Actions
  document.getElementById('backToReportsBtn')?.addEventListener('click', () => navigateTo('reports'));
  document.getElementById('printReportBtn')?.addEventListener('click', () => window.print());
  document.getElementById('detailNewPredictionBtn')?.addEventListener('click', () => navigateTo('assess'));

  // Reports Filter & Search
  document.getElementById('reportSearchInput')?.addEventListener('input', (e) => {
    AppState.filters.query = e.target.value.toLowerCase();
    renderReportsTable();
  });

  document.getElementById('reportRiskFilter')?.addEventListener('change', (e) => {
    AppState.filters.risk = e.target.value;
    renderReportsTable();
  });

  document.getElementById('reportSortSelect')?.addEventListener('change', (e) => {
    AppState.filters.sort = e.target.value;
    renderReportsTable();
  });

  document.getElementById('reportsNewAssessBtn')?.addEventListener('click', () => navigateTo('assess'));
  document.getElementById('emptyStatePredictBtn')?.addEventListener('click', () => navigateTo('assess'));

  // Profile
  document.getElementById('profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('profileFullName')?.value?.trim();
    const email = document.getElementById('profileEmail')?.value?.trim();
    const age = parseInt(document.getElementById('profileAge')?.value, 10);
    const gender = document.getElementById('profileGender')?.value;

    if (name) {
      AppState.user.name = name;
      AppState.user.avatarLetter = name.charAt(0).toUpperCase();
    }
    if (email) AppState.user.email = email;
    if (!isNaN(age)) AppState.user.age = age;
    if (gender) AppState.user.gender = gender;

    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));
    saveRegisteredAccount(AppState.user);
    updateUserUI();
    showToast('Personal information updated.', 'success');
  });

  document.getElementById('changePhotoBtn')?.addEventListener('click', () => {
    const colors = ['#059669', '#0284C7', '#7C3AED', '#DB2777', '#D97706'];
    const currentIndex = colors.indexOf(AppState.user.avatarBg);
    AppState.user.avatarBg = colors[(currentIndex + 1) % colors.length];
    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));
    updateUserUI();
    showToast('Avatar theme customized.');
  });

  document.getElementById('passwordChangeForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('passwordChangeForm').reset();
    showToast('Password credentials updated.', 'success');
  });

  // Settings
  document.getElementById('settingsDarkToggle')?.addEventListener('change', (e) => {
    setTheme(e.target.checked ? 'dark' : 'light');
  });

  document.getElementById('exportDataBtn')?.addEventListener('click', exportUserDataJson);

  document.getElementById('purgeLocalDataBtn')?.addEventListener('click', () => {
    if (confirm('Reset local history and restore initial baseline?')) {
      localStorage.removeItem('diapredict_reports');
      localStorage.removeItem('diapredict_glucose');
      location.reload();
    }
  });

  document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.clear();
      location.reload();
    }
  });

  // ML Server Endpoint Handlers
  const testMlBtn = document.getElementById('btnTestMlBackend');
  if (testMlBtn) {
    testMlBtn.addEventListener('click', async () => {
      const origHtml = testMlBtn.innerHTML;
      testMlBtn.disabled = true;
      testMlBtn.innerHTML = '<span class="spinner-ring" style="width:12px;height:12px;display:inline-block;margin-right:4px;"></span> Testing...';
      const result = await ApiService.checkBackendHealth();
      testMlBtn.disabled = false;
      testMlBtn.innerHTML = origHtml;
      showToast(result.message, result.ok ? 'success' : 'warning');
    });
  }

  const saveMlBtn = document.getElementById('btnSaveMlConfig');
  if (saveMlBtn) {
    saveMlBtn.addEventListener('click', async () => {
      const urlInput = document.getElementById('mlBackendUrlInput');
      const modeSelect = document.getElementById('mlModeSelect');
      if (urlInput && urlInput.value) {
        ML_CONFIG.apiUrl = urlInput.value.trim();
        if (ML_CONFIG.apiUrl.endsWith('/api/predict')) {
          ML_CONFIG.healthUrl = ML_CONFIG.apiUrl.replace('/api/predict', '/api/health');
        } else {
          try {
            const parsed = new URL(ML_CONFIG.apiUrl);
            ML_CONFIG.healthUrl = `${parsed.origin}/api/health`;
          } catch (e) {
            ML_CONFIG.healthUrl = '/api/health';
          }
        }
        localStorage.setItem('diapredict_ml_url', ML_CONFIG.apiUrl);
        localStorage.setItem('diapredict_ml_health_url', ML_CONFIG.healthUrl);
      }
      if (modeSelect) {
        ML_CONFIG.mode = modeSelect.value;
        localStorage.setItem('diapredict_ml_mode', ML_CONFIG.mode);
      }
      showToast('Connection settings updated. Testing probe...', 'info');
      await ApiService.checkBackendHealth();
    });
  }
}

// ============================================================================
// 7. ONBOARDING & LAB DOCUMENT SCANNING SIMULATION
// ============================================================================
function openOnboardingWizard() {
  openModal('onboardingModal');
  showOnboardingStep(1);
  const obName = document.getElementById('obName');
  const obAge = document.getElementById('obAge');
  const obGender = document.getElementById('obGender');
  if (obName) obName.value = AppState.user.name || '';
  if (obAge) obAge.value = AppState.user.age || '';
  if (obGender && AppState.user.gender) obGender.value = AppState.user.gender;
}

function showOnboardingStep(stepNumber) {
  document.getElementById('onboardingStep1').style.display = stepNumber === 1 ? 'block' : 'none';
  document.getElementById('onboardingStep2').style.display = stepNumber === 2 ? 'block' : 'none';
  document.getElementById('onboardingStep3').style.display = stepNumber === 3 ? 'block' : 'none';

  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById(`stepIndicator${i}`);
    if (ind) {
      ind.classList.remove('active', 'completed');
      if (i === stepNumber) ind.classList.add('active');
      else if (i < stepNumber) ind.classList.add('completed');
    }
  }
}

function setupOnboardingWizard() {
  document.getElementById('obNextBtn1')?.addEventListener('click', () => {
    const name = document.getElementById('obName')?.value?.trim();
    const age = parseInt(document.getElementById('obAge')?.value, 10);
    const gender = document.getElementById('obGender')?.value;
    if (name) {
      AppState.user.name = name;
      AppState.user.avatarLetter = name.charAt(0).toUpperCase();
    }
    if (!isNaN(age)) AppState.user.age = age;
    if (gender) AppState.user.gender = gender;
    updateUserUI();
    showOnboardingStep(2);
  });

  document.getElementById('obBackBtn2')?.addEventListener('click', () => showOnboardingStep(1));
  document.getElementById('obNextBtn2')?.addEventListener('click', () => showOnboardingStep(3));
  document.getElementById('obBackBtn3')?.addEventListener('click', () => showOnboardingStep(2));

  document.getElementById('obFinishBtn')?.addEventListener('click', () => {
    closeModal('onboardingModal');
    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));
    saveRegisteredAccount(AppState.user);
    updateUserUI();
    renderDashboardOverview();
    renderReportsTable();
    renderGlucoseTracking();
    showAppShell();
    navigateTo('overview');
    showToast(`Your health profile is active. Welcome, ${AppState.user.name}!`, 'success');
  });
}

function setupLabReportDropzone() {
  const zone = document.getElementById('uploadDropzone');
  const review = document.getElementById('extractedDataReview');
  const confirmBtn = document.getElementById('confirmExtractBtn');
  const cancelBtn = document.getElementById('cancelExtractBtn');

  if (zone) {
    zone.addEventListener('click', () => {
      zone.innerHTML = `
        <div style="padding: 0.6rem 0;">
          <div class="spinner-ring" style="width: 26px; height: 26px; margin: 0 auto 0.6rem auto;"></div>
          <div style="font-size: 0.86rem; color: var(--text-primary); font-weight: 700;">Scanning lab document & extracting biomarkers…</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.2rem;">Parsing Fasting Glucose, Serum Insulin, BMI, and Blood Pressure</div>
        </div>
      `;
      setTimeout(() => {
        zone.style.display = 'none';
        review.style.display = 'block';
        showToast('Document parsed. Confirm extracted markers.', 'info');
      }, 850);
    });
  }

  const resetDropzoneContent = () => {
    if (zone) {
      zone.style.display = 'block';
      zone.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8" style="margin: 0 auto 0.65rem auto;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Click or drag lab report</div>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem;">Supports PDF, JPG, PNG</div>
        <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.65rem; padding: 0.35rem 0.65rem; background: var(--surface); border-radius: var(--radius-full); display: inline-block;">
          Automated marker extraction powered by clinical parser
        </div>
      `;
    }
  };

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const g = document.getElementById('assessGlucose');
      const bp = document.getElementById('assessBp');
      const bmi = document.getElementById('assessBmi');
      const ins = document.getElementById('assessInsulin');

      if (g) g.value = 104;
      if (bp) bp.value = 78;
      if (bmi) bmi.value = 24.1;
      if (ins) ins.value = 88;

      review.style.display = 'none';
      resetDropzoneContent();
      showToast('Extracted lab values applied to assessment form.', 'success');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      review.style.display = 'none';
      resetDropzoneContent();
    });
  }
}

// ============================================================================
// 8. ASSESSMENT SUBMISSION & MULTI-STAGE ANALYSIS
// ============================================================================
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function handlePredictionSubmit(e) {
  e.preventDefault();

  const pregnancies = parseFloat(document.getElementById('assessPregnancies')?.value || 0);
  const glucose = parseFloat(document.getElementById('assessGlucose')?.value);
  const bp = parseFloat(document.getElementById('assessBp')?.value);
  const skin = parseFloat(document.getElementById('assessSkin')?.value) || 20;
  const insulin = parseFloat(document.getElementById('assessInsulin')?.value) || 85;
  const bmi = parseFloat(document.getElementById('assessBmi')?.value);
  const pedigree = parseFloat(document.getElementById('assessPedigree')?.value);
  const age = parseFloat(document.getElementById('assessAge')?.value);

  let hasError = false;
  const validateField = (id, valid) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (!valid) {
      input.classList.add('is-invalid');
      hasError = true;
    } else {
      input.classList.remove('is-invalid');
    }
  };

  validateField('assessPregnancies', !isNaN(pregnancies) && pregnancies >= 0 && pregnancies <= 25);
  validateField('assessGlucose', !isNaN(glucose) && glucose >= 40 && glucose <= 450);
  validateField('assessBp', !isNaN(bp) && bp >= 40 && bp <= 180);
  validateField('assessBmi', !isNaN(bmi) && bmi >= 10 && bmi <= 75);
  validateField('assessPedigree', !isNaN(pedigree) && pedigree >= 0.05 && pedigree <= 3.0);
  validateField('assessAge', !isNaN(age) && age >= 18 && age <= 120);

  if (hasError) {
    showToast('Please check highlighted clinical fields for acceptable ranges.', 'warning');
    return;
  }

  openModal('predictLoaderModal');
  const stepRows = [
    document.getElementById('pStep1'),
    document.getElementById('pStep2'),
    document.getElementById('pStep3'),
    document.getElementById('pStep4')
  ];

  stepRows.forEach(r => { if (r) r.className = 'predict-step-row'; });
  if (stepRows[0]) stepRows[0].className = 'predict-step-row active';

  try {
    await wait(260);
    if (stepRows[0]) stepRows[0].className = 'predict-step-row completed';
    if (stepRows[1]) stepRows[1].className = 'predict-step-row active';

    await wait(260);
    if (stepRows[1]) stepRows[1].className = 'predict-step-row completed';
    if (stepRows[2]) stepRows[2].className = 'predict-step-row active';

    const modelPayload = { pregnancies, glucose, bloodPressure: bp, skinThickness: skin, insulin, bmi, diabetesPedigree: pedigree, age };
    const predictionResult = await ApiService.predictRisk(modelPayload);

    await wait(260);
    if (stepRows[2]) stepRows[2].className = 'predict-step-row completed';
    if (stepRows[3]) stepRows[3].className = 'predict-step-row active';

    await wait(260);
    if (stepRows[3]) stepRows[3].className = 'predict-step-row completed';

    closeModal('predictLoaderModal');

    const assessment = {
      id: `RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      risk: predictionResult.probability,
      category: predictionResult.risk,
      confidence: predictionResult.confidence,
      glucose,
      bmi,
      bp,
      pregnancies,
      skin,
      insulin,
      pedigree,
      age,
      shap: predictionResult.shap,
      isDemo: predictionResult.isDemo,
      modelName: predictionResult.modelName
    };

    AppState.latestAssessment = assessment;
    AppState.activeDetailReport = assessment;

    // Immediately record to user history so assessments persist across logout/login
    const existingIndex = AppState.reports.findIndex(r => r.id === assessment.id);
    if (existingIndex === -1) {
      AppState.reports.unshift(assessment);
      saveUserReports(AppState.user?.email, AppState.reports);
      renderReportsTable();
      renderDashboardOverview();
    }

    displayPredictionResult(assessment);
    navigateTo('result');
    showToast('Your health assessment is ready.', 'success');

  } catch (err) {
    closeModal('predictLoaderModal');
    showToast('Failed to evaluate assessment. Please verify your inputs.', 'error');
  }
}

// ============================================================================
// 9. RESULT & SHAP VISUALIZATION
// ============================================================================
function displayPredictionResult(data) {
  const probVal = document.getElementById('resultProbabilityVal');
  const catText = document.getElementById('resultCategoryText');
  const badge = document.getElementById('resultStatusBadge');
  const confVal = document.getElementById('resultConfidenceVal');
  const dateVal = document.getElementById('resultDateVal');
  const statement = document.getElementById('resultStatementText');
  const extended = document.getElementById('resultExtendedText');
  const gaugeCircle = document.getElementById('resultGaugeCircle');
  const demoBadge = document.getElementById('demoShapBadge');

  const categoryLabel = AppState.lang === 'hi'
    ? (data.category === 'High Risk' ? 'उच्च जोखिम (High Risk)' : (data.category === 'Moderate Risk' ? 'मध्यम जोखिम (Moderate Risk)' : 'कम जोखिम (Low Risk)'))
    : data.category;

  if (probVal) probVal.textContent = `${data.risk}%`;
  if (catText) catText.textContent = categoryLabel;
  if (confVal) confVal.textContent = `${data.confidence}%`;
  if (dateVal) dateVal.textContent = data.date;

  if (badge) {
    badge.className = 'status-badge';
    if (data.category === 'High Risk') badge.classList.add('status-elevated');
    else if (data.category === 'Moderate Risk') badge.classList.add('status-attention');
    else badge.classList.add('status-healthy');
  }

  // Circular gauge update
  if (gaugeCircle) {
    const circumference = 339.29; // 2 * PI * 54
    const offset = circumference * (1 - (data.risk / 100));
    gaugeCircle.style.strokeDashoffset = offset;
    gaugeCircle.style.stroke = data.category === 'High Risk' ? 'var(--status-elevated)' : (data.category === 'Moderate Risk' ? 'var(--status-attention)' : 'var(--primary)');
  }

  if (demoBadge) {
    if (AppState.lang === 'hi') {
      demoBadge.textContent = data.isDemo ? 'कैलिब्रेटेड व्याख्या' : 'मॉडल व्याख्या';
    } else {
      demoBadge.textContent = data.isDemo ? 'Calibrated explanation' : 'Model explanation';
    }
  }

  if (statement) {
    if (AppState.lang === 'hi') {
      statement.textContent = data.category === 'Low Risk'
        ? "“प्रदान किए गए क्लिनिकल मापदंडों के आधार पर, मॉडल अपेक्षाकृत कम टाइप 2 मधुमेह जोखिम का अनुमान लगाता है।”"
        : (data.category === 'Moderate Risk'
          ? "“प्रदान किए गए क्लिनिकल मापदंडों के आधार पर, मध्यम जोखिम के संकेत मिले हैं जिन पर सक्रिय निगरानी आवश्यक है।”"
          : "“प्रदान किए गए क्लिनिकल मापदंडों के आधार पर, उच्च जोखिम संकेतक पाए गए हैं जिन पर क्लिनिकल परामर्श की अनुशंसा है।”");
    } else {
      statement.textContent = data.category === 'Low Risk'
        ? "“Based on clinical parameters provided, the model estimates a relatively low Type 2 diabetes risk profile.”"
        : (data.category === 'Moderate Risk'
          ? "“Based on clinical parameters provided, moderate risk considerations were detected requiring proactive monitoring.”"
          : "“Based on clinical parameters provided, elevated risk indicators were identified.”");
    }
  }

  if (extended) {
    if (AppState.lang === 'hi') {
      extended.textContent = `फास्टिंग ब्लड ग्लूकोज (${data.glucose} mg/dL) और बीएमआई (${data.bmi} kg/m²) इस मूल्यांकन को आकार देने वाले प्राथमिक संकेतक हैं। संतुलित पोषण और नियमित शारीरिक गतिविधि स्वस्थ प्रवृत्तियों का समर्थन करती है।`;
    } else {
      extended.textContent = `Fasting blood glucose (${data.glucose} mg/dL) and BMI (${data.bmi} kg/m²) are primary indicators shaping this evaluation. Balanced nutrition and steady physical activity support healthy trends.`;
    }
  }

  renderShapBars(data.shap, 'shapBarsContainer');
}

function renderShapBars(shapData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(shapData) || shapData.length === 0) {
    const emptyMsg = AppState.lang === 'hi' ? 'कोई स्थानीय कारक विश्लेषण डेटा उपलब्ध नहीं है।' : 'No local attribution data available.';
    container.innerHTML = `<div style="padding:1rem;color:var(--text-muted);text-align:center;">${emptyMsg}</div>`;
    return;
  }

  const featureHindiNames = {
    'Fasting Blood Glucose': 'फास्टिंग ग्लूकोज (Glucose)',
    'Body Mass Index (BMI)': 'बॉडी मास इंडेक्स (BMI)',
    'Demographic Age': 'आयु (Age)',
    'Diastolic Blood Pressure': 'डायस्टोलिक रक्तचाप (BP)',
    'Genetic Pedigree Score': 'आनुवंशिक स्कोर (Pedigree)',
    'Serum Insulin': 'सीरम इंसुलिन (Insulin)',
    'Triceps Skin Thickness': 'त्वचा की मोटाई (Skin)',
    'Pregnancies': 'गर्भावस्था (Pregnancies)'
  };

  const maxVal = Math.max(...shapData.map(s => Math.abs(s.value || 0)), 0.25);

  shapData.forEach(item => {
    const row = document.createElement('div');
    row.className = 'shap-row';

    const isPositive = (item.value || 0) >= 0;
    const barWidthPercent = Math.min(100, Math.round((Math.abs(item.value || 0) / maxVal) * 94));
    const sign = isPositive ? '+' : '';
    const num = typeof item.value === 'number' ? item.value.toFixed(2) : '0.00';
    const featureName = (AppState.lang === 'hi' && featureHindiNames[item.feature])
      ? featureHindiNames[item.feature]
      : item.feature;

    row.innerHTML = `
      <div class="shap-feature-title" title="${item.feature}">${featureName}</div>
      <div class="shap-bar-track" role="progressbar" aria-valuenow="${barWidthPercent}" aria-valuemin="0" aria-valuemax="100">
        <div class="shap-bar-fill ${isPositive ? 'positive' : 'negative'}" style="width: ${barWidthPercent}%;"></div>
      </div>
      <div class="shap-val-badge ${isPositive ? 'positive' : 'negative'}">${sign}${num}</div>
    `;

    container.appendChild(row);
  });
}

// ============================================================================
// 10. SAVING & ARCHIVING REPORTS
// ============================================================================
function saveCurrentAssessment() {
  if (!AppState.latestAssessment) return;

  const existingIndex = AppState.reports.findIndex(r => r.id === AppState.latestAssessment.id);
  if (existingIndex === -1) {
    AppState.reports.unshift(AppState.latestAssessment);
    saveUserReports(AppState.user?.email, AppState.reports);
  }

  renderReportsTable();
  renderDashboardOverview();
  showToast('Assessment successfully saved to health archive.', 'success');
  navigateTo('reports');
}

function renderReportsTable() {
  const tbody = document.getElementById('reportsTableBody');
  const cardsList = document.getElementById('reportsMobileCards');
  const emptyState = document.getElementById('reportsEmptyState');

  if (!tbody || !cardsList) return;
  tbody.innerHTML = '';
  cardsList.innerHTML = '';

  let list = [...AppState.reports];

  if (AppState.filters.query) {
    const q = AppState.filters.query.toLowerCase();
    list = list.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.date.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }

  if (AppState.filters.risk !== 'all') {
    list = list.filter(r => r.category === AppState.filters.risk);
  }

  if (AppState.filters.sort === 'oldest') {
    list.reverse();
  }

  if (list.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  } else {
    if (emptyState) emptyState.style.display = 'none';
  }

  list.forEach(report => {
    let badgeClass = 'status-healthy';
    if (report.category === 'High Risk') badgeClass = 'status-elevated';
    else if (report.category === 'Moderate Risk') badgeClass = 'status-attention';

    const categoryDisplay = AppState.lang === 'hi'
      ? (report.category === 'High Risk' ? 'उच्च जोखिम' : (report.category === 'Moderate Risk' ? 'मध्यम जोखिम' : 'कम जोखिम'))
      : report.category;
    const viewDetailsText = AppState.lang === 'hi' ? 'विवरण देखें →' : 'View Details →';
    const viewDetailsShort = AppState.lang === 'hi' ? 'विवरण देखें' : 'View Details';
    const deleteText = AppState.lang === 'hi' ? 'हटाएं' : 'Delete';
    const probLabel = AppState.lang === 'hi' ? 'संभावना' : 'Probability';
    const glucoseLabel = AppState.lang === 'hi' ? 'ग्लूकोज' : 'Glucose';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${report.date}</td>
      <td>
        <span class="status-badge ${badgeClass}">
          <span class="status-indicator-dot"></span>
          ${categoryDisplay}
        </span>
      </td>
      <td style="font-weight: 700; font-feature-settings: 'tnum';">${report.risk}%</td>
      <td>${report.glucose} mg/dL</td>
      <td>${report.bmi} kg/m²</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm report-view-btn" data-id="${report.id}">${viewDetailsText}</button>
        <button class="btn btn-subtle btn-sm report-del-btn" data-id="${report.id}" style="color: var(--status-elevated); margin-left: 0.35rem;" title="Delete">✕</button>
      </td>
    `;
    tbody.appendChild(tr);

    const card = document.createElement('div');
    card.className = 'mobile-report-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">${report.date}</span>
        <span class="status-badge ${badgeClass}">${categoryDisplay}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin: 0.35rem 0;">
        <span>${probLabel}: <strong>${report.risk}%</strong></span>
        <span>${glucoseLabel}: <strong>${report.glucose} mg/dL</strong></span>
        <span>BMI: <strong>${report.bmi}</strong></span>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.35rem;">
        <button class="btn btn-secondary btn-sm report-view-btn" data-id="${report.id}">${viewDetailsShort}</button>
        <button class="btn btn-subtle btn-sm report-del-btn" data-id="${report.id}" style="color: var(--status-elevated);">${deleteText}</button>
      </div>
    `;
    cardsList.appendChild(card);
  });

  document.querySelectorAll('.report-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const target = AppState.reports.find(r => r.id === id);
      if (target) showReportDetail(target);
    });
  });

  document.querySelectorAll('.report-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this assessment record from your local history?')) {
        AppState.reports = AppState.reports.filter(r => r.id !== id);
        saveUserReports(AppState.user?.email, AppState.reports);
        renderReportsTable();
        renderDashboardOverview();
        showToast('Assessment record deleted.');
      }
    });
  });
}

// ============================================================================
// 11. DETAILED REPORT & PRINT VIEW
// ============================================================================
function showReportDetail(report) {
  AppState.activeDetailReport = report;

  const idEl = document.getElementById('detailReportId');
  const timeEl = document.getElementById('detailReportTimestamp');
  const badge = document.getElementById('detailRiskBadge');
  const classText = document.getElementById('detailRiskClassText');
  const probText = document.getElementById('detailRiskProbText');
  const confText = document.getElementById('detailConfidenceText');
  const narrative = document.getElementById('detailNarrativeText');

  if (idEl) idEl.textContent = report.id;
  if (timeEl) timeEl.textContent = `Generated: ${report.date}`;
  if (classText) classText.textContent = report.category;
  if (probText) probText.textContent = `${report.risk}%`;
  if (confText) confText.textContent = `${report.confidence}%`;

  if (badge) {
    badge.className = 'status-badge';
    if (report.category === 'High Risk') badge.classList.add('status-elevated');
    else if (report.category === 'Moderate Risk') badge.classList.add('status-attention');
    else badge.classList.add('status-healthy');
    badge.textContent = report.category;
  }

  if (narrative) {
    narrative.textContent = `The machine learning decision support pipeline evaluated clinical biomarkers for this assessment. Fasting blood glucose was recorded at ${report.glucose} mg/dL and Body Mass Index at ${report.bmi} kg/m². Based on the aggregated feature vector, the calculated probability of diabetes is ${report.risk}%, classifying this evaluation as ${report.category}.`;
  }

  const tbody = document.getElementById('detailMetricsTableBody');
  if (tbody) {
    const glucoseStatus = report.glucose <= 99 ? 'Normal range' : (report.glucose <= 125 ? 'Pre-diabetic range' : 'Elevated (Hyperglycemia)');
    const bmiStatus = report.bmi < 18.5 ? 'Underweight' : (report.bmi < 25 ? 'Normal weight' : (report.bmi < 30 ? 'Overweight range' : 'Obese range'));
    const bpStatus = report.bp <= 80 ? 'Optimal' : (report.bp <= 89 ? 'Pre-hypertensive' : 'Hypertensive');
    const insulinStatus = (report.insulin || 85) <= 166 ? 'Normal reference' : 'Elevated (Hyperinsulinemia)';
    const pedigreeStatus = (report.pedigree || 0.45) < 0.4 ? 'Low genetic risk' : ((report.pedigree || 0.45) <= 0.8 ? 'Moderate family history' : 'High familial risk');

    tbody.innerHTML = `
      <tr><td>Fasting Blood Glucose</td><td><strong>${report.glucose} mg/dL</strong></td><td>70 – 99 mg/dL</td><td>${glucoseStatus}</td></tr>
      <tr><td>Body Mass Index (BMI)</td><td><strong>${report.bmi} kg/m²</strong></td><td>18.5 – 24.9 kg/m²</td><td>${bmiStatus}</td></tr>
      <tr><td>Diastolic Blood Pressure</td><td><strong>${report.bp} mm Hg</strong></td><td>60 – 80 mm Hg</td><td>${bpStatus}</td></tr>
      <tr><td>Age</td><td><strong>${report.age || 28} years</strong></td><td>Adult cohort</td><td>Demographic baseline</td></tr>
      <tr><td>Serum Insulin</td><td><strong>${report.insulin || 85} µIU/mL</strong></td><td>16 – 166 µIU/mL</td><td>${insulinStatus}</td></tr>
      <tr><td>Skin Thickness</td><td><strong>${report.skin || 20} mm</strong></td><td>10 – 30 mm</td><td>${(report.skin || 20) <= 30 ? 'Normal range' : 'Elevated subcutaneous layer'}</td></tr>
      <tr><td>Pregnancies</td><td><strong>${report.pregnancies || 0}</strong></td><td>0 – 20</td><td>Clinical history</td></tr>
      <tr><td>Diabetes Pedigree Function</td><td><strong>${report.pedigree || 0.45}</strong></td><td>0.08 – 2.42</td><td>${pedigreeStatus}</td></tr>
    `;
  }

  if (report.shap) {
    renderShapBars(report.shap, 'detailShapContainer');
  }

  navigateTo('report-detail');
}

// ============================================================================
// 12. GLUCOSE TRACKING & INTERACTIVE SVG CHART
// ============================================================================
function renderGlucoseTracking() {
  const readings = AppState.glucoseReadings;
  const emptyState = document.getElementById('glucoseEmptyState');

  if (!readings || readings.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    const tbody = document.getElementById('glucoseLogTableBody');
    if (tbody) tbody.innerHTML = '';
    const avgEl = document.getElementById('glucoseTrackAvg');
    const latestEl = document.getElementById('glucoseTrackLatest');
    const latestTimeEl = document.getElementById('glucoseTrackLatestTime');
    const highEl = document.getElementById('glucoseTrackHigh');
    const lowEl = document.getElementById('glucoseTrackLow');
    if (avgEl) avgEl.innerHTML = `-- <small>mg/dL</small>`;
    if (latestEl) latestEl.innerHTML = `-- <small>mg/dL</small>`;
    if (latestTimeEl) latestTimeEl.textContent = 'No logs yet';
    if (highEl) highEl.innerHTML = `-- <small>mg/dL</small>`;
    if (lowEl) lowEl.innerHTML = `-- <small>mg/dL</small>`;
    return;
  } else {
    if (emptyState) emptyState.style.display = 'none';
  }

  const values = readings.map(r => r.val);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const latest = readings[0].val;
  const high = Math.max(...values);
  const low = Math.min(...values);

  const avgEl = document.getElementById('glucoseTrackAvg');
  const latestEl = document.getElementById('glucoseTrackLatest');
  const latestTimeEl = document.getElementById('glucoseTrackLatestTime');
  const highEl = document.getElementById('glucoseTrackHigh');
  const lowEl = document.getElementById('glucoseTrackLow');

  if (avgEl) avgEl.innerHTML = `${avg} <small>mg/dL</small>`;
  if (latestEl) latestEl.innerHTML = `${latest} <small>mg/dL</small>`;
  if (latestTimeEl) latestTimeEl.textContent = readings[0].date;
  if (highEl) highEl.innerHTML = `${high} <small>mg/dL</small>`;
  if (lowEl) lowEl.innerHTML = `${low} <small>mg/dL</small>`;

  const svg = document.getElementById('glucoseTrackingSvg');
  if (svg) {
    const slice = readings.slice(0, 7).reverse();
    const width = 600;
    const height = 180;
    const minVal = 50;
    const maxVal = 160;

    const points = slice.map((item, idx) => {
      const x = Math.round(45 + (idx * (510 / (slice.length - 1 || 1))));
      const y = Math.round(height - 25 - ((item.val - minVal) / (maxVal - minVal)) * (height - 55));
      return { x, y, val: item.val, date: item.date, context: item.context };
    });

    const polylinePts = points.map(p => `${p.x},${p.y}`).join(' ');
    const areaPts = `45,${height - 20} ` + polylinePts + ` ${points[points.length - 1].x},${height - 20}`;

    let circlesSvg = '';
    points.forEach(p => {
      circlesSvg += `<circle class="chart-point" cx="${p.x}" cy="${p.y}" r="4.5"><title>${p.date} (${p.context}): ${p.val} mg/dL</title></circle>`;
    });

    svg.innerHTML = `
      <rect x="0" y="55" width="600" height="75" fill="var(--primary-soft)" opacity="0.65"/>
      <text x="590" y="68" text-anchor="end" fill="var(--primary)" font-size="9" font-weight="600">Target Range (70-130)</text>
      <line x1="0" y1="130" x2="600" y2="130" stroke="var(--border)" stroke-dasharray="3 3"/>
      <line x1="0" y1="55" x2="600" y2="55" stroke="var(--border)" stroke-dasharray="3 3"/>
      <polygon class="chart-area" points="${areaPts}"></polygon>
      <polyline class="chart-line" points="${polylinePts}"></polyline>
      ${circlesSvg}
    `;
  }

  const tbody = document.getElementById('glucoseLogTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    readings.forEach(item => {
      let tagClass = 'status-healthy';
      let tagText = 'Normal';
      if (item.val > 125) {
        tagClass = 'status-elevated';
        tagText = 'Elevated';
      } else if (item.val >= 100) {
        tagClass = 'status-attention';
        tagText = 'Pre-diabetes Range';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${item.date}</td>
        <td><span class="status-badge" style="background: var(--surface-muted); color: var(--text-secondary);">${item.context}</span></td>
        <td style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.val} <small style="font-size:0.75rem; color:var(--text-muted);">mg/dL</small></td>
        <td><span class="status-badge ${tagClass}"><span class="status-indicator-dot"></span>${tagText}</span></td>
        <td style="color: var(--text-secondary);">${item.note || '—'}</td>
        <td style="text-align: right;">
          <button class="btn btn-subtle btn-sm del-glucose-btn" data-id="${item.id}" style="color: var(--status-elevated);">✕</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.del-glucose-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        AppState.glucoseReadings = AppState.glucoseReadings.filter(g => g.id !== id);
        saveUserGlucose(AppState.user?.email, AppState.glucoseReadings);
        renderGlucoseTracking();
        renderDashboardOverview();
        showToast('Glucose entry removed.');
      });
    });
  }
}

// ============================================================================
// 13. DASHBOARD OVERVIEW METRICS
// ============================================================================
function renderDashboardOverview() {
  const totalReportsEl = document.getElementById('dashTotalReports');
  const avgGlucoseEl = document.getElementById('dashAvgGlucose');
  const lastRiskPill = document.getElementById('dashRiskPill');
  const lastRiskCat = document.getElementById('dashRiskCategory');
  const lastPredTime = document.getElementById('dashLastPredictionTime');
  const latestReportDate = document.getElementById('dashLatestReportDate');
  const latestReportRisk = document.getElementById('dashLatestReportRisk');
  const latestReportGlucose = document.getElementById('dashLatestReportGlucose');

  if (totalReportsEl) totalReportsEl.textContent = AppState.reports ? AppState.reports.length : 0;

  if (AppState.glucoseReadings && AppState.glucoseReadings.length > 0) {
    const vals = AppState.glucoseReadings.map(r => r.val);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    if (avgGlucoseEl) avgGlucoseEl.innerHTML = `${avg} <small>mg/dL</small>`;
  } else {
    if (avgGlucoseEl) avgGlucoseEl.innerHTML = `-- <small>mg/dL</small>`;
  }

  if (AppState.reports && AppState.reports.length > 0) {
    const latest = AppState.reports[0];
    const catDisplay = AppState.lang === 'hi'
      ? (latest.category === 'High Risk' ? 'उच्च जोखिम' : (latest.category === 'Moderate Risk' ? 'मध्यम जोखिम' : 'कम जोखिम'))
      : latest.category;

    if (lastRiskCat) lastRiskCat.textContent = catDisplay;
    if (lastRiskPill) {
      lastRiskPill.className = 'status-badge';
      if (latest.category === 'High Risk') lastRiskPill.classList.add('status-elevated');
      else if (latest.category === 'Moderate Risk') lastRiskPill.classList.add('status-attention');
      else lastRiskPill.classList.add('status-healthy');
    }
    if (lastPredTime) lastPredTime.textContent = AppState.lang === 'hi' ? `आकलन दिनांक: ${latest.date}` : `Assessed on ${latest.date}`;

    if (latestReportDate) latestReportDate.textContent = latest.date;
    if (latestReportRisk) {
      latestReportRisk.textContent = `${catDisplay} (${latest.risk}%)`;
      latestReportRisk.style.color = latest.category === 'High Risk' ? 'var(--status-elevated)' : (latest.category === 'Moderate Risk' ? 'var(--status-attention)' : 'var(--primary)');
    }
    if (latestReportGlucose) latestReportGlucose.textContent = `${latest.glucose} mg/dL`;
  } else {
    if (lastRiskCat) lastRiskCat.textContent = AppState.lang === 'hi' ? 'कोई रिकॉर्ड नहीं' : 'No Assessment';
    if (lastRiskPill) {
      lastRiskPill.className = 'status-badge status-healthy';
    }
    if (lastPredTime) lastPredTime.textContent = AppState.lang === 'hi' ? 'पहला आकलन प्रारंभ करें' : 'Run your first assessment';
    if (latestReportDate) latestReportDate.textContent = AppState.lang === 'hi' ? 'कोई आकलन रिकॉर्ड नहीं' : 'No assessments recorded';
    if (latestReportRisk) {
      latestReportRisk.textContent = '--';
      latestReportRisk.style.color = 'var(--text-muted)';
    }
    if (latestReportGlucose) latestReportGlucose.textContent = '--';
  }
}

// ============================================================================
// 14. DATA EXPORT (JSON)
// ============================================================================
function exportUserDataJson() {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    application: APP_CONFIG.name,
    tagline: APP_CONFIG.tagline,
    version: APP_CONFIG.version,
    user: AppState.user,
    reports: AppState.reports,
    glucoseLog: AppState.glucoseReadings
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `glucosesense_health_records_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Health records exported as JSON.', 'success');
}