/**
 * GlucoseSense / DIA-PREDICT — Central Application State
 * Reactive state container with persistent LocalStorage synchronization.
 */

const DEFAULT_USER = {
  name: 'Guest User',
  email: 'guest@example.com',
  age: 28,
  gender: 'Male',
  avatarLetter: 'G',
  avatarBg: '#059669'
};

const DEFAULT_REPORTS = [
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
