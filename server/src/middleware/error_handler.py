"""
Centralized Error Handling Middleware
Captures all exceptions and formats them into consistent API error envelopes.
"""

from werkzeug.exceptions import HTTPException
from server.src.errors.custom_errors import AppError, ValidationError
from server.src.utils.response_helper import api_error
from server.src.utils.logger import get_logger

logger = get_logger("error_handler")

def register_error_handlers(app):
    """Registers global exception handlers on the Flask app."""

    @app.errorhandler(ValidationError)
    def handle_validation_error(err):
        logger.warning(f"Validation error: {err.message} | Details: {err.details}")
        return api_error(
            message=err.message,
            status_code=err.status_code,
            error_code=err.error_code,
            details=err.details
        )

    @app.errorhandler(AppError)
    def handle_app_error(err):
        logger.warning(f"App error: {err.message} ({err.error_code})")
        return api_error(
            message=err.message,
            status_code=err.status_code,
            error_code=err.error_code,
            details=err.details
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        return api_error(
            message=err.description or "HTTP error encountered.",
            status_code=err.code or 500,
            error_code="HTTP_ERROR"
        )

    @app.errorhandler(Exception)
    def handle_generic_exception(err):
        logger.error(f"Unhandled server exception: {err}", exc_info=True)
        return api_error(
            message="An unexpected server error occurred. Please try again.",
            status_code=500,
            error_code="INTERNAL_SERVER_ERROR"
        )
