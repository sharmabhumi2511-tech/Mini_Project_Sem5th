/**
 * GlucoseSense / DIA-PREDICT — Risk Gauge Visualizer Component
 */

export function updateRiskGauge(probability, category) {
  const gaugeCircle = document.getElementById('resultGaugeCircle');
  if (!gaugeCircle) return;

  const circumference = 339.29; // 2 * PI * 54
  const clampedProb = Math.max(0, Math.min(100, probability));
  const offset = circumference * (1 - (clampedProb / 100));

  gaugeCircle.style.strokeDashoffset = offset;

  if (category === 'High Risk') {
    gaugeCircle.style.stroke = 'var(--status-elevated)';
  } else if (category === 'Moderate Risk') {
    gaugeCircle.style.stroke = 'var(--status-attention)';
  } else {
    gaugeCircle.style.stroke = 'var(--primary)';
  }
}

if (typeof window !== 'undefined') {
  window.updateRiskGauge = updateRiskGauge;
}
