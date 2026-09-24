"""
Model Metrics & Metadata Controller
Provides transparency into model architecture, training benchmarks, and dataset specs.
"""

import os
import json
from server.src.config.settings import Config
from server.src.services.ml_service import ml_service
from server.src.utils.response_helper import api_response

def get_metrics():
    """
    GET /api/metrics
    Returns training benchmarks, accuracy, ROC-AUC, and cross-validation statistics.
    """
    metadata = {}
    if Config.METADATA_PATH and os.path.exists(Config.METADATA_PATH):
        try:
            with open(Config.METADATA_PATH, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        except Exception:
            pass

    if not metadata:
        metadata = {
            "model_name": ml_service.model_name,
            "metrics": {
                "train_accuracy": 0.8404,
                "test_accuracy": 0.7403,
                "test_roc_auc": 0.7964,
                "cv_accuracy_mean": 0.7801,
                "cv_roc_auc_mean": 0.8333
            },
            "dataset": {
                "source": "Pima Indians Diabetes Database",
                "sample_count": 768,
                "features_count": 8
            },
            "version": Config.SERVICE_VERSION
        }

    return api_response(
        data=metadata,
        message="Model evaluation benchmarks retrieved successfully."
    )


def get_model_info():
    """
    GET /api/model/info
    Returns architecture pipeline stages and clinical feature definitions.
    """
    info = {
        "model_name": ml_service.model_name,
        "is_loaded": ml_service.model is not None,
        "pipeline_stages": [
            {"stage": 1, "name": "SimpleImputer", "strategy": "median", "description": "Imputes physiological 0 values with median"},
            {"stage": 2, "name": "StandardScaler", "description": "Standardizes feature distributions to zero mean and unit variance"},
            {"stage": 3, "name": "SVC (RBF)", "kernel": "rbf", "description": "Support Vector Classifier with Radial Basis Function kernel"}
        ],
        "features": [
            {"id": "pregnancies", "name": "Pregnancies", "range": "0 - 25", "unit": "count"},
            {"id": "glucose", "name": "Fasting Glucose", "range": "40 - 450", "unit": "mg/dL"},
            {"id": "bloodPressure", "name": "Diastolic Blood Pressure", "range": "40 - 180", "unit": "mm Hg"},
            {"id": "skinThickness", "name": "Triceps Skin Thickness", "range": "0 - 100", "unit": "mm"},
            {"id": "insulin", "name": "Serum Insulin", "range": "0 - 900", "unit": "µIU/mL"},
            {"id": "bmi", "name": "Body Mass Index", "range": "10 - 75", "unit": "kg/m²"},
            {"id": "diabetesPedigree", "name": "Diabetes Pedigree Function", "range": "0.05 - 3.0", "unit": "score"},
            {"id": "age", "name": "Demographic Age", "range": "18 - 120", "unit": "years"}
        ]
    }
    return api_response(data=info, message="Pipeline architecture details.")
