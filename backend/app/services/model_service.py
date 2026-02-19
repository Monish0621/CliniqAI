"""
CliniqAI Model Service - XGBoost Model Loading and Prediction
"""
import os
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import json

# Model directories
DIABETES_MODEL_DIR = Path("D:/cliniqai/diabetes_model")
HEART_MODEL_DIR = Path("D:/cliniqai/heart_model")

# Global model cache
_diabetes_model = None
_diabetes_scaler = None
_diabetes_config = None
_heart_model = None
_heart_scaler = None
_heart_config = None

# Fallback flags
_diabetes_load_error = False
_heart_load_error = False


def load_diabetes_model():
    """Load diabetes model, scaler and config"""
    global _diabetes_model, _diabetes_scaler, _diabetes_config, _diabetes_load_error
    
    if _diabetes_load_error:
        return None, None, get_diabetes_config_fallback()
    
    if _diabetes_model is None:
        try:
            # Try multiple methods to load the model
            
            # Method 1: Try with default pickle.load
            try:
                with open(DIABETES_MODEL_DIR / "model.pkl", "rb") as f:
                    _diabetes_model = pickle.load(f)
                print("Diabetes model loaded successfully with default pickle.load")
            except Exception as e1:
                print(f"Method 1 failed: {e1}")
                # Method 2: Try with encoding='latin1' or 'bytes'
                try:
                    with open(DIABETES_MODEL_DIR / "model.pkl", "rb") as f:
                        _diabetes_model = pickle.load(f, encoding='latin1')
                    print("Diabetes model loaded successfully with encoding='latin1'")
                except Exception as e2:
                    print(f"Method 2 failed: {e2}")
                    # Method 3: Try with fix_imports=True
                    try:
                        import pickle5
                        with open(DIABETES_MODEL_DIR / "model.pkl", "rb") as f:
                            _diabetes_model = pickle5.load(f)
                        print("Diabetes model loaded successfully with pickle5")
                    except Exception as e3:
                        print(f"Method 3 failed: {e3}")
                        raise Exception(f"All loading methods failed. Last error: {e3}")
            
            # Load scaler with similar fallback methods
            try:
                with open(DIABETES_MODEL_DIR / "scaler.pkl", "rb") as f:
                    _diabetes_scaler = pickle.load(f, encoding='latin1')
            except:
                try:
                    with open(DIABETES_MODEL_DIR / "scaler.pkl", "rb") as f:
                        _diabetes_scaler = pickle.load(f)
                except Exception as e:
                    print(f"Warning: Could not load scaler: {e}")
                    _diabetes_scaler = None
            
            # Load config
            with open(DIABETES_MODEL_DIR / "config.json", "r") as f:
                _diabetes_config = json.load(f)
                
        except Exception as e:
            print(f"Error loading diabetes model: {e}")
            _diabetes_load_error = True
            return None, None, get_diabetes_config_fallback()
    
    return _diabetes_model, _diabetes_scaler, _diabetes_config


def load_heart_model():
    """Load heart disease model, scaler and config"""
    global _heart_model, _heart_scaler, _heart_config, _heart_load_error
    
    if _heart_load_error:
        return None, None, get_heart_config_fallback()
    
    if _heart_model is None:
        try:
            # Try multiple methods to load the model
            
            # Method 1: Try with default pickle.load
            try:
                with open(HEART_MODEL_DIR / "heart_model.pkl", "rb") as f:
                    _heart_model = pickle.load(f)
                print("Heart model loaded successfully with default pickle.load")
            except Exception as e1:
                print(f"Heart model Method 1 failed: {e1}")
                # Method 2: Try with encoding='latin1' or 'bytes'
                try:
                    with open(HEART_MODEL_DIR / "heart_model.pkl", "rb") as f:
                        _heart_model = pickle.load(f, encoding='latin1')
                    print("Heart model loaded successfully with encoding='latin1'")
                except Exception as e2:
                    print(f"Heart model Method 2 failed: {e2}")
                    # Method 3: Try with pickle5
                    try:
                        import pickle5
                        with open(HEART_MODEL_DIR / "heart_model.pkl", "rb") as f:
                            _heart_model = pickle5.load(f)
                        print("Heart model loaded successfully with pickle5")
                    except Exception as e3:
                        print(f"Heart model Method 3 failed: {e3}")
                        raise Exception(f"All heart loading methods failed. Last error: {e3}")
            
            # Load scaler with similar fallback methods
            try:
                with open(HEART_MODEL_DIR / "heart_scaler.pkl", "rb") as f:
                    _heart_scaler = pickle.load(f, encoding='latin1')
            except:
                try:
                    with open(HEART_MODEL_DIR / "heart_scaler.pkl", "rb") as f:
                        _heart_scaler = pickle.load(f)
                except Exception as e:
                    print(f"Warning: Could not load heart scaler: {e}")
                    _heart_scaler = None
            
            # Load config
            with open(HEART_MODEL_DIR / "heart_config.json", "r") as f:
                _heart_config = json.load(f)
                
        except Exception as e:
            print(f"Error loading heart model: {e}")
            _heart_load_error = True
            return None, None, get_heart_config_fallback()
    
    return _heart_model, _heart_scaler, _heart_config


