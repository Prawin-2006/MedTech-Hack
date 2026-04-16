"""
MedChain India - Access Control Models
AccessGrant, TrustedPerson, and EmergencyQR models
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class AccessGrant(Base):
    """Doctor access grants from patients"""
    __tablename__ = "access_grants"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    grantee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    access_level = Column(String(50), default="full")  # basic, medium, full
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient = relationship("User", back_populates="access_grants_given",
                           foreign_keys=[patient_id])
    grantee = relationship("User", foreign_keys=[grantee_id])


class TrustedPerson(Base):
    """Trusted person (family/friend) access"""
    __tablename__ = "trusted_persons"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trusted_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    permission_level = Column(String(50), default="basic")  # basic, medium, full
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient = relationship("User", back_populates="trusted_persons",
                           foreign_keys=[patient_id])
    trusted_user = relationship("User", foreign_keys=[trusted_user_id])


class EmergencyQR(Base):
    """Emergency QR codes for temporary access"""
    __tablename__ = "emergency_qr"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    qr_token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient = relationship("User", back_populates="emergency_qrs")
