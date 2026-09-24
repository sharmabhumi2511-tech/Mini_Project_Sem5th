/**
 * GlucoseSense / DIA-PREDICT — Explainable AI (SHAP) Chart Component
 */

export function renderShapBars(shapData, containerId) {
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
    const numericVal = typeof item.value === 'number' ? item.value.toFixed(2) : '0.00';

    row.innerHTML = `
      <div class="shap-feature-title" title="${item.feature}">${item.feature}</div>
      <div class="shap-bar-track" role="progressbar" aria-valuenow="${barWidthPercent}" aria-valuemin="0" aria-valuemax="100">
        <div class="shap-bar-fill ${isPositive ? 'positive' : 'negative'}" style="width: ${barWidthPercent}%;"></div>
      </div>
      <div class="shap-val-badge ${isPositive ? 'positive' : 'negative'}">${sign}${numericVal}</div>
    `;

    container.appendChild(row);
  });
}

if (typeof window !== 'undefined') {
  window.renderShapBars = renderShapBars;
}
