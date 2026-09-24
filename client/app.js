/**
 * GlucoseSense / DIA-PREDICT — Application Controller (Production Standard)
 * Industrial Healthcare Decision Support System for Type 2 Diabetes Stratification
 */

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
const AppState = {
  theme: localStorage.getItem('diapredict_theme') || 'light',
  authenticated: true,
  currentView: 'overview',
  user: {
    name: 'Ayush Sharma',
    email: 'ayush.sharma@example.com',
    age: 28,
    gender: 'Male',
    avatarLetter: 'A',
    avatarBg: '#059669'
  },
  latestAssessment: null,
  activeDetailReport: null,
  reports: [
    {
      id: 'RPT-2026-0910',
      date: '10 Sep 2026, 10:30 AM',
      risk: 18,
      category: 'Low Risk',
      confidence: 87,
      glucose: 98,
      bmi: 23.8,
      bp: 76,
      pregnancies: 0,
      skin: 20,
      insulin: 85,
      pedigree: 0.45,
      age: 28,
      shap: [
        { feature: 'Fasting Blood Glucose', value: -0.42, impact: 'Protective (-0.42)' },
        { feature: 'Body Mass Index (BMI)', value: -0.22, impact: 'Protective (-0.22)' },
        { feature: 'Demographic Age', value: 0.12, impact: 'Elevating (+0.12)' },
        { feature: 'Diastolic Blood Pressure', value: -0.15, impact: 'Protective (-0.15)' },
        { feature: 'Genetic Pedigree Score', value: 0.08, impact: 'Elevating (+0.08)' },
        { feature: 'Serum Insulin', value: -0.05, impact: 'Protective (-0.05)' }
      ]
    },
    {
      id: 'RPT-2026-0904',
      date: '04 Sep 2026, 09:15 AM',
      risk: 22,
      category: 'Low Risk',
      confidence: 85,
      glucose: 104,
      bmi: 23.9,
      bp: 78,
      pregnancies: 0,
      skin: 20,
      insulin: 88,
      pedigree: 0.45,
      age: 28,
      shap: [
        { feature: 'Fasting Blood Glucose', value: -0.28, impact: 'Protective (-0.28)' },
        { feature: 'Body Mass Index (BMI)', value: -0.20, impact: 'Protective (-0.20)' },
        { feature: 'Demographic Age', value: 0.12, impact: 'Elevating (+0.12)' },
        { feature: 'Diastolic Blood Pressure', value: -0.10, impact: 'Protective (-0.10)' },
        { feature: 'Genetic Pedigree Score', value: 0.08, impact: 'Elevating (+0.08)' },
        { feature: 'Serum Insulin', value: -0.04, impact: 'Protective (-0.04)' }
      ]
    },
    {
      id: 'RPT-2026-0828',
      date: '28 Aug 2026, 11:20 AM',
      risk: 26,
      category: 'Low Risk',
      confidence: 84,
      glucose: 110,
      bmi: 24.1,
      bp: 80,
      pregnancies: 0,
      skin: 22,
      insulin: 92,
      pedigree: 0.45,
      age: 28,
      shap: [
        { feature: 'Fasting Blood Glucose', value: -0.15, impact: 'Protective (-0.15)' },
        { feature: 'Body Mass Index (BMI)', value: -0.16, impact: 'Protective (-0.16)' },
        { feature: 'Demographic Age', value: 0.12, impact: 'Elevating (+0.12)' },
        { feature: 'Diastolic Blood Pressure', value: 0.04, impact: 'Elevating (+0.04)' },
        { feature: 'Genetic Pedigree Score', value: 0.08, impact: 'Elevating (+0.08)' },
        { feature: 'Serum Insulin', value: 0.02, impact: 'Elevating (+0.02)' }
      ]
    }
  ],
  glucoseReadings: [
    { id: 1, val: 98, context: 'Fasting', date: 'Today, 08:30 AM', note: 'Morning resting check' },
    { id: 2, val: 112, context: 'After meal', date: 'Yesterday, 01:15 PM', note: 'Post lunch walk completed' },
    { id: 3, val: 102, context: 'Before meal', date: '08 Sep, 12:45 PM', note: 'Pre-lunch check' },
    { id: 4, val: 108, context: 'Random', date: '07 Sep, 04:30 PM', note: 'Mid-afternoon check' },
    { id: 5, val: 97, context: 'Fasting', date: '06 Sep, 08:00 AM', note: 'Resting baseline' },
    { id: 6, val: 104, context: 'Bedtime', date: '05 Sep, 10:30 PM', note: 'Evening check' },
    { id: 7, val: 95, context: 'Fasting', date: '04 Sep, 08:15 AM', note: 'Optimal fasting level' }
  ],
  filters: {
    query: '',
    risk: 'all',
    sort: 'newest'
  }
};

