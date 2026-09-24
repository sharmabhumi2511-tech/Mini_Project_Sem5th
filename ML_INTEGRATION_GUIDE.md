# GlucoseSense (DIA-PREDICT) — Machine Learning Integration Guide

Welcome! GlucoseSense is architected with a **decoupled, production-grade ML adapter layer**.

You can run the web application right now immediately with zero configuration. When you are ready to train and link your own custom Machine Learning model, follow this simple 3-step guide!

---

## 1. Quick Overview

```
┌──────────────────────────────────────────────────┐
│  GlucoseSense Frontend (index.html + app.js)     │
│  - Calibrated clinical simulation (Default)       │
│  - Configurable backend URL: Settings page       │
└────────────────────────┬─────────────────────────┘
                         │ POST /api/predict
                         ▼
┌──────────────────────────────────────────────────┐
│  Python Backend Server (ml_backend.py)           │
│  - Flask + Flask-CORS                            │
│  - Loads 'diabetes_model.pkl' (Joblib / Scikit)   │
│  - Calculates SHAP feature attributions          │
└──────────────────────────────────────────────────┘
```

- **Current Status (No ML trained yet)**: The app runs in **Calibrated Clinical Simulation Mode**. It uses clinical benchmark z-scores from the standard Pima Indians Diabetes Dataset to give realistic, evidence-informed predictions and demo SHAP attributions.
- **When your ML model is ready**: Just drop `diabetes_model.pkl` in this folder and start `python ml_backend.py`. The web interface will automatically detect it, connect, and switch to live model mode!

---

## 2. Training Your Model (Sample Python Script)

Here is a ready-to-use script to train an XGBoost or Random Forest model on the Pima Indians Diabetes dataset:

```python
# train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Load your dataset (Pima Indians Diabetes Dataset)
# Features must be in this exact order:
# 1. Pregnancies
# 2. Glucose
# 3. BloodPressure
# 4. SkinThickness
# 5. Insulin
# 6. BMI
# 7. DiabetesPedigreeFunction
# 8. Age
url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv"
columns = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness", 
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"
]
df = pd.read_csv(url, names=columns)

X = df.drop("Outcome", axis=1)
y = df["Outcome"]

# 2. Split and Train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
model.fit(X_train, y_train)

print(f"Model test accuracy: {model.score(X_test, y_test):.2%}")

# 3. Export as 'diabetes_model.pkl'
joblib.dump(model, "diabetes_model.pkl")
print("✅ Saved model as 'diabetes_model.pkl'!")
```

---

## 3. Starting the Python Backend

1. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the backend:
   ```bash
   python ml_backend.py
   ```
   The backend will start at: `http://127.0.0.1:5000`

---

## 4. Linking with GlucoseSense

1. Open GlucoseSense in your browser (`http://localhost:8000/` or by double-clicking `index.html`).
2. Navigate to **Settings** in the left sidebar.
3. In the **Trained ML Model Connection** section, click **Test Connection**.
4. The status badge will switch to:
   `🟢 Connected: Live ML Backend (http://127.0.0.1:5000)`
5. When you make an assessment on the **Check Your Diabetes Risk** page, your live trained model will calculate the risk probability and display genuine SHAP local feature attributions!

---

## 5. API Specification

### Endpoint: `POST /api/predict`

**Request Payload (JSON):**
```json
{
  "pregnancies": 0,
  "glucose": 98,
  "bloodPressure": 76,
  "skinThickness": 20,
  "insulin": 85,
  "bmi": 23.8,
  "diabetesPedigree": 0.45,
  "age": 28
}
```

**Response Payload (JSON):**
```json
{
  "risk": "Low Risk",
  "probability": 18,
  "confidence": 88,
  "shap": [
    { "feature": "Fasting Glucose", "value": -0.42, "impact": "Protective (-0.42)" },
    { "feature": "Body Mass Index", "value": -0.22, "impact": "Protective (-0.22)" },
    { "feature": "Demographic Age", "value": 0.12, "impact": "Elevating (+0.12)" },
    { "feature": "Diastolic BP", "value": -0.15, "impact": "Protective (-0.15)" },
    { "feature": "Pedigree Score", "value": 0.08, "impact": "Elevating (+0.08)" },
    { "feature": "Serum Insulin", "value": -0.05, "impact": "Protective (-0.05)" }
  ],
  "model_name": "Trained Model (RandomForestClassifier)",
  "is_demo": false
}
```

### Endpoint: `GET /api/health`

**Response Payload (JSON):**
```json
{
  "status": "online",
  "service": "GlucoseSense DIA-PREDICT ML Engine",
  "model_name": "Trained Model (RandomForestClassifier)",
  "model_file_present": true,
  "version": "2.0.0"
}
```
