/**
 * GlucoseSense / DIA-PREDICT — Central Application State
 * Reactive state container with persistent LocalStorage synchronization.
 */

const DEFAULT_USER = {
  name: 'Ayush Sharma',
  email: 'ayush.sharma@example.com',
  age: 28,
  gender: 'Male',
  avatarLetter: 'A',
  avatarBg: '#059669'
};

const DEFAULT_REPORTS = [
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
];

const DEFAULT_GLUCOSE = [
  { id: 1, val: 98, context: 'Fasting', date: 'Today, 08:30 AM', note: 'Morning resting check' },
  { id: 2, val: 112, context: 'After meal', date: 'Yesterday, 01:15 PM', note: 'Post lunch walk completed' },
  { id: 3, val: 102, context: 'Before meal', date: '08 Sep, 12:45 PM', note: 'Pre-lunch check' },
  { id: 4, val: 108, context: 'Random', date: '07 Sep, 04:30 PM', note: 'Mid-afternoon work check' },
  { id: 5, val: 97, context: 'Fasting', date: '06 Sep, 08:00 AM', note: 'Resting baseline' },
  { id: 6, val: 104, context: 'Bedtime', date: '05 Sep, 10:30 PM', note: 'Evening check' },
  { id: 7, val: 95, context: 'Fasting', date: '04 Sep, 08:15 AM', note: 'Optimal resting fasting' }
];

export const AppState = {
  theme: localStorage.getItem('diapredict_theme') || 'light',
  authenticated: true,
  currentView: 'overview',
  user: { ...DEFAULT_USER },
  latestAssessment: null,
  activeDetailReport: null,
  reports: [...DEFAULT_REPORTS],
  glucoseReadings: [...DEFAULT_GLUCOSE],
  filters: {
    query: '',
    risk: 'all',
    sort: 'newest'
  },

  // State Persistence Helpers
  saveUser() {
    try {
      localStorage.setItem('diapredict_user', JSON.stringify(this.user));
    } catch (e) {}
  },

  saveReports() {
    try {
      localStorage.setItem('diapredict_reports', JSON.stringify(this.reports));
    } catch (e) {}
  },

  saveGlucose() {
    try {
      localStorage.setItem('diapredict_glucose', JSON.stringify(this.glucoseReadings));
    } catch (e) {}
  },

  setTheme(newTheme) {
    this.theme = newTheme;
    localStorage.setItem('diapredict_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }
};

// Hydrate from LocalStorage
try {
  const savedUser = localStorage.getItem('diapredict_user');
  if (savedUser) AppState.user = { ...DEFAULT_USER, ...JSON.parse(savedUser) };

  const savedReports = localStorage.getItem('diapredict_reports');
  if (savedReports) AppState.reports = JSON.parse(savedReports);

  const savedGlucose = localStorage.getItem('diapredict_glucose');
  if (savedGlucose) AppState.glucoseReadings = JSON.parse(savedGlucose);
} catch (err) {
  console.warn('LocalStorage hydration notice:', err);
}

if (AppState.reports.length > 0) {
  AppState.latestAssessment = AppState.reports[0];
  AppState.activeDetailReport = AppState.reports[0];
}

if (typeof window !== 'undefined') {
  window.AppState = AppState;
}
