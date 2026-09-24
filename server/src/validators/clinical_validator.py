"""
Clinical Input Validation Layer
Validates health assessment features against physiologically realistic bounds.
"""

from server.src.errors.custom_errors import ValidationError

CLINICAL_PARAM_BOUNDS = {
    "pregnancies": {"min": 0, "max": 25, "default": 0, "label": "Pregnancies count"},
    "glucose": {"min": 40, "max": 450, "default": 100, "label": "Fasting Blood Glucose (mg/dL)"},
    "bloodPressure": {"min": 40, "max": 180, "default": 75, "label": "Diastolic Blood Pressure (mm Hg)"},
    "skinThickness": {"min": 0, "max": 100, "default": 20, "label": "Triceps Skin Fold Thickness (mm)"},
    "insulin": {"min": 0, "max": 900, "default": 80, "label": "2-Hour Serum Insulin (µIU/mL)"},
    "bmi": {"min": 10.0, "max": 75.0, "default": 24.0, "label": "Body Mass Index (kg/m²)"},
    "diabetesPedigree": {"min": 0.05, "max": 3.0, "default": 0.45, "label": "Diabetes Pedigree Function"},
    "age": {"min": 18, "max": 120, "default": 30, "label": "Patient Demographic Age (years)"}
}

ALIAS_MAP = {
    "bp": "bloodPressure",
    "skin": "skinThickness",
    "pedigree": "diabetesPedigree"
}


def validate_clinical_inputs(data):
    """
    Validates and normalizes clinical assessment payload.
    Returns:
        dict: Normalized and typed clinical features dictionary
    Raises:
        ValidationError: If required values are missing or out of valid bounds.
    """
    if not isinstance(data, dict):
        raise ValidationError("Request payload must be a valid JSON object.")

    normalized = {}
    errors = {}

    for standard_key, bounds in CLINICAL_PARAM_BOUNDS.items():
        # Check standard key or alternate alias
        raw_val = data.get(standard_key)
        if raw_val is None:
            for alias, target in ALIAS_MAP.items():
                if target == standard_key and alias in data:
                    raw_val = data.get(alias)
                    break

        if raw_val is None:
            # If not provided, use baseline default
            normalized[standard_key] = bounds["default"]
            continue

        try:
            val = float(raw_val)
        except (ValueError, TypeError):
            errors[standard_key] = f"Must be a numeric value, received: '{raw_val}'"
            continue

        if val < bounds["min"] or val > bounds["max"]:
            errors[standard_key] = (
                f"{bounds['label']} must be between {bounds['min']} and {bounds['max']}, "
                f"received: {val}"
            )
            continue

        normalized[standard_key] = val

    if errors:
        raise ValidationError(
            message="Clinical input validation failed. Please check medical parameter bounds.",
            details=errors
        )

    return normalized
