/**
 * GlucoseSense / DIA-PREDICT — Overview Dashboard View
 */

import { AppState } from '../state.js';

export function renderDashboardOverview() {
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

if (typeof window !== 'undefined') {
  window.renderDashboardOverview = renderDashboardOverview;
}
