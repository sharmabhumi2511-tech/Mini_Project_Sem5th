"""
Request Logging Middleware
Tracks HTTP method, URL, client IP, status code, and latency in milliseconds.
"""

import time
from flask import request, g
from server.src.utils.logger import get_logger

logger = get_logger("http_logger")

def register_request_logger(app):
    @app.before_request
    def start_timer():
        g.start_time = time.time()

    @app.after_request
    def log_response(response):
        latency_ms = 0
        if hasattr(g, "start_time"):
            latency_ms = round((time.time() - g.start_time) * 1000, 2)

        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1")
        logger.info(
            f"{request.method} {request.path} {response.status_code} ({latency_ms}ms) - {client_ip}"
        )
        return response
