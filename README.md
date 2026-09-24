# GlucoseSense / DIA-PREDICT
### Industrial-Grade Clinical Decision Support System with Explainable AI (SHAP)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Node: 18+](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Machine Learning: Scikit--Learn](https://img.shields.io/badge/ML-Scikit--Learn%20%7C%20SHAP-orange.svg)](https://scikit-learn.org/)
[![Code Quality: Audited](https://img.shields.io/badge/Architecture-Industrial%20Modular-teal.svg)](#architecture)

GlucoseSense (DIA-PREDICT) is an industry-standard, full-stack **Clinical Decision Support System (CDSS)** for Type 2 Diabetes risk stratification. It bridges the gap between academic Machine Learning prototypes and production software engineering by pairing a trained, calibrated Scikit-Learn pipeline with **Explainable AI (TreeSHAP / Additive Attributions)**, automated biological zero imputation, and a single-command development runtime.

---

## 1. Key Features

- **Clinical Biomarker Risk Stratification:** Evaluates 8 diagnostic physiological features (Pregnancies, Fasting Glucose, Blood Pressure, Skinfold Thickness, Serum Insulin, BMI, Diabetes Pedigree Function, Age) and computes a calibrated risk probability (5%–95%) and confidence score.
- **Explainable AI (SHAP Local Feature Attributions):** Demystifies "black-box" predictions by presenting exact mathematical contributions of each biomarker categorized into **Elevating Risk Factors** (warm amber) vs. **Protective Factors** (calm azure).
- **Single-Command Unified Dev Experience:** One command (`npm run dev`) launches both the Python ML backend and Express dev server with an integrated reverse proxy, health probe, and automatic browser launch.
- **Automated Medical Zero Imputation:** Physiological zeros in blood glucose, BP, skinfold, insulin, and BMI are converted to `NaN` and imputed via median imputation to eliminate statistical bias.
- **Longitudinal Blood Glucose Tracking:** Interactive SVG trend timeline with target range reference band (70–130 mg/dL), context tagging (Fasting, Post-Meal, Bedtime), and metric tracking (Average, Highest, Lowest).
- **Patient Health Record Archive:** Persistent search, risk category filtering (Low / Moderate / High), chronological sorting, deletion, and printable clinical report generation (`window.print()`).
- **Data Sovereignty & JSON Export:** 100% private, client-side persistence with one-click full-archive JSON backup.
- **Dual-Mode ML Adapter:** Operates seamlessly with the trained live ML model (`diabetes_model.pkl`) or degrades gracefully to a calibrated population baseline simulation if the backend is offline.
- **Modern Healthcare Design System:** Fluid glassmorphic canvas, responsive breakpoints (Desktop, Tablet, Mobile), accessible ARIA standards, and dual light/dark themes (Calm Medical Night `#101817`).

---

## 2. System Architecture

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

## 3. Technology Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS, ES Modules | Pure web standard, ultra-fast load time, zero heavy build overhead, highly customizable glassmorphism. |
| **Gateway / Dev Server** | Node.js, Express, `http-proxy-middleware` | Serves client assets and proxies `/api/*` to the Python backend, completely eliminating browser CORS issues. |
| **Backend API** | Python 3, Flask, Flask-CORS, Werkzeug | Lightweight, asynchronous REST API adhering to MVC separation of concerns. |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy, Joblib | Standardized Pipeline with `SimpleImputer` (median), `StandardScaler`, and `SVC` (RBF kernel). |
| **Explainable AI (XAI)**| SHAP (SHapley Additive exPlanations) | Mathematical game-theory local attribution for transparent clinical decision support. |
| **Testing** | Node test runner, Python `unittest` | Comprehensive unit, boundary, and full-stack integration tests. |

---

## 4. Project Directory Structure

```text
Mini_project_sem5th/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets, icons, manifest
│   │   ├── favicon.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── js/                 # Modular JavaScript architecture
│   │   │   ├── config.js       # Endpoints & clinical reference bounds
│   │   │   ├── state.js        # Centralized reactive AppState & LocalStorage
│   │   │   ├── services/       # api.service.js, export.service.js
│   │   │   ├── components/     # toast.js, modal.js, gauge.js, shap-chart.js, glucose-chart.js
│   │   │   └── views/          # overview, assess, result, reports, glucose
│   │   └── styles/             # Design tokens & modular CSS
│   ├── index.html              # Semantic HTML5 entry point
│   ├── app.js                  # Frontend controller
│   └── style.css               # Design system stylesheet
│
├── server/                     # Production Python Flask Backend
│   ├── src/
│   │   ├── config/             # settings.py (centralized .env loader)
│   │   ├── controllers/        # health, prediction, metrics controllers
│   │   ├── routes/             # api_routes.py blueprint
│   │   ├── services/           # ml_service.py, shap_service.py
│   │   ├── middleware/         # error_handler, request_logger, rate_limiter, security
│   │   ├── validators/         # clinical_validator.py
│   │   ├── errors/             # custom_errors.py
│   │   └── utils/              # response_helper.py, logger.py
│   ├── tests/                  # test_health.py, test_predict.py
│   ├── app.py                  # Flask application factory & runner
│   └── requirements.txt        # Python backend dependencies
│
├── ml/                         # Machine Learning Subsystem
│   ├── data/                   # diabetes.csv (768 clinical observations)
│   ├── models/                 # diabetes_model.pkl, model_metadata.json
│   ├── notebooks/              # eda-dataset-database.ipynb
│   └── scripts/                # train_model.py (reproducible training pipeline)
│
├── scripts/                    # Developer Tooling & Automation
│   ├── dev-server.js           # Single-command orchestrator & reverse-proxy
│   ├── run-tests.js            # Automated multi-suite test runner
│   ├── lint.js                 # Syntax and static code quality linter
│   └── clean.js                # Cache and temporary file cleanup
│
├── docs/                       # Comprehensive Documentation
│   ├── ARCHITECTURE.md         # Deep-dive system architecture
│   ├── API_SPEC.md             # REST API specifications & schemas
│   └── VIVA_PRESENTATION_GUIDE.md # Viva presentation script & Top 10 Q&A
│
├── tests/                      # Full-stack integration smoke tests
│   └── test_integration.js     # End-to-end network proxy validation
│
├── .env.example                # Documented configuration template
├── .env                        # Local active configuration
├── .gitignore                  # Git exclusion rules
├── package.json                # Single-command npm scripts
└── README.md                   # Project documentation
```

---

## 5. Prerequisites

Ensure you have the following installed on your system:
- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python:** v3.10 or higher ([Download Python](https://www.python.org/))
- **Git** (optional)

---

## 6. Installation & Quickstart

Clone the repository and install dependencies:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Install Python backend dependencies
pip install -r server/requirements.txt
```

### Run the Complete Application (Single Command):

```bash
npm run dev
```

That's it! The orchestrator will:
1. Detect Python and launch `server/app.py` on internal port 5000.
2. Launch the Express web server and API reverse-proxy on port 3000.
3. Automatically load the trained Scikit-Learn Pipeline (`ml/models/diabetes_model.pkl`).
4. Open `http://localhost:3000` in your default browser.

---

## 7. Available npm Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts frontend, backend, and reverse proxy in a single command |
| `npm start` | Production startup alias |
| `npm test` | Runs complete test suite: Python unit tests, model verification, and proxy integration |
| `npm run test:backend` | Runs only Python backend unit tests (`server/tests`) |
| `npm run train` | Re-trains the Machine Learning pipeline on `ml/data/diabetes.csv` |
| `npm run lint` | Runs syntax and quality checks across JS and Python files |
| `npm run clean` | Purges temporary `__pycache__` and cache directories |

---

## 8. Environment Configuration (`.env`)

GlucoseSense uses a `.env` file for centralized configuration. A documented template is provided in `.env.example`:

```ini
# Application Environment ('development' | 'production')
NODE_ENV=development
DEBUG=true

# Client Web Application Port (Accessed in browser)
CLIENT_PORT=3000
PORT=3000

# Python Machine Learning Backend API Service Port (Internal)
BACKEND_PORT=5000

# Network Bindings
HOST=0.0.0.0
CLIENT_URL=http://localhost:3000

# Machine Learning Artifact Paths
MODEL_PATH=ml/models/diabetes_model.pkl
DATASET_PATH=ml/data/diabetes.csv
METADATA_PATH=ml/models/model_metadata.json

# API Rate Limiting (Requests per minute per client IP)
RATE_LIMIT_PER_MINUTE=120
```

---

## 9. REST API Documentation

All API responses follow a structured envelope:

### 1. `GET /api/health`
Returns system status, model loaded state, uptime, and version.
```json
{
  "success": true,
  "data": {
    "status": "online",
    "service": "GlucoseSense DIA-PREDICT ML Decision Support Service",
    "version": "2.1.0",
    "model_name": "Trained SVC Pipeline (Pima Indians Benchmark)",
    "model_loaded": true,
    "python_version": "3.13.7"
  }
}
```

### 2. `POST /api/predict`
Calculates diabetes risk probability and SHAP feature contributions.

**Request Payload:**
```json
{
  "pregnancies": 0,
  "glucose": 145,
  "bloodPressure": 82,
  "skinThickness": 26,
  "insulin": 120,
  "bmi": 28.4,
  "diabetesPedigree": 0.54,
  "age": 42
}
```

**Response Payload (`200 OK`):**
```json
{
  "success": true,
  "message": "Risk evaluation complete: Moderate Risk (42% probability).",
  "data": {
    "risk": "Moderate Risk",
    "probability": 42,
    "confidence": 88,
    "shap": [
      { "feature": "Fasting Blood Glucose", "value": 0.49, "impact": "Elevating (+0.49)" },
      { "feature": "Body Mass Index (BMI)", "value": 0.24, "impact": "Elevating (+0.24)" },
      { "feature": "Demographic Age", "value": 0.18, "impact": "Elevating (+0.18)" },
      { "feature": "Diastolic Blood Pressure", "value": -0.12, "impact": "Protective (-0.12)" },
      { "feature": "Genetic Pedigree Score", "value": 0.07, "impact": "Elevating (+0.07)" },
      { "feature": "Serum Insulin", "value": -0.04, "impact": "Protective (-0.04)" }
    ],
    "model_name": "Trained SVC Pipeline (Pima Indians Benchmark)",
    "is_demo": false
  }
}
```

### 3. `GET /api/metrics`
Returns dataset dimensions, cross-validation metrics, and training accuracy benchmarks.

---

## 10. Machine Learning Pipeline & Benchmark

The model is trained via `npm run train` (`ml/scripts/train_model.py`):
- **Dataset:** 768 patient observations from the Pima Indians Diabetes Database.
- **Handling Biological Incompatibilities:** Readings of 0 in Glucose, Blood Pressure, Skin Thickness, Insulin, and BMI are marked as `NaN` and imputed via `SimpleImputer(strategy="median")`.
- **Scaling:** `StandardScaler` standardizes variables to zero mean and unit variance.
- **Classifier:** Support Vector Machine (`SVC`) with Radial Basis Function (`rbf`) kernel and Platt probability calibration.
- **Benchmarks:**
  - **Training Accuracy:** `84.04%`
  - **Test Accuracy (80/20 held-out split):** `74.03%`
  - **Test ROC-AUC:** `0.7964`
  - **5-Fold Stratified Cross-Validation Accuracy:** `78.01% (+/- 0.027)`
  - **5-Fold Stratified Cross-Validation ROC-AUC:** `83.33% (+/- 0.045)`

---

## 11. Academic Presentation & Viva Resources

For college examinations, hackathon presentations, or viva evaluations:
- Read the **[College Viva & Presentation Guide](docs/VIVA_PRESENTATION_GUIDE.md)** for a 2-minute elevator pitch, demo checklist, and answers to the top 10 examiner questions.
- Review **[System Architecture](docs/ARCHITECTURE.md)** for detailed technical diagrams.
- Review **[API Specification](docs/API_SPEC.md)** for OpenAPI-style contract definitions.

---

## 12. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
