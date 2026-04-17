"""
MedChain India - Trusted Person Router
Read-only access with tiered permission levels
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.record import MedicalRecord
from models.access import TrustedPerson
from services.auth_service import get_current_user
from services.blockchain_service import log_to_blockchain
from utils.encryption import decrypt_data

router = APIRouter(prefix="/api/trusted", tags=["Trusted Person"])


@router.get("/dashboard")
def trusted_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get trusted person dashboard - list patients who trust this user"""
    trust_links = db.query(TrustedPerson).filter(
        TrustedPerson.trusted_user_id == current_user.id,
        TrustedPerson.is_active == True
    ).all()
    
    patients = []
    for link in trust_links:
        patient = link.patient
        data = {
            "id": patient.id,
            "name": patient.full_name,
            "permission_level": link.permission_level,
        }
        
        # Basic: blood_group + allergies
        if link.permission_level in ["basic", "medium", "full"]:
            data["blood_group"] = patient.blood_group
            data["allergies"] = patient.allergies
        
        # Medium: + medications
        if link.permission_level in ["medium", "full"]:
            data["medications"] = patient.medications
        
        patients.append(data)
    
    return {
        "user": {"id": current_user.id, "name": current_user.full_name},
        "trusted_by": patients,
    }


@router.get("/records/{patient_id}")
def view_trusted_records(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """View records based on trust permission level"""
    trust = db.query(TrustedPerson).filter(
        TrustedPerson.patient_id == patient_id,
        TrustedPerson.trusted_user_id == current_user.id,
        TrustedPerson.is_active == True
    ).first()
    
    if not trust:
        raise HTTPException(status_code=403, detail="You are not a trusted person for this patient")
    
    patient = db.query(User).filter(User.id == patient_id).first()
    
    # Build response based on permission level
    response = {
        "patient_name": patient.full_name,
        "permission_level": trust.permission_level,
    }
    
    # BASIC: Only blood group & allergies
    if trust.permission_level == "basic":
        response["blood_group"] = patient.blood_group
        response["allergies"] = patient.allergies
        response["records"] = []  # No records for basic
        response["note"] = "Basic access: Only critical health info (blood group, allergies)"
    
    # MEDIUM: + medications + limited records
    elif trust.permission_level == "medium":
        response["blood_group"] = patient.blood_group
        response["allergies"] = patient.allergies
        response["medications"] = patient.medications
        records = db.query(MedicalRecord).filter(
            MedicalRecord.patient_id == patient_id,
            MedicalRecord.record_type.in_(["prescription", "lab_report"])
        ).order_by(MedicalRecord.created_at.desc()).limit(10).all()
        response["records"] = [
            {"id": r.id, "title": r.title, "type": r.record_type,
             "created_at": r.created_at.isoformat() if r.created_at else None}
            for r in records
        ]
        response["note"] = "Medium access: Medications and recent prescriptions/lab reports"
    
    # FULL: Everything
    elif trust.permission_level == "full":
        response["blood_group"] = patient.blood_group
        response["allergies"] = patient.allergies
        response["medications"] = patient.medications
        records = db.query(MedicalRecord).filter(
            MedicalRecord.patient_id == patient_id
        ).order_by(MedicalRecord.created_at.desc()).all()
        response["records"] = [
            {"id": r.id, "title": r.title, "type": r.record_type,
             "description": decrypt_data(r.description), "ipfs_hash": r.ipfs_hash,
             "created_at": r.created_at.isoformat() if r.created_at else None}
            for r in records
        ]
        response["note"] = "Full access: Complete medical records"
    
    # Log access on blockchain
    log_to_blockchain(
        db, "trusted_access",
        actor_id=current_user.id,
        target_id=patient_id,
        metadata={"permission_level": trust.permission_level}
    )
    
    return response
