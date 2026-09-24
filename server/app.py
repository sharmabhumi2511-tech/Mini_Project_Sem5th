#!/usr/bin/env python3
"""
GlucoseSense / DIA-PREDICT — Application Entry Point & Server Factory
====================================================================
Production Flask application configuring middleware, routes, CORS,
error handling, and model lifecycle.
"""

import os
import sys

# Ensure server package path is resolvable
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from flask import Flask
from flask_cors import CORS

from server.src.config.settings import Config
from server.src.routes.api_routes import api_bp
from server.src.middleware.error_handler import register_error_handlers
from server.src.middleware.request_logger import register_request_logger
from server.src.middleware.rate_limiter import register_rate_limiter
from server.src.middleware.security import register_security_headers
from server.src.utils.logger import get_logger

logger = get_logger("server_app")


def create_app():
    """Application factory for GlucoseSense ML Service."""
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False

    # 1. Cross-Origin Resource Sharing (CORS)
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
    )

    # 2. Middleware
    register_security_headers(app)
    register_request_logger(app)
    register_rate_limiter(app)
    register_error_handlers(app)

    # 3. Mount Routes
    app.register_blueprint(api_bp)

    # Root route aliases for reverse proxies and direct calls
    from server.src.controllers.health_controller import get_health
    from server.src.controllers.prediction_controller import post_predict
    from server.src.controllers.metrics_controller import get_metrics
    app.add_url_rule("/health", view_func=get_health, methods=["GET"])
    app.add_url_rule("/predict", view_func=post_predict, methods=["POST"])
    app.add_url_rule("/metrics", view_func=get_metrics, methods=["GET"])

    return app


if __name__ == "__main__":
    app = create_app()
    port = Config.PORT
    host = Config.HOST

    print("=" * 68)
    print(f"  {Config.SERVICE_NAME}")
    print(f"  Version: {Config.SERVICE_VERSION} | Environment: {Config.ENVIRONMENT}")
    print(f"  Listening on: http://127.0.0.1:{port}")
    print(f"  Health Check: http://127.0.0.1:{port}/api/health")
    print(f"  Inference:    POST http://127.0.0.1:{port}/api/predict")
    print("=" * 68)

    app.run(host=host, port=port, debug=False, use_reloader=False)
