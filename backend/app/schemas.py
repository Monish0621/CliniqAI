"""
CliniqAI Pydantic Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    role: str = Field(..., pattern="^(doctor|patient)$")


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Prediction Input Schemas
class DiabetesPredictionInput(BaseModel):
    gender: str = Field(..., pattern="^(Female|Male|Other)$")
    age: float = Field(..., ge=0, le=120)
    hypertension: bool
    heart_disease: bool
    smoking_history: str = Field(..., pattern="^(never|not current|ever|former|current|unknown)$")
    bmi: float = Field(..., ge=10, le=100)
    HbA1c_level: float = Field(..., ge=3, le=15)
    blood_glucose_level: float = Field(..., ge=50, le=500)
    patient_name: Optional[str] = None


class HeartPredictionInput(BaseModel):
    age: float = Field(..., ge=0, le=120)
    gender: str = Field(..., pattern="^(Female|Male)$")
    ap_hi: float = Field(..., ge=50, le=250)  # Systolic blood pressure
    ap_lo: float = Field(..., ge=30, le=150)  # Diastolic blood pressure
    smoke: bool
    alco: bool
    active: bool
    bmi: float = Field(..., ge=10, le=100)
    patient_name: Optional[str] = None


# Prediction Output Schemas
class SHAPValue(BaseModel):
    feature: str
    value: float
    impact: str  # "positive" or "negative"


class PredictionResponse(BaseModel):
    id: Optional[int] = None
    risk_probability: float
    risk_category: str
    confidence_interval_low: float
    confidence_interval_high: float
    shap_values: List[SHAPValue]
    clinical_explanation: str
    disease_type: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Patient Record Schemas
class PatientRecordCreate(BaseModel):
    patient_name: str
    disease_type: str = Field(..., pattern="^(diabetes|heart_disease)$")
    input_data: Dict[str, Any]


class PatientRecordResponse(BaseModel):
    id: int
    user_id: int
    patient_name: str
    disease_type: str
    input_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    predictions: List[PredictionResponse] = []

    class Config:
        from_attributes = True


class PatientRecordList(BaseModel):
    id: int
    user_id: int
    patient_name: str
    disease_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# Comparison Schemas
class PatientComparisonRequest(BaseModel):
    record_id_1: int
    record_id_2: int


class PatientComparisonResponse(BaseModel):
    record_1: PatientRecordResponse
    record_2: PatientRecordResponse
    prediction_1: PredictionResponse
    prediction_2: PredictionResponse
    differences: Dict[str, Any]


# Risk Trajectory Schemas
class RiskTrajectoryResponse(BaseModel):
    predictions: List[PredictionResponse]
    timestamps: List[datetime]
    trend: str  # "increasing", "decreasing", "stable"


# Model Info Schemas
class ModelPerformance(BaseModel):
    accuracy: float
    auc: float
    recall: Optional[float] = None
    precision: Optional[float] = None
    threshold: float
    training_samples: int
    dataset: str


class ModelInfoResponse(BaseModel):
    disease_type: str
    features: List[str]
    feature_display_names: List[str]
    performance: ModelPerformance
    risk_levels: Dict[str, str]
    clinical_thresholds: Dict[str, float]


# PDF Report Schema
class PDFReportRequest(BaseModel):
    prediction_id: int


# What-If Simulator Schema
class WhatIfPredictionRequest(BaseModel):
    disease_type: str = Field(..., pattern="^(diabetes|heart_disease)$")
    input_data: Dict[str, Any]
