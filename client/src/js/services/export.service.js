/**
 * GlucoseSense / DIA-PREDICT — Data Export & Serialization Service
 */

import { AppState } from '../state.js';
import { APP_CONFIG } from '../config.js';
import { showToast } from '../components/toast.js';

export function exportUserDataJson() {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    application: APP_CONFIG.APP_NAME,
    tagline: APP_CONFIG.APP_TAGLINE,
    version: APP_CONFIG.VERSION,
    user: AppState.user,
    reports: AppState.reports,
    glucoseLog: AppState.glucoseReadings
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `glucosesense_health_records_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('Health records exported as JSON.', 'success');
}

if (typeof window !== 'undefined') {
  window.exportUserDataJson = exportUserDataJson;
}
