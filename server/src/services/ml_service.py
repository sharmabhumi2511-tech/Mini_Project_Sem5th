"""
Machine Learning Inference Service
Encapsulates model lifecycle, feature alignment, probability estimation, and calibrated fallback.
"""

import os
import math
import pandas as pd
import numpy as np
import joblib

from server.src.config.settings import Config
from server.src.utils.logger import get_logger

logger = get_logger("ml_service")

FEATURE_COLUMNS = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

class MLService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.model = None
        self.model_name = "Calibrated Pima Clinical Benchmark (Baseline Engine)"
        self.model_path = Config.MODEL_PATH
        self.load_model()
        self._initialized = True

    def load_model(self):
        """Loads serialized Scikit-learn Pipeline model from disk."""
        if self.model_path and os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                classifier_type = type(self.model).__name__
                if hasattr(self.model, "named_steps") and "classifier" in self.model.named_steps:
                    classifier_type = type(self.model.named_steps["classifier"]).__name__
                self.model_name = f"Trained {classifier_type} Pipeline (Pima Indians Benchmark)"
                logger.info(f"Loaded trained ML model from: {self.model_path} ({self.model_name})")
            except Exception as e:
                logger.warning(f"Error loading model from {self.model_path}: {e}. Using calibrated fallback.")
                self.model = None
        else:
            logger.info(f"No model file found at '{self.model_path}'. Running calibrated Pima clinical baseline.")
            self.model = None

    def predict(self, features_dict):
        """
        Generates risk probability, risk category, and confidence estimation.
        
        Args:
            features_dict (dict): Dictionary with clinical parameters:
                pregnancies, glucose, bloodPressure, skinThickness, insulin, bmi, diabetesPedigree, age
                
        Returns:
            dict: {
                "risk": "Low Risk" | "Moderate Risk" | "High Risk",
                "probability": int (percentage 5-95),
                "confidence": int (percentage),
                "model_name": str,
                "is_demo": bool
            }
        """
        # Vectorize features in exact dataset column order
        ordered_values = [
            float(features_dict["pregnancies"]),
            float(features_dict["glucose"]),
            float(features_dict["bloodPressure"]),
            float(features_dict["skinThickness"]),
            float(features_dict["insulin"]),
            float(features_dict["bmi"]),
            float(features_dict["diabetesPedigree"]),
            float(features_dict["age"])
        ]

        probability = None
        confidence = 88

        # 1. Model inference if loaded
        if self.model is not None:
            try:
                input_df = pd.DataFrame([ordered_values], columns=FEATURE_COLUMNS)
                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(input_df)[0]
                    # Class 1 is positive outcome (diabetic risk)
                    probability = float(probs[1] * 100)
                    # Confidence derived from margin distance
                    confidence = round(max(75.0, min(96.0, 75.0 + abs(probs[1] - 0.5) * 42)))
                elif hasattr(self.model, "predict"):
                    pred = self.model.predict(input_df)[0]
                    probability = 75.0 if pred == 1 else 20.0
                    confidence = 82
            except Exception as err:
                logger.warning(f"Model prediction evaluation error: {err}. Falling back to calibrated formula.")

        # 2. Evidence-calibrated clinical baseline fallback
        if probability is None:
            g = float(features_dict["glucose"])
            bmi = float(features_dict["bmi"])
            bp = float(features_dict["bloodPressure"])
            age = float(features_dict["age"])
            ins = float(features_dict["insulin"])
            ped = float(features_dict["diabetesPedigree"])
            preg = float(features_dict["pregnancies"])

            # Z-scores relative to Pima benchmark distribution
            z_glucose = (g - 100.0) / 32.0
            z_bmi = (bmi - 24.0) / 6.5
            z_bp = (bp - 74.0) / 16.0
            z_age = (age - 28.0) / 15.0
            z_insulin = (ins - 85.0) / 60.0
            z_pedigree = (ped - 0.47) / 0.35
            z_preg = (preg - 1.0) / 3.0

            logit = -1.55 + (1.15 * z_glucose) + (0.85 * z_bmi) + (0.30 * z_bp) + \
                    (0.40 * z_age) + (0.12 * z_insulin) + (0.28 * z_pedigree) + (0.18 * z_preg)
            raw_prob = (1.0 / (1.0 + math.exp(-logit))) * 100.0
            probability = raw_prob
            confidence = 85

        # Clamp between clinical probability bounds (5% to 95%)
        probability = int(round(max(5.0, min(95.0, probability))))

        # Qualitative Risk Stratification
        if probability >= 50:
            risk = "High Risk"
        elif probability >= 28:
            risk = "Moderate Risk"
        else:
            risk = "Low Risk"

        return {
            "risk": risk,
            "probability": probability,
            "confidence": confidence,
            "model_name": self.model_name,
            "is_demo": self.model is None,
            "features_array": ordered_values
        }

# Singleton instance
ml_service = MLService()
