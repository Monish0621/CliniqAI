"""
CliniqAI Backend Configuration
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path("D:/cliniqai")

# Database
DATABASE_URL = "sqlite:///./cliniqai.db"

# Models directory
DIABETES_MODEL_DIR = BASE_DIR / "diabetes_model"
HEART_MODEL_DIR = BASE_DIR / "heart_model"

# JWT Settings
SECRET_KEY = "cliniqai-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# API Settings
API_PREFIX = "/api/v1"

# CORS
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Bootstrap settings for confidence intervals
BOOTSTRAP_ITERATIONS = 100
CONFIDENCE_LEVEL = 0.95