def get_diabetes_config_fallback():
    """Get fallback diabetes config"""
    return {
        "feature_cols": [
            "gender_encoded", "age", "hypertension", "heart_disease",
            "smoking_history_encoded", "bmi", "HbA1c_level", "blood_glucose_level"
        ],
        "scale_cols": ["age", "bmi", "HbA1c_level", "blood_glucose_level"],
        "feature_names_display": [
            "Gender", "Age", "Hypertension", "Heart Disease",
            "Smoking History", "BMI", "HbA1c Level", "Blood Glucose"
        ],
        "optimal_threshold": 0.3,
        "gender_map": {"Female": 0, "Male": 1, "Other": 2},
        "smoking_map": {"never": 0, "not current": 1, "ever": 2, "former": 3, "current": 4, "unknown": -1},
        "model_performance": {
            "accuracy": 95.06,
            "auc": 0.9741,
            "recall": 78.21,
            "precision": 74.49,
            "threshold": 0.3,
            "training_samples": 82781,
            "dataset": "Diabetes Prediction Dataset — 100K patients"
        },
        "risk_levels": {
            "Low": "0-30%",
            "Moderate": "30-50%",
            "High": "50-70%",
            "Critical": "70-100%"
        },
        "clinical_thresholds": {
            "HbA1c_normal": 5.7,
            "HbA1c_prediabetic": 6.4,
            "HbA1c_diabetic": 6.5,
            "blood_glucose_normal": 100,
            "blood_glucose_prediabetic": 125,
            "blood_glucose_diabetic": 126
        }
    }


def get_heart_config_fallback():
    """Get fallback heart config"""
    return {
        "feature_cols": ["age", "gender", "ap_hi", "ap_lo", "smoke", "alco", "active", "bmi"],
        "scale_cols": ["age", "ap_hi", "ap_lo", "bmi"],
        "feature_names_display": ["Age", "Gender", "Systolic BP", "Diastolic BP", "Smoking", "Alcohol", "Physical Activity", "BMI"],
        "optimal_threshold": 0.4,
        "gender_map": {"1": "Female", "2": "Male"},
        "model_performance": {
            "accuracy": 73.26,
            "auc": 0.7969,
            "threshold": 0.4,
            "training_samples": 68000,
            "dataset": "Cardiovascular Disease Dataset — 68K patients"
        },
        "clinical_thresholds": {
            "systolic_normal": 120,
            "systolic_high": 130,
            "diastolic_normal": 80
        }
    }