// Hydrate from LocalStorage
try {
  const savedReports = localStorage.getItem('diapredict_reports');
  if (savedReports) AppState.reports = JSON.parse(savedReports);

  const savedGlucose = localStorage.getItem('diapredict_glucose');
  if (savedGlucose) AppState.glucoseReadings = JSON.parse(savedGlucose);

  const savedUser = localStorage.getItem('diapredict_user');
  if (savedUser) AppState.user = { ...AppState.user, ...JSON.parse(savedUser) };
} catch (e) {
  console.warn('LocalStorage hydration notice:', e);
}

if (AppState.reports.length > 0) {
  AppState.latestAssessment = AppState.reports[0];
  AppState.activeDetailReport = AppState.reports[0];
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
// 4. LIFECYCLE & ROUTING
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
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
  const label = document.getElementById('themeToggleLabel');
  const toggleCheckbox = document.getElementById('settingsDarkToggle');
  if (label) label.textContent = AppState.theme === 'dark' ? 'Theme: Dark' : 'Theme: Light';
  if (toggleCheckbox) toggleCheckbox.checked = AppState.theme === 'dark';
}

function setTheme(mode) {
  AppState.theme = mode;
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('diapredict_theme', mode);

  const label = document.getElementById('themeToggleLabel');
  const toggleCheckbox = document.getElementById('settingsDarkToggle');
  if (label) label.textContent = mode === 'dark' ? 'Theme: Dark' : 'Theme: Light';
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

  const headings = {
    overview: { title: 'Dashboard', sub: "Here's a quick look at your recent health activity." },
    assess: { title: 'Check Your Diabetes Risk', sub: 'Enter clinical biomarkers to generate an estimated risk assessment.' },
    result: { title: 'Your Health Assessment', sub: 'Machine learning probability and Explainable AI (SHAP) attributions.' },
    'report-detail': { title: 'Assessment Details', sub: 'Comprehensive clinical biomarker breakdown and metrics.' },
    reports: { title: 'Your Health Reports', sub: 'Review previous assessments and historical risk trajectories.' },
    glucose: { title: 'Track Your Glucose', sub: 'Blood sugar log and target range trend analysis.' },
    insights: { title: 'Health Insights', sub: 'Evidence-based clinical guidelines and prevention strategies.' },
    profile: { title: 'Profile', sub: 'Manage personal details and biometric baselines.' },
    settings: { title: 'Settings', sub: 'API connection parameters, visual theme, and health data export.' }
  };

  const headerInfo = headings[tabId] || { title: 'GlucoseSense', sub: 'Diabetes Risk Decision Support' };
  const h1 = document.getElementById('viewHeading');
  const p = document.getElementById('viewSubheading');
  if (h1) h1.textContent = headerInfo.title;
  if (p) p.textContent = headerInfo.sub;

  AppState.currentView = tabId;

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

  if (nameEl) nameEl.textContent = AppState.user.name;
  if (avatarEl) {
    avatarEl.textContent = AppState.user.name.charAt(0).toUpperCase();
    avatarEl.style.backgroundColor = AppState.user.avatarBg;
  }
  if (bigAvatar) {
    bigAvatar.textContent = AppState.user.name.charAt(0).toUpperCase();
    bigAvatar.style.backgroundColor = AppState.user.avatarBg;
  }
  if (profileNameInput) profileNameInput.value = AppState.user.name;
  if (profileEmailInput) profileEmailInput.value = AppState.user.email;
  if (profileAgeInput) profileAgeInput.value = AppState.user.age;
  if (profileGenderSelect) profileGenderSelect.value = AppState.user.gender;
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

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
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
      localStorage.setItem('diapredict_glucose', JSON.stringify(AppState.glucoseReadings));

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
    closeModal('loginModal');
    showAppShell();
    navigateTo('overview');
    showToast(`Welcome back, ${AppState.user.name}.`, 'success');
  });

  document.getElementById('signupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const pass = document.getElementById('signupPassword')?.value;
    const confirmPass = document.getElementById('signupConfirmPassword')?.value;

    if (pass !== confirmPass) {
      showToast('Passwords do not match. Please verify.', 'warning');
      return;
    }

    if (name) AppState.user.name = name;
    if (email) AppState.user.email = email;
    updateUserUI();

    closeModal('signupModal');
    openOnboardingWizard();
  });

  document.getElementById('forgotPasswordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal('forgotPasswordModal');
    showToast('Reset instructions sent to your email.');
  });

  document.getElementById('ssoGoogleBtn')?.addEventListener('click', () => {
    closeModal('loginModal');
    showAppShell();
    navigateTo('overview');
    showToast('Signed in via Google Workspace.', 'success');
  });

  document.getElementById('ssoMicrosoftBtn')?.addEventListener('click', () => {
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
    document.getElementById('predictionForm')?.reset();
    showToast('Assessment inputs reset.');
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
    AppState.user.name = document.getElementById('profileFullName').value;
    AppState.user.email = document.getElementById('profileEmail').value;
    AppState.user.age = parseInt(document.getElementById('profileAge').value, 10);
    AppState.user.gender = document.getElementById('profileGender').value;
    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));
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
    const name = document.getElementById('obName')?.value;
    const age = parseInt(document.getElementById('obAge')?.value, 10);
    const gender = document.getElementById('obGender')?.value;
    if (name) AppState.user.name = name;
    if (age) AppState.user.age = age;
    if (gender) AppState.user.gender = gender;
    showOnboardingStep(2);
  });

  document.getElementById('obBackBtn2')?.addEventListener('click', () => showOnboardingStep(1));
  document.getElementById('obNextBtn2')?.addEventListener('click', () => showOnboardingStep(3));
  document.getElementById('obBackBtn3')?.addEventListener('click', () => showOnboardingStep(2));

  document.getElementById('obFinishBtn')?.addEventListener('click', () => {
    closeModal('onboardingModal');
    localStorage.setItem('diapredict_user', JSON.stringify(AppState.user));
    updateUserUI();
    showAppShell();
    navigateTo('overview');
    showToast('Your health profile is active. Welcome!', 'success');
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

  if (probVal) probVal.textContent = `${data.risk}%`;
  if (catText) catText.textContent = data.category;
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
    demoBadge.textContent = data.isDemo ? 'Calibrated explanation' : 'Model explanation';
  }

  if (statement) {
    statement.textContent = data.category === 'Low Risk'
      ? "“Based on clinical parameters provided, the model estimates a relatively low Type 2 diabetes risk profile.”"
      : (data.category === 'Moderate Risk'
        ? "“Based on clinical parameters provided, moderate risk considerations were detected requiring proactive monitoring.”"
        : "“Based on clinical parameters provided, elevated risk indicators were identified.”");
  }

  if (extended) {
    extended.textContent = `Fasting blood glucose (${data.glucose} mg/dL) and BMI (${data.bmi} kg/m²) are primary indicators shaping this evaluation. Balanced nutrition and steady physical activity support healthy trends.`;
  }

  renderShapBars(data.shap, 'shapBarsContainer');
}

