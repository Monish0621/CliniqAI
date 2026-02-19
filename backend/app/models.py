"""
CliniqAI Database Models
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    """User model for authentication"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, nullable=False)  # "doctor" or "patient"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    patient_records = relationship("PatientRecord", back_populates="user", cascade="all, delete-orphan")


class PatientRecord(Base):
    """Patient record model"""
    __tablename__ = "patient_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_name = Column(String, nullable=False)
    disease_type = Column(String, nullable=False)  # "diabetes" or "heart_disease"
    input_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="patient_records")
    predictions = relationship("Prediction", back_populates="patient_record", cascade="all, delete-orphan")


class Prediction(Base):
    """Prediction model"""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_record_id = Column(Integer, ForeignKey("patient_records.id"), nullable=True)
    disease_type = Column(String, nullable=False)
    
    # Prediction results
    risk_probability = Column(Float, nullable=False)
    risk_category = Column(String, nullable=False)
    confidence_interval_low = Column(Float, nullable=False)
    confidence_interval_high = Column(Float, nullable=False)
    
    # SHAP values
    shap_values = Column(JSON, nullable=True)
    
    # Input data (snapshot)
    input_data = Column(JSON, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="predictions")
    patient_record = relationship("PatientRecord", back_populates="predictions")
