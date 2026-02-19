"""
CliniqAI Predictions Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..database import get_db
from ..models import User, Prediction, PatientRecord
from ..schemas import (
    DiabetesPredictionInput,
    HeartPredictionInput,
    PredictionResponse,
    WhatIfPredictionRequest,
    ModelInfoResponse
)
from ..auth import get_current_user
from ..services import model_service, shap_service

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/diabetes", response_model=PredictionResponse)
def predict_diabetes(
    input_data: DiabetesPredictionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Make diabetes prediction"""
    # Convert input to dict
    data = input_data.model_dump()
    
    # Get prediction
    probability, threshold = model_service.predict_diabetes(data)
    
    # Get risk category
    risk_category = model_service.get_risk_category(probability, {
        "Low": "0-30%",
        "Moderate": "30-50%",
        "High": "50-70%",
        "Critical": "70-100%"
    })
    
    # Get confidence interval
    ci_low, ci_high = shap_service.calculate_confidence_interval(probability)
    
    # Get SHAP values
    shap_values = shap_service.generate_shap_values_diabetes(data)
    
    # Get clinical explanation
    clinical_explanation = shap_service.generate_clinical_explanation(
        "diabetes", probability, shap_values, data
    )
    
    # Create prediction record
    prediction = Prediction(
        user_id=current_user.id,
        disease_type="diabetes",
        risk_probability=probability,
        risk_category=risk_category,
        confidence_interval_low=ci_low,
        confidence_interval_high=ci_high,
        shap_values=shap_values,
        input_data=data
    )
    
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    return PredictionResponse(
        id=prediction.id,
        risk_probability=probability,
        risk_category=risk_category,
        confidence_interval_low=ci_low,
        confidence_interval_high=ci_high,
        shap_values=shap_values,
        clinical_explanation=clinical_explanation,
        disease_type="diabetes",
        created_at=prediction.created_at
    )


@router.post("/heart_disease", response_model=PredictionResponse)
def predict_heart_disease(
    input_data: HeartPredictionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Make heart disease prediction"""
    # Convert input to dict
    data = input_data.model_dump()
    
    # Get prediction
    probability, threshold = model_service.predict_heart_disease(data)
    
    # Get risk category
    risk_category = model_service.get_risk_category(probability, {
        "Low": "0-30%",
        "Moderate": "30-50%",
        "High": "50-70%",
        "Critical": "70-100%"
    })
    
    # Get confidence interval
    ci_low, ci_high = shap_service.calculate_confidence_interval(probability)
    
    # Get SHAP values
    shap_values = shap_service.generate_shap_values_heart(data)
    
    # Get clinical explanation
    clinical_explanation = shap_service.generate_clinical_explanation(
        "heart_disease", probability, shap_values, data
    )
    
    # Create prediction record
    prediction = Prediction(
        user_id=current_user.id,
        disease_type="heart_disease",
        risk_probability=probability,
        risk_category=risk_category,
        confidence_interval_low=ci_low,
        confidence_interval_high=ci_high,
        shap_values=shap_values,
        input_data=data
    )
    
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    return PredictionResponse(
        id=prediction.id,
        risk_probability=probability,
        risk_category=risk_category,
        confidence_interval_low=ci_low,
        confidence_interval_high=ci_high,
        shap_values=shap_values,
        clinical_explanation=clinical_explanation,
        disease_type="heart_disease",
        created_at=prediction.created_at
    )


@router.post("/what-if", response_model=PredictionResponse)
def what_if_prediction(
    request: WhatIfPredictionRequest,
    current_user: User = Depends(get_current_user)
):
    """What-if prediction without saving to database"""
    data = request.input_data
    
    if request.disease_type == "diabetes":
        probability, _ = model_service.predict_diabetes(data)
        shap_values = shap_service.generate_shap_values_diabetes(data)
    else:
        probability, _ = model_service.predict_heart_disease(data)
        shap_values = shap_service.generate_shap_values_heart(data)
    
    # Get risk category
    risk_category = model_service.get_risk_category(probability, {
        "Low": "0-30%",
        "Moderate": "30-50%",
        "High": "50-70%",
        "Critical": "70-100%"
    })
    
    # Get confidence interval
    ci_low, ci_high = shap_service.calculate_confidence_interval(probability)
    
    # Get clinical explanation
    clinical_explanation = shap_service.generate_clinical_explanation(
        request.disease_type, probability, shap_values, data
    )
    
    return PredictionResponse(
        risk_probability=probability,
        risk_category=risk_category,
        confidence_interval_low=ci_low,
        confidence_interval_high=ci_high,
        shap_values=shap_values,
        clinical_explanation=clinical_explanation,
        disease_type=request.disease_type
    )


@router.get("/info/{disease_type}", response_model=ModelInfoResponse)
def get_model_info(disease_type: str):
    """Get model information"""
    if disease_type == "diabetes":
        info = model_service.get_diabetes_info()
    elif disease_type == "heart_disease":
        info = model_service.get_heart_info()
    else:
        raise HTTPException(status_code=404, detail="Disease type not found")
    
    return info
