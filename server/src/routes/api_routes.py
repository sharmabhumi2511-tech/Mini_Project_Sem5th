"""
API Routes Definition
Mounts controllers onto Flask Blueprint.
"""

from flask import Blueprint
from server.src.controllers.health_controller import get_health
from server.src.controllers.prediction_controller import post_predict
from server.src.controllers.metrics_controller import get_metrics, get_model_info

api_bp = Blueprint("api", __name__, url_prefix="/api")

# System & Diagnostic Endpoints
api_bp.route("/health", methods=["GET"])(get_health)
api_bp.route("/metrics", methods=["GET"])(get_metrics)
api_bp.route("/model/info", methods=["GET"])(get_model_info)

# Inference Endpoint
api_bp.route("/predict", methods=["POST"])(post_predict)
