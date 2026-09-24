/**
 * GlucoseSense / DIA-PREDICT — Reports Archive View
 */

import { AppState } from '../state.js';
import { renderShapBars } from '../components/shap-chart.js';
import { showToast } from '../components/toast.js';

export function renderReportsTable() {
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

    // Desktop table row
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

    // Mobile responsive card
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

  // Attach handlers
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
      if (confirm('Delete this assessment record?')) {
        AppState.reports = AppState.reports.filter(r => r.id !== id);
        AppState.saveReports();
        renderReportsTable();
        if (window.renderDashboardOverview) window.renderDashboardOverview();
        showToast('Assessment record deleted.');
      }
    });
  });
}

export function showReportDetail(report) {
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
    narrative.textContent = `The machine learning decision support pipeline evaluated clinical biomarkers for this report. Fasting blood glucose was recorded at ${report.glucose} mg/dL and Body Mass Index at ${report.bmi} kg/m². Based on the aggregated feature vector, the calculated probability of diabetes is ${report.risk}%, classifying this evaluation as ${report.category}.`;
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

  if (window.navigateTo) window.navigateTo('report-detail');
}

if (typeof window !== 'undefined') {
  window.renderReportsTable = renderReportsTable;
  window.showReportDetail = showReportDetail;
}
