/**
 * GlucoseSense / DIA-PREDICT — Risk Assessment View Handler
 */

import { AppState } from '../state.js';
import { ApiService } from '../services/api.service.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { displayPredictionResult } from './result.view.js';

const wait = (ms) => new Promise(res => setTimeout(res, ms));

export async function handlePredictionSubmit(e) {
  if (e) e.preventDefault();

  const pregnancies = parseFloat(document.getElementById('assessPregnancies')?.value ?? 0);
  const glucose = parseFloat(document.getElementById('assessGlucose')?.value);
  const bp = parseFloat(document.getElementById('assessBp')?.value);
  const skin = parseFloat(document.getElementById('assessSkin')?.value) || 20;
  const insulin = parseFloat(document.getElementById('assessInsulin')?.value) || 85;
  const bmi = parseFloat(document.getElementById('assessBmi')?.value);
  const pedigree = parseFloat(document.getElementById('assessPedigree')?.value);
  const age = parseFloat(document.getElementById('assessAge')?.value);

  let hasError = false;
  const validateField = (id, valid) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (!valid) {
      input.classList.add('is-invalid');
      hasError = true;
    } else {
      input.classList.remove('is-invalid');
    }
  };

  validateField('assessPregnancies', !isNaN(pregnancies) && pregnancies >= 0 && pregnancies <= 25);
  validateField('assessGlucose', !isNaN(glucose) && glucose >= 40 && glucose <= 450);
  validateField('assessBp', !isNaN(bp) && bp >= 40 && bp <= 180);
  validateField('assessBmi', !isNaN(bmi) && bmi >= 10 && bmi <= 75);
  validateField('assessPedigree', !isNaN(pedigree) && pedigree >= 0.05 && pedigree <= 3.0);
  validateField('assessAge', !isNaN(age) && age >= 18 && age <= 120);

  if (hasError) {
    showToast('Please check the highlighted clinical fields for valid ranges.', 'warning');
    return;
  }

  openModal('predictLoaderModal');
  const stepRows = [
    document.getElementById('pStep1'),
    document.getElementById('pStep2'),
    document.getElementById('pStep3'),
    document.getElementById('pStep4')
  ];

  stepRows.forEach(r => { if (r) r.className = 'predict-step-row'; });
  if (stepRows[0]) stepRows[0].className = 'predict-step-row active';

  try {
    await wait(280);
    if (stepRows[0]) stepRows[0].className = 'predict-step-row completed';
    if (stepRows[1]) stepRows[1].className = 'predict-step-row active';

    await wait(280);
    if (stepRows[1]) stepRows[1].className = 'predict-step-row completed';
    if (stepRows[2]) stepRows[2].className = 'predict-step-row active';

    const modelPayload = { pregnancies, glucose, bloodPressure: bp, skinThickness: skin, insulin, bmi, diabetesPedigree: pedigree, age };
    const predictionResult = await ApiService.predictRisk(modelPayload);

    await wait(280);
    if (stepRows[2]) stepRows[2].className = 'predict-step-row completed';
    if (stepRows[3]) stepRows[3].className = 'predict-step-row active';

    await wait(280);
    if (stepRows[3]) stepRows[3].className = 'predict-step-row completed';

    closeModal('predictLoaderModal');

    const assessment = {
      id: `RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      risk: predictionResult.probability,
      category: predictionResult.risk,
      confidence: predictionResult.confidence,
      glucose,
      bmi,
      bp,
      pregnancies,
      skin,
      insulin,
      pedigree,
      age,
      shap: predictionResult.shap,
      isDemo: predictionResult.isDemo,
      modelName: predictionResult.modelName
    };

    AppState.latestAssessment = assessment;
    AppState.activeDetailReport = assessment;

    displayPredictionResult(assessment);
    if (window.navigateTo) window.navigateTo('result');
    showToast('Your health risk evaluation is ready.', 'success');

  } catch (err) {
    closeModal('predictLoaderModal');
    showToast('Failed to evaluate assessment. Please try again.', 'error');
  }
}

if (typeof window !== 'undefined') {
  window.handlePredictionSubmit = handlePredictionSubmit;
}
