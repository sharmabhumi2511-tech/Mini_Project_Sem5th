"""
In-Memory Rate Limiter Middleware
Protects prediction endpoints against abuse using sliding time-window counters.
"""

import time
from collections import defaultdict
from flask import request
from server.src.config.settings import Config
from server.src.errors.custom_errors import RateLimitExceededError

# Maps client_ip -> list of epoch timestamps
_REQUEST_HISTORY = defaultdict(list)

def register_rate_limiter(app):
    @app.before_request
    def check_rate_limit():
        # Only rate limit mutation endpoints (POST/PUT)
        if request.method not in ("POST", "PUT"):
            return None

        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1")
        now = time.time()
        window_seconds = 60
        max_requests = Config.RATE_LIMIT_PER_MINUTE

        # Clean old timestamps
        history = _REQUEST_HISTORY[client_ip]
        _REQUEST_HISTORY[client_ip] = [ts for ts in history if now - ts < window_seconds]

        if len(_REQUEST_HISTORY[client_ip]) >= max_requests:
            raise RateLimitExceededError(
                f"Rate limit exceeded: maximum {max_requests} requests per minute. Please wait."
            )

        _REQUEST_HISTORY[client_ip].append(now)
        return None
