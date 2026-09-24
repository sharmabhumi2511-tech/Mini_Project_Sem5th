# System Architecture & Technical Design Specification
**Project:** GlucoseSense / DIA-PREDICT  
**Version:** 2.1.0  
**Classification:** Clinical Decision Support System (CDSS) for Type 2 Diabetes Stratification

---

## 1. Architectural Overview

GlucoseSense utilizes a **decoupled, multi-tier industrial architecture** combining a responsive, humanized web application shell with an asynchronous Machine Learning inference engine and reverse-proxy gateway.

```
+-------------------------------------------------------------------------+
|                              USER BROWSER                               |
|        (Desktop / Tablet / Mobile - Modern Healthcare Glassmorphic UI)   |
+------------------------------------+------------------------------------+
                                     |
                         HTTP / JSON | Port 3000 (Reverse Proxy)
                                     v
+-------------------------------------------------------------------------+
|                         NODE.JS / EXPRESS GATEWAY                       |
|   - Serves static assets (HTML5 / Vanilla CSS / ES Modules)             |
|   - Reverse-proxies /api/* requests to internal Python service          |
|   - Orchestrates unified startup, health probing & graceful shutdown     |
+------------------------------------+------------------------------------+
                                     |
                          Proxy IPC  | Port 5000 (Internal)
                                     v
+-------------------------------------------------------------------------+
|                       PYTHON FLASK ML BACKEND SERVICE                   |
|                                                                         |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | Request Logger &   |  | In-Memory Rate     |  | Clinical Schema    | |
|  | Security Headers   |  | Limiter (120/min)  |  | Input Validator    | |
|  +--------------------+  +--------------------+  +--------------------+ |
|                                    |                                    |
|                                    v                                    |
|  +-------------------------------------------------------------------+  |
|  |                     MACHINE LEARNING SUBSYSTEM                    |  |
|  |                                                                   |  |
|  |  [Input Vector (8 Biomarkers)]                                    |  |
|  |         |                                                         |  |
|  |         v                                                         |  |
|  |  [Step 1: SimpleImputer (Median strategy for zero-value voids)]   |  |
|  |         |                                                         |  |
|  |         v                                                         |  |
|  |  [Step 2: StandardScaler (Zero-mean, unit variance scaling)]      |  |
|  |         |                                                         |  |
|  |         v                                                         |  |
|  |  [Step 3: SVC RBF Kernel Classifier (probability=True)]          |  |
|  |         |                                                         |  |
|  |         +-----------------------+-------------------------+       |  |
|  |         v                                                 v       |  |
|  |  [Probability & Risk Category]               [SHAP Explainability]|  |
|  |  - Low Risk (< 28%)                          - Local additive     |  |
|  |  - Moderate Risk (28-49%)                      feature impacts    |  |
|  |  - High Risk (>= 50%)                        - Elevating vs       |  |
|  |                                                Protective bars    |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Directory Structure & Responsibilities

| Directory | Layer | Purpose |
| :--- | :--- | :--- |
| `client/` | Frontend Presentation | HTML5, CSS3 design tokens, modular ES scripts, icons, manifest |
| `server/` | Application Backend | Production Flask API, blueprints, controllers, middleware, validators |
| `ml/` | Data Science & Modeling | Raw dataset (`diabetes.csv`), serialized pipeline (`diabetes_model.pkl`), retraining pipeline |
| `scripts/` | Tooling & Orchestration | `dev-server.js` (unified single-command runner), `run-tests.js`, `lint.js`, `clean.js` |
| `docs/` | Technical Documentation | Architectural design, API specifications, and college viva guide |
| `tests/` | Quality Assurance | End-to-end network integration smoke tests |

---

## 3. Machine Learning Pipeline Specification

### 3.1 Dataset Benchmark
- **Source:** Pima Indians Diabetes Database (National Institute of Diabetes and Digestive and Kidney Diseases).
- **Observations:** 768 patient records with binary clinical outcome (0 = Non-Diabetic, 1 = Diabetic).
- **Features (8 Clinical Biomarkers):**
  1. `Pregnancies`: Number of pregnancies.
  2. `Glucose`: Plasma glucose concentration (2 hours in an oral glucose tolerance test).
  3. `BloodPressure`: Diastolic blood pressure ($mm\,Hg$).
  4. `SkinThickness`: Triceps skin fold thickness ($mm$).
  5. `Insulin`: 2-Hour serum insulin ($\mu IU/mL$).
  6. `BMI`: Body Mass Index ($kg/m^2$).
  7. `DiabetesPedigreeFunction`: Genetic pedigree score.
  8. `Age`: Patient age in years.

### 3.2 Preprocessing & Pipeline Architecture
In biological observations, readings of 0 in Glucose, Blood Pressure, Skin Thickness, Insulin, or BMI represent missing physiological measurements rather than true zeroes. The pipeline cleanses these values using:
1. **Biological Zero Transformation:** Zeros in clinical features are converted to `np.nan`.
2. **Median Imputation (`SimpleImputer`):** Robust against extreme clinical outliers.
3. **Z-Score Normalization (`StandardScaler`):** Normalizes heterogeneous scales (e.g., Insulin vs. Pedigree) to $\mu = 0, \sigma = 1$.
4. **Classification Algorithm (`SVC`):** Support Vector Machine with Radial Basis Function (RBF) kernel with Platt calibration (`probability=True`).

### 3.3 Explainable AI (XAI) with SHAP
The pipeline incorporates Explainable AI principles:
- Rather than a "black-box" score, the model computes **local additive feature attributions** ($\phi_i$).
- Positive SHAP attributions ($\phi_i > 0$) highlight **Elevating Risk Factors** (e.g., elevated fasting glucose or high BMI).
- Negative SHAP attributions ($\phi_i < 0$) highlight **Protective Factors** (e.g., optimal blood pressure or young demographic age).

---

## 4. Single-Command Development Experience

The single development command:
```bash
npm run dev
```
initiates the following automated lifecycle:
1. Inspects the runtime environment and locates Python 3.
2. Spawns `server/app.py` in unbuffered mode on internal port 5000.
3. Initializes an Express dev server on port 3000.
4. Mounts `http-proxy-middleware` forwarding `/api/*` to `:5000/api/*`.
5. Continuously polls `/api/health` until the machine learning model loads.
6. Displays a formatted ASCII console dashboard.
7. Automatically launches the user's default browser to `http://localhost:3000`.
8. Intercepts `SIGINT` (Ctrl+C) and terminates both Node and Python process trees gracefully on Windows, macOS, and Linux.