function renderShapBars(shapData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(shapData) || shapData.length === 0) {
    container.innerHTML = '<div style="padding:1rem;color:var(--text-muted);text-align:center;">No local attribution data available.</div>';
    return;
  }

  const maxVal = Math.max(...shapData.map(s => Math.abs(s.value || 0)), 0.25);

  shapData.forEach(item => {
    const row = document.createElement('div');
    row.className = 'shap-row';

    const isPositive = (item.value || 0) >= 0;
    const barWidthPercent = Math.min(100, Math.round((Math.abs(item.value || 0) / maxVal) * 94));
    const sign = isPositive ? '+' : '';
    const num = typeof item.value === 'number' ? item.value.toFixed(2) : '0.00';

    row.innerHTML = `
      <div class="shap-feature-title" title="${item.feature}">${item.feature}</div>
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
    localStorage.setItem('diapredict_reports', JSON.stringify(AppState.reports));
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

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${report.date}</td>
      <td>
        <span class="status-badge ${badgeClass}">
          <span class="status-indicator-dot"></span>
          ${report.category}
        </span>
      </td>
      <td style="font-weight: 700; font-feature-settings: 'tnum';">${report.risk}%</td>
      <td>${report.glucose} mg/dL</td>
      <td>${report.bmi} kg/m²</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm report-view-btn" data-id="${report.id}">View Details →</button>
        <button class="btn btn-subtle btn-sm report-del-btn" data-id="${report.id}" style="color: var(--status-elevated); margin-left: 0.35rem;" title="Delete">✕</button>
      </td>
    `;
    tbody.appendChild(tr);

    const card = document.createElement('div');
    card.className = 'mobile-report-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">${report.date}</span>
        <span class="status-badge ${badgeClass}">${report.category}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin: 0.35rem 0;">
        <span>Probability: <strong>${report.risk}%</strong></span>
        <span>Glucose: <strong>${report.glucose} mg/dL</strong></span>
        <span>BMI: <strong>${report.bmi}</strong></span>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.35rem;">
        <button class="btn btn-secondary btn-sm report-view-btn" data-id="${report.id}">View Details</button>
        <button class="btn btn-subtle btn-sm report-del-btn" data-id="${report.id}" style="color: var(--status-elevated);">Delete</button>
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
        localStorage.setItem('diapredict_reports', JSON.stringify(AppState.reports));
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
    tbody.innerHTML = `
      <tr><td>Fasting Blood Glucose</td><td><strong>${report.glucose} mg/dL</strong></td><td>70 – 99 mg/dL</td><td>${report.glucose <= 99 ? 'Normal range' : (report.glucose <= 125 ? 'Pre-diabetic range' : 'Elevated')}</td></tr>
      <tr><td>Body Mass Index (BMI)</td><td><strong>${report.bmi} kg/m²</strong></td><td>18.5 – 24.9 kg/m²</td><td>${report.bmi < 25 ? 'Normal weight' : 'Overweight range'}</td></tr>
      <tr><td>Diastolic Blood Pressure</td><td><strong>${report.bp} mm Hg</strong></td><td>60 – 80 mm Hg</td><td>${report.bp <= 80 ? 'Optimal' : 'Pre-hypertensive'}</td></tr>
      <tr><td>Age</td><td><strong>${report.age || 28} years</strong></td><td>Adult cohort</td><td>Demographic baseline</td></tr>
      <tr><td>Serum Insulin</td><td><strong>${report.insulin || 85} µIU/mL</strong></td><td>16 – 166 µIU/mL</td><td>Normal reference</td></tr>
      <tr><td>Skin Thickness</td><td><strong>${report.skin || 20} mm</strong></td><td>10 – 30 mm</td><td>Normal range</td></tr>
      <tr><td>Pregnancies</td><td><strong>${report.pregnancies || 0}</strong></td><td>0 – 20</td><td>Clinical history</td></tr>
      <tr><td>Diabetes Pedigree Function</td><td><strong>${report.pedigree || 0.45}</strong></td><td>0.08 – 2.42</td><td>Family score baseline</td></tr>
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
        localStorage.setItem('diapredict_glucose', JSON.stringify(AppState.glucoseReadings));
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

  if (totalReportsEl) totalReportsEl.textContent = AppState.reports.length;

  if (AppState.glucoseReadings.length > 0) {
    const vals = AppState.glucoseReadings.map(r => r.val);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    if (avgGlucoseEl) avgGlucoseEl.innerHTML = `${avg} <small>mg/dL</small>`;
  }

  if (AppState.reports.length > 0) {
    const latest = AppState.reports[0];
    if (lastRiskCat) lastRiskCat.textContent = latest.category;
    if (lastRiskPill) {
      lastRiskPill.className = 'status-badge';
      if (latest.category === 'High Risk') lastRiskPill.classList.add('status-elevated');
      else if (latest.category === 'Moderate Risk') lastRiskPill.classList.add('status-attention');
      else lastRiskPill.classList.add('status-healthy');
    }
    if (lastPredTime) lastPredTime.textContent = `Assessed on ${latest.date}`;

    if (latestReportDate) latestReportDate.textContent = latest.date;
    if (latestReportRisk) {
      latestReportRisk.textContent = `${latest.category} (${latest.risk}%)`;
      latestReportRisk.style.color = latest.category === 'High Risk' ? 'var(--status-elevated)' : (latest.category === 'Moderate Risk' ? 'var(--status-attention)' : 'var(--primary)');
    }
    if (latestReportGlucose) latestReportGlucose.textContent = `${latest.glucose} mg/dL`;
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