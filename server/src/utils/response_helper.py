"""
Standardized API Response Envelope Helpers
"""

from flask import jsonify

def api_response(data=None, message="Operation successful", status_code=200, success=True, meta=None):
    """
    Constructs an industrial-standard API JSON response.
    Includes both structured envelope (success, data, message, meta)
    and top-level backward-compatibility keys when data is a dictionary.
    """
    payload = {
        "success": success,
        "message": message,
        "data": data if data is not None else {}
    }
    
    if meta is not None:
        payload["meta"] = meta
        
    # Backward compatibility: flatten primary payload attributes if data is a dict
    if isinstance(data, dict):
        for k, v in data.items():
            if k not in payload:
                payload[k] = v

    return jsonify(payload), status_code


def api_error(message="An error occurred", status_code=400, error_code="ERROR", details=None):
    """
    Constructs a consistent error JSON response.
    """
    payload = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
            "details": details or {}
        },
        "message": message
    }
    return jsonify(payload), status_code