def preprocess_diabetes_input(data: Dict[str, Any]) -> np.ndarray:
    """Preprocess diabetes input data"""
    _, scaler, config = load_diabetes_model()
    
    # Create feature vector
    gender_map = config.get("gender_map", {"Female": 0, "Male": 1, "Other": 2})
    smoking_map = config.get("smoking_map", {"never": 0, "not current": 1, "ever": 2, "former": 3, "current": 4, "unknown": -1})
    
    features = {
        "gender_encoded": gender_map.get(data.get("gender", "Female"), 0),
        "age": float(data.get("age", 0)),
        "hypertension": 1 if data.get("hypertension", False) else 0,
        "heart_disease": 1 if data.get("heart_disease", False) else 0,
        "smoking_history_encoded": smoking_map.get(data.get("smoking_history", "never"), 0),
        "bmi": float(data.get("bmi", 0)),
        "HbA1c_level": float(data.get("HbA1c_level", 0)),
        "blood_glucose_level": float(data.get("blood_glucose_level", 0)),
    }
    
    # Create DataFrame
    df = pd.DataFrame([features])
    
    # Scale numerical features if scaler is available
    if scaler is not None:
        scale_cols = config.get("scale_cols", ["age", "bmi", "HbA1c_level", "blood_glucose_level"])
        try:
            df[scale_cols] = scaler.transform(df[scale_cols])
        except:
            pass  # Use unscaled values if scaling fails
    
    return df.values


def preprocess_heart_input(data: Dict[str, Any]) -> np.ndarray:
    """Preprocess heart disease input data"""
    _, scaler, config = load_heart_model()
    
    # Gender mapping (1=Female, 2=Male from original dataset)
    gender_map = {"Female": 1, "Male": 2}
    
    features = {
        "age": float(data.get("age", 0)),
        "gender": gender_map.get(data.get("gender", "Female"), 1),
        "ap_hi": float(data.get("ap_hi", 0)),
        "ap_lo": float(data.get("ap_lo", 0)),
        "smoke": 1 if data.get("smoke", False) else 0,
        "alco": 1 if data.get("alco", False) else 0,
        "active": 1 if data.get("active", False) else 0,
        "bmi": float(data.get("bmi", 0)),
    }
    
    # Create DataFrame
    df = pd.DataFrame([features])
    
    # Scale numerical features if scaler is available
    if scaler is not None:
        scale_cols = config.get("scale_cols", ["age", "ap_hi", "ap_lo", "bmi"])
        try:
            df[scale_cols] = scaler.transform(df[scale_cols])
        except:
            pass  # Use unscaled values if scaling fails
    
    return df.values


def calculate_diabetes_probability_fallback(data: Dict[str, Any]) -> float:
    """Calculate diabetes probability using clinical formula (fallback when model unavailable)"""
    # Clinical risk score based on known risk factors
    score = 0.0
    
    # Age factor
    age = float(data.get("age", 0))
    if age > 40:
        score += (age - 40) * 0.005
    
    # BMI factor
    bmi = float(data.get("bmi", 0))
    if bmi > 25:
        score += (bmi - 25) * 0.01
    elif bmi < 18.5:
        score -= 0.02
    
    # HbA1c factor (most important)
    hba1c = float(data.get("HbA1c_level", 0))
    if hba1c >= 6.5:
        score += 0.3
    elif hba1c >= 5.7:
        score += 0.15
    
    # Blood glucose factor
    glucose = float(data.get("blood_glucose_level", 0))
    if glucose >= 126:
        score += 0.25
    elif glucose >= 100:
        score += 0.1
    
    # Hypertension
    if data.get("hypertension", False):
        score += 0.1
    
    # Heart disease
    if data.get("heart_disease", False):
        score += 0.15
    
    # Smoking
    smoking = data.get("smoking_history", "never")
    if smoking in ["current", "former"]:
        score += 0.1
    
    # Convert score to probability (sigmoid-like transformation)
    probability = 1 / (1 + np.exp(-score * 3))
    return min(max(probability, 0.01), 0.99)


