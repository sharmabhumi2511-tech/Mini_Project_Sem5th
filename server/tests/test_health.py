"""
Unit & Integration Tests for System Health Endpoints
"""

import unittest
import json
import os
import sys

# Ensure project root is in python path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from server.app import create_app

class TestHealthEndpoint(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_health_status_200(self):
        """GET /api/health returns 200 and online status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode("utf-8"))
        self.assertTrue(data.get("success", False))
        
        health_data = data.get("data", {})
        self.assertEqual(health_data.get("status"), "online")
        self.assertIn("model_name", health_data)
        self.assertIn("version", health_data)

    def test_metrics_endpoint_200(self):
        """GET /api/metrics returns 200 and benchmark stats."""
        response = self.client.get("/api/metrics")
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode("utf-8"))
        self.assertTrue(data.get("success", False))
        metrics = data.get("data", {}).get("metrics", {})
        self.assertIn("test_accuracy", metrics)

    def test_model_info_endpoint_200(self):
        """GET /api/model/info returns pipeline architecture stages."""
        response = self.client.get("/api/model/info")
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode("utf-8"))
        info = data.get("data", {})
        self.assertIn("pipeline_stages", info)
        self.assertEqual(len(info["features"]), 8)

if __name__ == "__main__":
    unittest.main()
