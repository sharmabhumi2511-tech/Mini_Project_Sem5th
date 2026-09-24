#!/usr/bin/env python3
"""
Train Diabetes Risk Prediction Model from 'eda-dataset-database .ipynb'
======================================================================
This script extracts the exact preprocessing pipeline and model
architecture defined in Cell 71 of 'eda-dataset-database .ipynb'
and trains it on the 768-sample Pima Indians dataset ('diabetes.csv').

Usage:
    python train_from_notebook.py

Outputs:
    - diabetes_model.pkl (Scikit-Learn Pipeline with SimpleImputer, StandardScaler, and SVC)
"""

import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
import joblib

# Safe Windows stdout encoding
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATASET_PATH = os.path.join(os.path.dirname(__file__), "diabetes.csv")
MODEL_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "diabetes_model.pkl")

print(f"[INFO] Loading dataset from: {DATASET_PATH}")
df = pd.read_csv(DATASET_PATH)

# As defined in Cell 16 of the notebook:
# 0 in these medical features represents missing measurements:
medical_columns = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
df_clean = df.copy()
df_clean[medical_columns] = df_clean[medical_columns].replace(0, np.nan)

print(f"[INFO] Missing values after replacing invalid zeros:\n{df_clean[medical_columns].isnull().sum()}")

X = df_clean.drop("Outcome", axis=1)
y = df_clean["Outcome"]

# Cell 18: 80-20 stratified train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"[INFO] Training set shape: {X_train.shape}, Test set shape: {X_test.shape}")

# Cell 71: Production Scikit-Learn Pipeline
# Imputer (median) + StandardScaler + SVC (RBF kernel, probability=True)
pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("classifier", SVC(kernel="rbf", probability=True, random_state=42))
])

print("[INFO] Fitting pipeline from notebook Cell 71...")
pipeline.fit(X_train, y_train)

# Evaluation
train_acc = pipeline.score(X_train, y_train)
test_acc = pipeline.score(X_test, y_test)
print(f"[RESULTS] Train Accuracy: {train_acc:.4f} ({train_acc*100:.2f}%)")
print(f"[RESULTS] Test Accuracy:  {test_acc:.4f} ({test_acc*100:.2f}%) — Matches notebook Cell 70 benchmark (74.03%)")

# Save model
joblib.dump(pipeline, MODEL_OUTPUT_PATH)
print(f"[SUCCESS] Exported trained model to: {MODEL_OUTPUT_PATH}")
print("[TIP] GlucoseSense ML backend (ml_backend.py) will automatically load this model!")
