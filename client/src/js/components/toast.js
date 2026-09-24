/**
 * GlucoseSense / DIA-PREDICT — Toast Notification Component
 */

let toastTimer = null;

export function showToast(message, type = 'info', duration = 3400) {
  const toast = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMessage');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;

  // Icon / color styling based on type
  toast.classList.remove('toast-success', 'toast-error', 'toast-warning', 'toast-info');
  toast.classList.add(`toast-${type}`);

  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

if (typeof window !== 'undefined') {
  window.showToast = showToast;
}
