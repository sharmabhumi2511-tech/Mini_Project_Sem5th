/**
 * GlucoseSense / DIA-PREDICT — Client Configuration & API Endpoints
 */

const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

export const APP_CONFIG = {
  APP_NAME: 'GlucoseSense',
  APP_TAGLINE: 'DIA-PREDICT • Decision Support',
  VERSION: '2.1.0',
  DEFAULT_API_BASE: isFileProtocol ? 'http://127.0.0.1:5000' : ''
};

export const ML_CONFIG = {
  apiUrl: localStorage.getItem('diapredict_ml_url') || `${APP_CONFIG.DEFAULT_API_BASE}/api/predict`,
  healthUrl: localStorage.getItem('diapredict_ml_health_url') || `${APP_CONFIG.DEFAULT_API_BASE}/api/health`,
  metricsUrl: `${APP_CONFIG.DEFAULT_API_BASE}/api/metrics`,
  mode: localStorage.getItem('diapredict_ml_mode') || 'auto', // 'auto' | 'backend_only' | 'simulation'
  timeoutMs: 4500,
  isConnected: false,
  modelName: 'Clinical Benchmark (Simulation)',
  latencyMs: null
};

// Clinical Parameter Reference Bounds
export const CLINICAL_METRICS_INFO = {
  glucose: { name: 'Fasting Blood Glucose', unit: 'mg/dL', optimal: '70 – 99', prediabetes: '100 – 125', elevated: '≥ 126' },
  bmi: { name: 'Body Mass Index', unit: 'kg/m²', optimal: '18.5 – 24.9', overweight: '25.0 – 29.9', elevated: '≥ 30.0' },
  bloodPressure: { name: 'Diastolic Blood Pressure', unit: 'mm Hg', optimal: '60 – 80', elevated: '> 80' },
  insulin: { name: 'Serum Insulin', unit: 'µIU/mL', reference: '16 – 166' },
  skinThickness: { name: 'Skin Thickness', unit: 'mm', reference: '10 – 30' },
  pedigree: { name: 'Pedigree Function', unit: 'score', reference: '0.08 – 2.42' },
  age: { name: 'Age', unit: 'years', reference: 'Adult Cohort' }
};

if (typeof window !== 'undefined') {
  window.ML_CONFIG = ML_CONFIG;
  window.APP_CONFIG = APP_CONFIG;
}
