/**
 * GlucoseSense / DIA-PREDICT — Assessment Result & Explainable AI View
 */

import { AppState } from '../state.js';
import { updateRiskGauge } from '../components/gauge.js';
import { renderShapBars } from '../components/shap-chart.js';
import { showToast } from '../components/toast.js';

export function displayPredictionResult(data) {
  const probVal = document.getElementById('resultProbabilityVal');
  const catText = document.getElementById('resultCategoryText');
  const badge = document.getElementById('resultStatusBadge');
  const confVal = document.getElementById('resultConfidenceVal');
  const dateVal = document.getElementById('resultDateVal');
  const statement = document.getElementById('resultStatementText');
  const extended = document.getElementById('resultExtendedText');
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

  // Update circular SVG gauge
  updateRiskGauge(data.risk, data.category);

  if (demoBadge) {
    demoBadge.textContent = data.isDemo ? 'Baseline explanation' : 'Model explanation';
  }

  // Clinical synthesis narrative
  if (statement) {
    statement.textContent = data.category === 'Low Risk'
      ? "“Based on the clinical parameters provided, the model estimates a relatively lower risk for Type 2 Diabetes.”"
      : (data.category === 'Moderate Risk'
        ? "“Based on the clinical parameters provided, moderate risk considerations were detected requiring proactive monitoring.”"
        : "“Based on the clinical parameters provided, elevated diabetes risk indicators were identified.”");
  }

  if (extended) {
    extended.textContent = `Fasting glucose (${data.glucose} mg/dL) and BMI (${data.bmi} kg/m²) are primary clinical indicators. Consistent physical activity and balanced nutrition support personal health trends.`;
  }

  // Render explainable AI feature contribution bars
  renderShapBars(data.shap, 'shapBarsContainer');
}

export function saveCurrentAssessment() {
  if (!AppState.latestAssessment) return;

  const existingIndex = AppState.reports.findIndex(r => r.id === AppState.latestAssessment.id);
  if (existingIndex === -1) {
    AppState.reports.unshift(AppState.latestAssessment);
    AppState.saveReports();
  }

  if (window.renderReportsTable) window.renderReportsTable();
  if (window.renderDashboardOverview) window.renderDashboardOverview();
  showToast('Assessment saved to health records.', 'success');
  if (window.navigateTo) window.navigateTo('reports');
}

if (typeof window !== 'undefined') {
  window.displayPredictionResult = displayPredictionResult;
  window.saveCurrentAssessment = saveCurrentAssessment;
}
