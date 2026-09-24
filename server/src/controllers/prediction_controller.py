"""
Prediction & Explainability Controller
Handles clinical parameter validation, inference orchestration, and SHAP attribution.
"""

from flask import request
from server.src.validators.clinical_validator import validate_clinical_inputs
from server.src.services.ml_service import ml_service
from server.src.services.shap_service import shap_service
from server.src.utils.response_helper import api_response
from server.src.utils.logger import get_logger

logger = get_logger("prediction_controller")

def post_predict():
    """
    POST /api/predict
    Evaluates 8 clinical biomarkers and returns probability, risk category,
    confidence score, and local SHAP feature contributions.
    """
    raw_payload = request.get_json(silent=True) or {}
    
    # 1. Validate and normalize medical parameters
    features = validate_clinical_inputs(raw_payload)

    # 2. Run Machine Learning Model Inference
    pred = ml_service.predict(features)

    # 3. Calculate Explainable AI (SHAP) feature attributions
    shap_factors = shap_service.explain(features, pred["probability"])

    result_data = {
        "risk": pred["risk"],
        "probability": pred["probability"],
        "confidence": pred["confidence"],
        "shap": shap_factors,
        "model_name": pred["model_name"],
        "is_demo": pred["is_demo"],
        "features": features
    }

    logger.info(
        f"Prediction complete: Risk={pred['risk']} ({pred['probability']}%), "
        f"Confidence={pred['confidence']}%, Engine={pred['model_name']}"
    )

    return api_response(
        data=result_data,
        message=f"Risk evaluation complete: {pred['risk']} ({pred['probability']}% probability)."
    )
