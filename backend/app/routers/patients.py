"""
CliniqAI Patients Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, PatientRecord, Prediction
from ..schemas import (
    PatientRecordCreate,
    PatientRecordResponse,
    PatientRecordList,
    PatientComparisonRequest,
    PatientComparisonResponse,
    PredictionResponse
)
from ..auth import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/", response_model=List[PatientRecordList])
def get_patients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all patient records for current user"""
    patients = db.query(PatientRecord).filter(
        PatientRecord.user_id == current_user.id
    ).order_by(PatientRecord.created_at.desc()).all()
    
    return patients


@router.post("/", response_model=PatientRecordResponse)
def create_patient_record(
    record_data: PatientRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new patient record"""
    record = PatientRecord(
        user_id=current_user.id,
        patient_name=record_data.patient_name,
        disease_type=record_data.disease_type,
        input_data=record_data.input_data
    )
    
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return record


@router.get("/{record_id}", response_model=PatientRecordResponse)
def get_patient_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific patient record"""
    record = db.query(PatientRecord).filter(
        PatientRecord.id == record_id,
        PatientRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Patient record not found")
    
    return record


@router.post("/compare", response_model=PatientComparisonResponse)
def compare_patients(
    request: PatientComparisonRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare two patient records"""
    # Get both records
    record1 = db.query(PatientRecord).filter(
        PatientRecord.id == request.record_id_1,
        PatientRecord.user_id == current_user.id
    ).first()
    
    record2 = db.query(PatientRecord).filter(
        PatientRecord.id == request.record_id_2,
        PatientRecord.user_id == current_user.id
    ).first()
    
    if not record1 or not record2:
        raise HTTPException(status_code=404, detail="Patient record not found")
    
    # Get latest predictions for each record
    pred1 = db.query(Prediction).filter(
        Prediction.patient_record_id == record1.id
    ).order_by(Prediction.created_at.desc()).first()
    
    pred2 = db.query(Prediction).filter(
        Prediction.patient_record_id == record2.id
    ).order_by(Prediction.created_at.desc()).first()
    
    if not pred1 or not pred2:
        raise HTTPException(
            status_code=404, 
            detail="No predictions found for comparison"
        )
    
    # Calculate differences
    risk_diff = abs(pred1.risk_probability - pred2.risk_probability)
    
    differences = {
        "risk_difference": round(risk_diff, 3),
        "higher_risk": record1.patient_name if pred1.risk_probability > pred2.risk_probability else record2.patient_name,
        "category_different": pred1.risk_category != pred2.risk_category
    }
    
    return PatientComparisonResponse(
        record_1=record1,
        record_2=record2,
        prediction_1=PredictionResponse(
            risk_probability=pred1.risk_probability,
            risk_category=pred1.risk_category,
            confidence_interval_low=pred1.confidence_interval_low,
            confidence_interval_high=pred1.confidence_interval_high,
            shap_values=pred1.shap_values,
            clinical_explanation="",
            disease_type=pred1.disease_type,
            created_at=pred1.created_at
        ),
        prediction_2=PredictionResponse(
            risk_probability=pred2.risk_probability,
            risk_category=pred2.risk_category,
            confidence_interval_low=pred2.confidence_interval_low,
            confidence_interval_high=pred2.confidence_interval_high,
            shap_values=pred2.shap_values,
            clinical_explanation="",
            disease_type=pred2.disease_type,
            created_at=pred2.created_at
        ),
        differences=differences
    )


@router.get("/{record_id}/predictions", response_model=List[PredictionResponse])
def get_patient_predictions(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all predictions for a patient record"""
    # Verify record belongs to user
    record = db.query(PatientRecord).filter(
        PatientRecord.id == record_id,
        PatientRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Patient record not found")
    
    predictions = db.query(Prediction).filter(
        Prediction.patient_record_id == record_id
    ).order_by(Prediction.created_at.desc()).all()
    
    return [
        PredictionResponse(
            id=p.id,
            risk_probability=p.risk_probability,
            risk_category=p.risk_category,
            confidence_interval_low=p.confidence_interval_low,
            confidence_interval_high=p.confidence_interval_high,
            shap_values=p.shap_values,
            clinical_explanation="",
            disease_type=p.disease_type,
            created_at=p.created_at
        )
        for p in predictions
    ]
