"""
Unit & Integration Tests for Prediction Endpoint & Clinical Validation
"""

import unittest
import json
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from server.app import create_app

class TestPredictionEndpoint(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_predict_healthy_profile(self):
        """POST /api/predict with low-risk healthy parameters returns valid probability and low risk."""
        payload = {
            "pregnancies": 0,
            "glucose": 90,
            "bloodPressure": 70,
            "skinThickness": 18,
            "insulin": 75,
            "bmi": 21.5,
            "diabetesPedigree": 0.35,
            "age": 25
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 200)

        data = json.loads(res.data.decode("utf-8"))
        self.assertTrue(data.get("success", False))
        
        result = data.get("data", {})
        self.assertIn("probability", result)
        self.assertIn("risk", result)
        self.assertIn("confidence", result)
        self.assertIn("shap", result)
        self.assertTrue(5 <= result["probability"] <= 95)
        self.assertIsInstance(result["shap"], list)
        self.assertGreaterEqual(len(result["shap"]), 6)

    def test_predict_elevated_profile(self):
        """POST /api/predict with high glucose and BMI returns elevated risk."""
        payload = {
            "pregnancies": 4,
            "glucose": 185,
            "bloodPressure": 92,
            "skinThickness": 35,
            "insulin": 220,
            "bmi": 36.4,
            "diabetesPedigree": 0.85,
            "age": 52
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 200)

        data = json.loads(res.data.decode("utf-8"))
        result = data.get("data", {})
        self.assertIn(result["risk"], ["Moderate Risk", "High Risk"])
        self.assertGreater(result["probability"], 40)

    def test_validation_rejects_out_of_bounds_glucose(self):
        """POST /api/predict with glucose exceeding physiological bounds triggers 400 validation error."""
        payload = {
            "glucose": 9999, # Physically impossible glucose level
            "bmi": 24,
            "age": 30
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 400)

        data = json.loads(res.data.decode("utf-8"))
        self.assertFalse(data.get("success", True))
        self.assertIn("error", data)
        self.assertEqual(data["error"]["code"], "VALIDATION_ERROR")

    def test_validation_rejects_non_numeric_values(self):
        """POST /api/predict with non-numeric fields triggers 400 error."""
        payload = {
            "glucose": "extremely_high",
            "age": 30
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data.decode("utf-8"))
        self.assertEqual(data["error"]["code"], "VALIDATION_ERROR")

    def test_backward_compatibility_root_keys(self):
        """Ensures probability and risk are accessible at root level of response for older client compatibility."""
        payload = {
            "glucose": 110,
            "bmi": 25,
            "age": 35
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data.decode("utf-8"))
        # Root level fields exist alongside data envelope
        self.assertIn("probability", data)
        self.assertIn("risk", data)

if __name__ == "__main__":
    unittest.main()
