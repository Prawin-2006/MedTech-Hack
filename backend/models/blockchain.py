"""
MedChain India - Blockchain Log Model
Immutable log of all record and access events
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from database import Base


class BlockchainLog(Base):
    """Immutable blockchain transaction log"""
    __tablename__ = "blockchain_logs"

    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String(255), unique=True, nullable=False)
    action_type = Column(String(100), nullable=False)  # record_upload, access_grant, access_revoke, record_view, emergency_access
    data_hash = Column(String(255), nullable=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    record_id = Column(Integer, ForeignKey("medical_records.id"), nullable=True)
    metadata_json = Column(Text, nullable=True)
    block_number = Column(Integer, nullable=True)
    network = Column(String(50), default="polygon-mock")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
