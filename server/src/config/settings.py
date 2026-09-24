"""
GlucoseSense / DIA-PREDICT — Application Configuration
Centralized environment variables and system settings.
"""

import os
from pathlib import Path

# Resolve base directories
SERVER_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = SERVER_DIR.parent

# Load .env file if available
def load_env_file():
    env_paths = [
        PROJECT_ROOT / ".env",
        SERVER_DIR / ".env"
    ]
    for env_path in env_paths:
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip("'\"")
                            if key not in os.environ:
                                os.environ[key] = val
            except Exception:
                pass
            break

load_env_file()


class Config:
    ENVIRONMENT = os.getenv("NODE_ENV", os.getenv("FLASK_ENV", "development"))
    DEBUG = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    
    # Server network bindings
    PORT = int(os.getenv("BACKEND_PORT", os.getenv("ML_PORT", os.getenv("SERVER_PORT", os.getenv("PORT", 5000)))))
    HOST = os.getenv("HOST", "0.0.0.0")
    
    # CORS
    CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Machine Learning Model Paths
    MODEL_PATH = os.getenv("MODEL_PATH")
    if not MODEL_PATH:
        candidates = [
            PROJECT_ROOT / "ml" / "models" / "diabetes_model.pkl",
            PROJECT_ROOT / "diabetes_model.pkl",
            SERVER_DIR / "diabetes_model.pkl"
        ]
        for p in candidates:
            if p.exists():
                MODEL_PATH = str(p)
                break
        if not MODEL_PATH:
            MODEL_PATH = str(PROJECT_ROOT / "ml" / "models" / "diabetes_model.pkl")

    METADATA_PATH = os.getenv("METADATA_PATH")
    if not METADATA_PATH:
        cand = PROJECT_ROOT / "ml" / "models" / "model_metadata.json"
        METADATA_PATH = str(cand) if cand.exists() else None

    # Dataset Path
    DATASET_PATH = os.getenv("DATASET_PATH")
    if not DATASET_PATH:
        cand = PROJECT_ROOT / "ml" / "data" / "diabetes.csv"
        if not cand.exists():
            cand = PROJECT_ROOT / "diabetes.csv"
        DATASET_PATH = str(cand) if cand.exists() else None

    # Security & Rate Limiting
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", 120))
    API_PREFIX = "/api"
    SERVICE_NAME = "GlucoseSense DIA-PREDICT ML Decision Support Service"
    SERVICE_VERSION = "2.1.0"
