"""
CliniqAI Reports Router
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Prediction
from ..auth import get_current_user
from ..services import pdf_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/pdf")
def download_pdf_report(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download PDF report for a prediction"""
    # Get prediction
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Get patient record if exists
    patient_name = "Patient"
    if prediction.patient_record_id:
        from ..models import PatientRecord
        record = db.query(PatientRecord).filter(
            PatientRecord.id == prediction.patient_record_id
        ).first()
        if record:
            patient_name = record.patient_name
    
    # Generate PDF
    pdf_bytes = pdf_service.generate_pdf_bytes(
        patient_name=patient_name,
        disease_type=prediction.disease_type,
        input_data=prediction.input_data,
        prediction={
            "risk_probability": prediction.risk_probability,
            "risk_category": prediction.risk_category,
            "confidence_interval_low": prediction.confidence_interval_low,
            "confidence_interval_high": prediction.confidence_interval_high,
        },
        shap_values=prediction.shap_values or [],
        clinical_explanation="See prediction details for clinical interpretation."
    )
    
    return Response(
        content=pdf_bytes,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=cliniqai_report_{prediction_id}.txt"
        }
    )
