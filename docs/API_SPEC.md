# GlucoseSense (DIA-PREDICT) — API Specification
**Version:** 2.1.0  
**Base URL:** `/api` (or `http://127.0.0.1:5000/api`)

All endpoints return JSON wrapped in an industrial-standard envelope:
```json
{
  "success": true,
  "data": {},
  "message": "Operation description"
}
```

---

## 1. System Health Check

### `GET /api/health`
Retrieves service operational health, model readiness, and runtime metadata.

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "online",
    "service": "GlucoseSense DIA-PREDICT ML Decision Support Service",
    "version": "2.1.0",
    "environment": "development",
    "uptime_seconds": 128,
    "model_name": "Trained SVC Pipeline (Pima Indians Benchmark)",
    "model_file_present": true,
    "model_loaded": true,
    "python_version": "3.13.7"
  },
  "message": "GlucoseSense DIA-PREDICT ML Decision Support Service is operating normally."
}
```

---

## 2. Risk Prediction & SHAP Inference

### `POST /api/predict`
Calculates calibrated diabetes risk probability and Explainable AI (SHAP) feature attributions.

#### Request Headers:
- `Content-Type: application/json`

#### Request Payload:
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

#### Valid Clinical Parameter Bounds:
| Feature | Type | Range | Description |
| :--- | :--- | :--- | :--- |
| `pregnancies` | number | 0 – 25 | Historical pregnancy count |
| `glucose` | number | 40 – 450 | Fasting plasma glucose ($mg/dL$) |
| `bloodPressure` | number | 40 – 180 | Diastolic blood pressure ($mm\,Hg$) |
| `skinThickness` | number | 0 – 100 | Triceps skinfold thickness ($mm$) |
| `insulin` | number | 0 – 900 | 2-Hour serum insulin ($\mu IU/mL$) |
| `bmi` | number | 10.0 – 75.0 | Body Mass Index ($kg/m^2$) |
| `diabetesPedigree` | number | 0.05 – 3.0 | Genetic pedigree score |
| `age` | number | 18 – 120 | Patient demographic age (years) |

#### Response: `200 OK`
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
    "is_demo": false,
    "features": {
      "pregnancies": 0,
      "glucose": 145,
      "bloodPressure": 82,
      "skinThickness": 26,
      "insulin": 120,
      "bmi": 28.4,
      "diabetesPedigree": 0.54,
      "age": 42
    }
  }
}
```

#### Error Response: `400 Bad Request`
```json
{
  "success": false,
  "message": "Clinical input validation failed. Please check medical parameter bounds.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "glucose": "Fasting Blood Glucose (mg/dL) must be between 40 and 450, received: 9999.0"
    }
  }
}
```

---

## 3. Model Benchmark Metrics

### `GET /api/metrics`
Returns statistical benchmarks, cross-validation metrics, and dataset metadata.

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "model_name": "Support Vector Classifier (RBF Kernel)",
    "metrics": {
      "train_accuracy": 0.8404,
      "test_accuracy": 0.7403,
      "test_roc_auc": 0.7964,
      "cv_accuracy_mean": 0.7801,
      "cv_roc_auc_mean": 0.8333
    },
    "dataset": {
      "source": "Pima Indians Diabetes Database",
      "total_records": 768,
      "features": ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
    },
    "version": "2.1.0"
  },
  "message": "Model evaluation benchmarks retrieved successfully."
}
```

---

## 4. Pipeline Architecture Details

### `GET /api/model/info`
Returns Scikit-Learn pipeline stages and clinical feature definitions.

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "model_name": "Trained SVC Pipeline (Pima Indians Benchmark)",
    "is_loaded": true,
    "pipeline_stages": [
      { "stage": 1, "name": "SimpleImputer", "strategy": "median", "description": "Imputes physiological 0 values with median" },
      { "stage": 2, "name": "StandardScaler", "description": "Standardizes feature distributions to zero mean and unit variance" },
      { "stage": 3, "name": "SVC (RBF)", "kernel": "rbf", "description": "Support Vector Classifier with Radial Basis Function kernel" }
    ],
    "features": [
      { "id": "pregnancies", "name": "Pregnancies", "range": "0 - 25", "unit": "count" },
      { "id": "glucose", "name": "Fasting Glucose", "range": "40 - 450", "unit": "mg/dL" },
      { "id": "bloodPressure", "name": "Diastolic Blood Pressure", "range": "40 - 180", "unit": "mm Hg" },
      { "id": "skinThickness", "name": "Triceps Skin Thickness", "range": "0 - 100", "unit": "mm" },
      { "id": "insulin", "name": "Serum Insulin", "range": "0 - 900", "unit": "µIU/mL" },
      { "id": "bmi", "name": "Body Mass Index", "range": "10 - 75", "unit": "kg/m²" },
      { "id": "diabetesPedigree", "name": "Diabetes Pedigree Function", "range": "0.05 - 3.0", "unit": "score" },
      { "id": "age", "name": "Demographic Age", "range": "18 - 120", "unit": "years" }
    ]
  },
  "message": "Pipeline architecture details."
}
```
