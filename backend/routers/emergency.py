"""
MedChain India - Emergency Access Router
QR code-based emergency access to critical patient data
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from database import get_db
from models.user import User
from models.record import MedicalRecord
from models.access import EmergencyQR
from services.blockchain_service import log_to_blockchain
from utils.encryption import decrypt_data

router = APIRouter(prefix="/api/emergency", tags=["Emergency Access"])


@router.get("/{token}")
def emergency_access(token: str, db: Session = Depends(get_db)):
    """
    Access critical patient data via emergency QR token.
    No authentication required — zero-trust emergency mode.
    """
    # Find the QR token
    qr = db.query(EmergencyQR).filter(EmergencyQR.qr_token == token).first()
    
    if not qr:
        raise HTTPException(status_code=404, detail="Invalid emergency token")
    
    # Check expiry
    now = datetime.now(timezone.utc)
    if qr.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=410, detail="Emergency token has expired")
    
    if qr.is_used:
        raise HTTPException(status_code=410, detail="Emergency token has already been used")
    
    # Get patient info
    patient = db.query(User).filter(User.id == qr.patient_id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get recent critical records
    records = db.query(MedicalRecord).filter(
        MedicalRecord.patient_id == patient.id
    ).order_by(MedicalRecord.created_at.desc()).limit(5).all()
    
    # Mark QR as used
    qr.is_used = True
    db.commit()
    
    # Log emergency access on blockchain
    log_to_blockchain(
        db, "emergency_access",
        target_id=patient.id,
        metadata={
            "qr_token": token,
            "access_type": "emergency",
            "timestamp": now.isoformat()
        }
    )
    
    return {
        "emergency": True,
        "patient": {
            "name": patient.full_name,
            "blood_group": patient.blood_group,
            "allergies": patient.allergies,
            "medications": patient.medications,
            "phone": patient.phone,
        },
        "critical_records": [
            {
                "title": r.title,
                "type": r.record_type,
                "description": decrypt_data(r.description),
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ],
        "disclaimer": "Emergency access - this access has been logged on the blockchain.",
        "token_status": "used"
    }
