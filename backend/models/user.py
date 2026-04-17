"""
MedChain India - User Model
Defines the User table with role-based access
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # patient, doctor, trusted_person
    phone = Column(String(20), nullable=True)
    aadhaar_mock = Column(String(12), nullable=True)  # Mock Aadhaar
    blood_group = Column(String(10), nullable=True)
    allergies = Column(String(500), nullable=True)
    medications = Column(String(500), nullable=True)
    language_pref = Column(String(10), default="en")
    profile_image = Column(String, nullable=True)  # Using String (maps to VARCHAR/TEXT in SQLite) to store base64
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    medical_records = relationship("MedicalRecord", back_populates="patient",
                                   foreign_keys="MedicalRecord.patient_id")
    access_grants_given = relationship("AccessGrant", back_populates="patient",
                                       foreign_keys="AccessGrant.patient_id")
    trusted_persons = relationship("TrustedPerson", back_populates="patient",
                                   foreign_keys="TrustedPerson.patient_id")
    emergency_qrs = relationship("EmergencyQR", back_populates="patient")
