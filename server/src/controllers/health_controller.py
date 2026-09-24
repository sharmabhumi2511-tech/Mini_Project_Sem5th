"""
Health & System Status Controller
"""

import os
import sys
import time
from server.src.config.settings import Config
from server.src.services.ml_service import ml_service
from server.src.utils.response_helper import api_response

SERVER_START_TIME = time.time()

def get_health():
    """
    GET /api/health
    Returns operational health status, model readiness, and runtime metadata.
    """
    model_file_exists = bool(Config.MODEL_PATH and os.path.exists(Config.MODEL_PATH))
    uptime_seconds = int(time.time() - SERVER_START_TIME)

    health_data = {
        "status": "online",
        "service": Config.SERVICE_NAME,
        "version": Config.SERVICE_VERSION,
        "environment": Config.ENVIRONMENT,
        "uptime_seconds": uptime_seconds,
        "model_name": ml_service.model_name,
        "model_file_present": model_file_exists,
        "model_loaded": ml_service.model is not None,
        "python_version": sys.version.split()[0]
    }

    return api_response(
        data=health_data,
        message=f"{Config.SERVICE_NAME} is operating normally."
    )
