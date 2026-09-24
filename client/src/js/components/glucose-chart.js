/**
 * GlucoseSense / DIA-PREDICT — Interactive Glucose Trend SVG Chart
 */

export function renderGlucoseChart(readings, svgId = 'glucoseTrackingSvg') {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  if (!readings || readings.length === 0) {
    svg.innerHTML = `
      <text x="300" y="90" text-anchor="middle" fill="var(--text-muted)" font-size="12">
        No recent blood glucose readings to display
      </text>
    `;
    return;
  }

  // Take the most recent 7 readings in chronological order
  const slice = readings.slice(0, 7).reverse();
  const width = 600;
  const height = 180;
  const minVal = 50;
  const maxVal = 160;

  const points = slice.map((item, idx) => {
    const x = Math.round(45 + (idx * (510 / (slice.length - 1 || 1))));
    const val = item.val || 100;
    const y = Math.round(height - 25 - ((val - minVal) / (maxVal - minVal)) * (height - 55));
    return { x, y, val, date: item.date, context: item.context };
  });

  const polylinePts = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPts = `45,${height - 20} ` + polylinePts + ` ${points[points.length - 1].x},${height - 20}`;

  let circlesSvg = '';
  points.forEach(p => {
    circlesSvg += `
      <circle class="chart-point" cx="${p.x}" cy="${p.y}" r="4.5" tabindex="0">
        <title>${p.date} (${p.context}): ${p.val} mg/dL</title>
      </circle>
    `;
  });

  svg.innerHTML = `
    <!-- Normal Clinical Reference Zone (70 - 130 mg/dL) -->
    <rect x="0" y="55" width="600" height="75" fill="var(--primary-soft)" opacity="0.65"/>
    <text x="590" y="68" text-anchor="end" fill="var(--primary)" font-size="9" font-weight="600">Target Range (70-130)</text>

    <!-- Grid Guidelines -->
    <line x1="0" y1="130" x2="600" y2="130" stroke="var(--border)" stroke-dasharray="3 3"/>
    <line x1="0" y1="55" x2="600" y2="55" stroke="var(--border)" stroke-dasharray="3 3"/>

    <!-- Trend Area & Polyline -->
    <polygon class="chart-area" points="${areaPts}"></polygon>
    <polyline class="chart-line" points="${polylinePts}"></polyline>

    <!-- Interactive Data Points -->
    ${circlesSvg}
  `;
}

if (typeof window !== 'undefined') {
  window.renderGlucoseChart = renderGlucoseChart;
}
