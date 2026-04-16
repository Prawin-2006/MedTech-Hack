"""
MedChain India - Medical Record Model
Stores medical records with IPFS and blockchain references
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    record_type = Column(String(100), nullable=False)  # lab_report, prescription, imaging, notes, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    ipfs_hash = Column(String(255), nullable=True)  # Simulated IPFS hash
    blockchain_hash = Column(String(255), nullable=True)  # Hash stored on blockchain
    ai_summary = Column(Text, nullable=True)
    encrypted = Column(String(10), default="yes")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient = relationship("User", back_populates="medical_records",
                           foreign_keys=[patient_id])
    uploader = relationship("User", foreign_keys=[uploaded_by])