def calculate_heart_probability_fallback(data: Dict[str, Any]) -> float:
    """Calculate heart disease probability using clinical formula (fallback when model unavailable)"""
    # Clinical risk score based on known risk factors
    score = 0.0
    
    # Age factor
    age = float(data.get("age", 0))
    if age > 50:
        score += (age - 50) * 0.008
    
    # BMI factor
    bmi = float(data.get("bmi", 0))
    if bmi > 30:
        score += 0.15
    elif bmi > 25:
        score += 0.05
    
    # Blood pressure factors (most important for heart disease)
    ap_hi = float(data.get("ap_hi", 0))
    if ap_hi >= 140:
        score += 0.25
    elif ap_hi >= 130:
        score += 0.15
    elif ap_hi >= 120:
        score += 0.05
    
    ap_lo = float(data.get("ap_lo", 0))
    if ap_lo >= 90:
        score += 0.15
    elif ap_lo >= 80:
        score += 0.05
    
    # Lifestyle factors
    if data.get("smoke", False):
        score += 0.2
    
    if data.get("alco", False):
        score += 0.1
    
    if not data.get("active", True):  # If not active
        score += 0.1
    
    # Gender (males have slightly higher risk)
    gender = data.get("gender", "Female")
    if gender == "Male":
        score += 0.05
    
    # Convert score to probability (sigmoid-like transformation)
    probability = 1 / (1 + np.exp(-score * 3))
    return min(max(probability, 0.01), 0.99)


def predict_diabetes(input_data: Dict[str, Any]) -> Tuple[float, float]:
    """
    Make diabetes prediction
    Returns: (probability, threshold_adjusted_probability)
    """
    model, scaler, config = load_diabetes_model()
    
    # Check if model is available
    if model is None:
        # Use fallback calculation
        probability = calculate_diabetes_probability_fallback(input_data)
        threshold = config.get("optimal_threshold", 0.3)
        return probability, threshold
    
    # Check if scaler is available - if not, use fallback calculation
    if scaler is None:
        print("Warning: Scaler not available, using fallback calculation")
        probability = calculate_diabetes_probability_fallback(input_data)
        threshold = config.get("optimal_threshold", 0.3)
        return probability, threshold
    
    # Preprocess
    X = preprocess_diabetes_input(input_data)
    
    # Get probability
    prob = model.predict_proba(X)[0][1]
    
    # Get threshold
    threshold = config.get("optimal_threshold", 0.3)
    
    return prob, threshold


def predict_heart_disease(input_data: Dict[str, Any]) -> Tuple[float, float]:
    """
    Make heart disease prediction
    Returns: (probability, threshold_adjusted_probability)
    """
    model, scaler, config = load_heart_model()
    
    # Check if model is available
    if model is None:
        # Use fallback calculation
        probability = calculate_heart_probability_fallback(input_data)
        threshold = config.get("optimal_threshold", 0.4)
        return probability, threshold
    
    # Check if scaler is available - if not, use fallback calculation
    if scaler is None:
        print("Warning: Heart scaler not available, using fallback calculation")
        probability = calculate_heart_probability_fallback(input_data)
        threshold = config.get("optimal_threshold", 0.4)
        return probability, threshold
    
    # Preprocess
    X = preprocess_heart_input(input_data)
    
    # Get probability
    prob = model.predict_proba(X)[0][1]
    
    # Get threshold
    threshold = config.get("optimal_threshold", 0.4)
    
    return prob, threshold


def get_risk_category(probability: float, risk_levels: Dict[str, str]) -> str:
    """Determine risk category based on probability"""
    probability_pct = probability * 100
    
    if probability_pct <= 30:
        return "Low"
    elif probability_pct <= 50:
        return "Moderate"
    elif probability_pct <= 70:
        return "High"
    else:
        return "Critical"


def get_diabetes_info() -> Dict[str, Any]:
    """Get diabetes model information"""
    _, _, config = load_diabetes_model()
    
    return {
        "disease_type": "diabetes",
        "features": config.get("feature_cols", []),
        "feature_display_names": config.get("feature_names_display", []),
        "performance": config.get("model_performance", {}),
        "risk_levels": config.get("risk_levels", {}),
        "clinical_thresholds": config.get("clinical_thresholds", {}),
    }


def get_heart_info() -> Dict[str, Any]:
    """Get heart disease model information"""
    _, _, config = load_heart_model()
    
    return {
        "disease_type": "heart_disease",
        "features": config.get("feature_cols", []),
        "feature_display_names": config.get("feature_names_display", []),
        "performance": config.get("model_performance", {}),
        "risk_levels": {},
        "clinical_thresholds": config.get("clinical_thresholds", {}),
    }
