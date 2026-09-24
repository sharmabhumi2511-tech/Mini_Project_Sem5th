#!/usr/bin/env python3
"""
GlucoseSense / DIA-PREDICT — Production Machine Learning Training Pipeline
==========================================================================
Trains and validates a calibrated clinical prediction model on the Pima Indians
Diabetes Dataset (768 clinical observations).

Features:
- Handles zero-value clinical anomalies (Glucose, BP, Skin, Insulin, BMI) via NaN imputation
- Stratified 80/20 train-test split
- Robust Pipeline: Median Imputation -> StandardScaler -> SVC (RBF Kernel, probability=True)
- 5-Fold Stratified Cross Validation
- Comprehensive performance metrics (Accuracy, ROC-AUC, Precision, Recall, F1)
- Model metadata generation for auditability
"""

import os
import sys
import json
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib

# Safe console output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))

# Resolve data path
DATASET_CANDIDATES = [
    os.path.join(PROJECT_ROOT, "ml", "data", "diabetes.csv"),
    os.path.join(PROJECT_ROOT, "diabetes.csv")
]

DATASET_PATH = None
for candidate in DATASET_CANDIDATES:
    if os.path.exists(candidate):
        DATASET_PATH = candidate
        break

if not DATASET_PATH:
    raise FileNotFoundError(f"Could not locate 'diabetes.csv' in: {DATASET_CANDIDATES}")

MODEL_OUTPUT_DIR = os.path.join(PROJECT_ROOT, "ml", "models")
os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)
MODEL_OUTPUT_PATH = os.path.join(MODEL_OUTPUT_DIR, "diabetes_model.pkl")
ROOT_MODEL_BACKUP_PATH = os.path.join(PROJECT_ROOT, "diabetes_model.pkl")
METADATA_OUTPUT_PATH = os.path.join(MODEL_OUTPUT_DIR, "model_metadata.json")


def train_and_evaluate():
    print("=" * 70)
    print("  GLUCOSESENSE (DIA-PREDICT) — ML PIPELINE TRAINING & VALIDATION")
    print("=" * 70)
    print(f"[*] Dataset: {DATASET_PATH}")
    
    df = pd.read_csv(DATASET_PATH)
    print(f"[*] Dataset loaded successfully: {df.shape[0]} rows, {df.shape[1]} columns")

    # In clinical datasets, 0 values in biological parameters indicate missing measurements:
    zero_invalid_features = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    df_clean = df.copy()
    df_clean[zero_invalid_features] = df_clean[zero_invalid_features].replace(0, np.nan)

    missing_counts = df_clean[zero_invalid_features].isnull().sum().to_dict()
    print(f"[*] Medical zero values detected and marked for median imputation: {missing_counts}")

    feature_cols = [
        "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
        "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
    ]
    target_col = "Outcome"

    X = df_clean[feature_cols]
    y = df_clean[target_col]

    # Stratified 80/20 Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[*] Training samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")
    print(f"[*] Positive class ratio: Train={y_train.mean():.2%}, Test={y_test.mean():.2%}")

    # Production Pipeline
    pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("classifier", SVC(kernel="rbf", probability=True, random_state=42))
    ])

    # 5-Fold Stratified Cross Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="accuracy")
    cv_roc = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="roc_auc")

    print("\n" + "-" * 70)
    print(f"[*] 5-Fold Cross-Validation Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
    print(f"[*] 5-Fold Cross-Validation ROC-AUC:  {cv_roc.mean():.4f} (+/- {cv_roc.std()*2:.4f})")
    print("-" * 70)

    # Train final model on complete training set
    print("[*] Training pipeline on full training split...")
    pipeline.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    train_acc = float(pipeline.score(X_train, y_train))
    test_acc = float(pipeline.score(X_test, y_test))
    test_auc = float(roc_auc_score(y_test, y_prob))

    print(f"\n[+] Final Training Accuracy: {train_acc:.4f} ({train_acc*100:.2f}%)")
    print(f"[+] Final Test Accuracy:     {test_acc:.4f} ({test_acc*100:.2f}%)")
    print(f"[+] Final Test ROC-AUC:      {test_auc:.4f}")
    print("\nClassification Report on Test Data:")
    print(classification_report(y_test, y_pred, target_names=["Non-Diabetic (0)", "Diabetic (1)"]))

    # Save Model Artifact
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    joblib.dump(pipeline, ROOT_MODEL_BACKUP_PATH)
    print(f"[+] Saved model artifact to: {MODEL_OUTPUT_PATH}")
    print(f"[+] Synced root backup to:   {ROOT_MODEL_BACKUP_PATH}")

    # Generate Audit Metadata
    metadata = {
        "model_name": "Support Vector Classifier (RBF Kernel)",
        "model_pipeline": [
            {"step": "imputer", "method": "SimpleImputer", "strategy": "median"},
            {"step": "scaler", "method": "StandardScaler"},
            {"step": "classifier", "method": "SVC", "kernel": "rbf", "probability": True}
        ],
        "training_date": datetime.now().isoformat(),
        "dataset": {
            "source": "Pima Indians Diabetes Database",
            "total_records": len(df),
            "features": feature_cols,
            "target": target_col
        },
        "metrics": {
            "train_accuracy": round(train_acc, 4),
            "test_accuracy": round(test_acc, 4),
            "test_roc_auc": round(test_auc, 4),
            "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
            "cv_roc_auc_mean": round(float(cv_roc.mean()), 4)
        },
        "version": "2.1.0"
    }

    with open(METADATA_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Exported training metadata to: {METADATA_OUTPUT_PATH}")
    print("=" * 70)
    print("[SUCCESS] Machine Learning Pipeline ready for production inference!")
    print("=" * 70)


if __name__ == "__main__":
    train_and_evaluate()
