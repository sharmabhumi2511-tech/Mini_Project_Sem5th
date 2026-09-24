
/**
 * GlucoseSense / DIA-PREDICT — Glucose Tracking View
 */

import { AppState } from '../state.js';
import { renderGlucoseChart } from '../components/glucose-chart.js';
import { showToast } from '../components/toast.js';

export function renderGlucoseTracking() {
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

  // Draw interactive SVG timeline
  renderGlucoseChart(readings, 'glucoseTrackingSvg');

  // Populate log table
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
        AppState.saveGlucose();
        renderGlucoseTracking();
        if (window.renderDashboardOverview) window.renderDashboardOverview();
        showToast('Glucose entry removed.');
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.renderGlucoseTracking = renderGlucoseTracking;
}
