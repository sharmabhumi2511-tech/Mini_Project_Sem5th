"""
Custom Application Errors and Exceptions
"""

class AppError(Exception):
    """Base application exception."""
    def __init__(self, message, status_code=500, error_code="INTERNAL_ERROR", details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}


class ValidationError(AppError):
    """Raised when client input validation fails."""
    def __init__(self, message, details=None):
        super().__init__(message, status_code=400, error_code="VALIDATION_ERROR", details=details)


class NotFoundError(AppError):
    """Raised when a requested resource is not found."""
    def __init__(self, message, details=None):
        super().__init__(message, status_code=404, error_code="NOT_FOUND", details=details)


class ModelInferenceError(AppError):
    """Raised when model loading or prediction calculation encounters a failure."""
    def __init__(self, message, details=None):
        super().__init__(message, status_code=500, error_code="INFERENCE_ERROR", details=details)


class RateLimitExceededError(AppError):
    """Raised when too many requests are submitted in a short interval."""
    def __init__(self, message="Too many requests. Please wait a moment before trying again."):
        super().__init__(message, status_code=429, error_code="RATE_LIMIT_EXCEEDED")
