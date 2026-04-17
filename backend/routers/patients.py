"""
MedChain India - Patient Router
Patient dashboard, record management, access control
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal
from database import get_db
from models.user import User
from models.record import MedicalRecord
from models.access import AccessGrant, TrustedPerson, EmergencyQR
from models.blockchain import BlockchainLog
from services.auth_service import require_role
from services.blockchain_service import log_to_blockchain
from services.ipfs_service import store_file
from utils.encryption import encrypt_data, decrypt_data
from utils.qr_generator import generate_emergency_qr
from config import MAX_FILE_SIZE

router = APIRouter(prefix="/api/patients", tags=["Patient"])


# ===== Schemas =====

class GrantAccessRequest(BaseModel):
    grantee_email: str
    access_level: Literal["basic", "medium", "full"] = "full"


class AddTrustedRequest(BaseModel):
    trusted_email: str
    permission_level: Literal["basic", "medium", "full"] = "basic"


async def _read_upload_with_limit(file: UploadFile) -> bytes:
    content = bytearray()
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        content.extend(chunk)
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum size of {MAX_FILE_SIZE} bytes"
            )
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    return bytes(content)


# ===== Dashboard =====

@router.get("/dashboard")
def patient_dashboard(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Get patient dashboard data"""
    records_count = db.query(MedicalRecord).filter(
        MedicalRecord.patient_id == current_user.id
    ).count()
    
    active_grants = db.query(AccessGrant).filter(
        AccessGrant.patient_id == current_user.id,
        AccessGrant.is_active == True
    ).count()
    
    trusted_count = db.query(TrustedPerson).filter(
        TrustedPerson.patient_id == current_user.id,
        TrustedPerson.is_active == True
    ).count()
    
    recent_logs = db.query(BlockchainLog).filter(
        BlockchainLog.target_id == current_user.id
    ).order_by(BlockchainLog.timestamp.desc()).limit(5).all()
    
    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "blood_group": current_user.blood_group,
            "allergies": current_user.allergies,
            "medications": current_user.medications,
        },
        "stats": {
            "total_records": records_count,
            "active_doctor_access": active_grants,
            "trusted_persons": trusted_count,
        },
        "recent_activity": [
            {
                "action": log.action_type,
                "tx_hash": log.tx_hash[:16] + "...",
                "timestamp": log.timestamp.isoformat()
            }
            for log in recent_logs
        ]
    }


# ===== Records =====

@router.get("/records")
def get_records(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Get all medical records for the patient"""
    records = db.query(MedicalRecord).filter(
        MedicalRecord.patient_id == current_user.id
    ).order_by(MedicalRecord.created_at.desc()).all()
    
    return {
        "records": [
            {
                "id": r.id,
                "title": r.title,
                "record_type": r.record_type,
                "description": decrypt_data(r.description),
                "ipfs_hash": r.ipfs_hash,
                "blockchain_hash": r.blockchain_hash,
                "ai_summary": r.ai_summary,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "uploaded_by": r.uploader.full_name if r.uploader else "Unknown",
            }
            for r in records
        ]
    }


@router.post("/records")
async def upload_record(
    title: str = Form(...),
    record_type: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Upload a medical record (PDF/image)"""
    # Read file content with size guard
    content = await _read_upload_with_limit(file)
    
    # Store in simulated IPFS
    try:
        storage_result = store_file(content, file.filename, file.content_type or "")
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    
    # Create record
    record = MedicalRecord(
        patient_id=current_user.id,
        uploaded_by=current_user.id,
        record_type=record_type,
        title=title,
        description=encrypt_data(description),
        file_path=storage_result["file_path"],
        ipfs_hash=storage_result["ipfs_hash"],
        encrypted="yes",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    # Log to blockchain
    bc_log = log_to_blockchain(
        db, "record_upload",
        actor_id=current_user.id,
        target_id=current_user.id,
        record_id=record.id,
        metadata={
            "title": title,
            "record_type": record_type,
            "ipfs_hash": storage_result["ipfs_hash"],
            "file_size": storage_result["size_bytes"]
        }
    )
    
    record.blockchain_hash = bc_log.tx_hash
    db.commit()
    
    return {
        "message": "Record uploaded successfully",
        "record_id": record.id,
        "ipfs_hash": storage_result["ipfs_hash"],
        "blockchain_tx": bc_log.tx_hash,
        "storage": storage_result["storage"]
    }


# ===== Access Management =====

@router.post("/grant-access")
def grant_access(
    req: GrantAccessRequest,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Grant a doctor access to medical records"""
    doctor = db.query(User).filter(
        User.email == req.grantee_email,
        User.role == "doctor"
    ).first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found with that email")
    
    # Check existing grant
    existing = db.query(AccessGrant).filter(
        AccessGrant.patient_id == current_user.id,
        AccessGrant.grantee_id == doctor.id,
        AccessGrant.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Access already granted to this doctor")
    
    grant = AccessGrant(
        patient_id=current_user.id,
        grantee_id=doctor.id,
        access_level=req.access_level
    )
    db.add(grant)
    db.commit()
    
    log_to_blockchain(
        db, "access_grant",
        actor_id=current_user.id,
        target_id=doctor.id,
        metadata={"access_level": req.access_level, "doctor_email": req.grantee_email}
    )
    
    return {"message": f"Access granted to Dr. {doctor.full_name}", "grant_id": grant.id}


@router.delete("/revoke-access/{grant_id}")
def revoke_access(
    grant_id: int,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Revoke a doctor's access"""
    grant = db.query(AccessGrant).filter(
        AccessGrant.id == grant_id,
        AccessGrant.patient_id == current_user.id
    ).first()
    
    if not grant:
        raise HTTPException(status_code=404, detail="Access grant not found")
    
    grant.is_active = False
    db.commit()
    
    log_to_blockchain(
        db, "access_revoke",
        actor_id=current_user.id,
        target_id=grant.grantee_id,
        metadata={"grant_id": grant_id}
    )
    
    return {"message": "Access revoked successfully"}


@router.get("/access-list")
def get_access_list(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Get list of users with access to patient records"""
    grants = db.query(AccessGrant).filter(
        AccessGrant.patient_id == current_user.id,
        AccessGrant.is_active == True
    ).all()
    
    return {
        "grants": [
            {
                "id": g.id,
                "doctor_name": g.grantee.full_name,
                "doctor_email": g.grantee.email,
                "access_level": g.access_level,
                "created_at": g.created_at.isoformat() if g.created_at else None,
            }
            for g in grants
        ]
    }


# ===== Trusted Persons =====

@router.post("/trusted")
def add_trusted_person(
    req: AddTrustedRequest,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Add a trusted person (family/friend)"""
    trusted_user = db.query(User).filter(User.email == req.trusted_email).first()
    
    if not trusted_user:
        raise HTTPException(status_code=404, detail="User not found with that email")
    
    if trusted_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as trusted person")
    
    existing = db.query(TrustedPerson).filter(
        TrustedPerson.patient_id == current_user.id,
        TrustedPerson.trusted_user_id == trusted_user.id,
        TrustedPerson.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Person already added as trusted")
    
    tp = TrustedPerson(
        patient_id=current_user.id,
        trusted_user_id=trusted_user.id,
        permission_level=req.permission_level
    )
    db.add(tp)
    db.commit()
    
    log_to_blockchain(
        db, "trusted_add",
        actor_id=current_user.id,
        target_id=trusted_user.id,
        metadata={"permission_level": req.permission_level}
    )
    
    return {"message": f"{trusted_user.full_name} added as trusted person", "id": tp.id}


@router.delete("/trusted/{tp_id}")
def remove_trusted_person(
    tp_id: int,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Remove a trusted person"""
    tp = db.query(TrustedPerson).filter(
        TrustedPerson.id == tp_id,
        TrustedPerson.patient_id == current_user.id
    ).first()
    
    if not tp:
        raise HTTPException(status_code=404, detail="Trusted person not found")
    
    tp.is_active = False
    db.commit()
    
    log_to_blockchain(
        db, "trusted_remove",
        actor_id=current_user.id,
        target_id=tp.trusted_user_id,
    )
    
    return {"message": "Trusted person removed"}


@router.get("/trusted-list")
def get_trusted_list(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Get list of trusted persons"""
    trusted = db.query(TrustedPerson).filter(
        TrustedPerson.patient_id == current_user.id,
        TrustedPerson.is_active == True
    ).all()
    
    return {
        "trusted": [
            {
                "id": t.id,
                "name": t.trusted_user.full_name,
                "email": t.trusted_user.email,
                "permission_level": t.permission_level,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in trusted
        ]
    }


# ===== Emergency QR =====

@router.post("/emergency-qr")
def create_emergency_qr(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Generate emergency QR code"""
    qr_data = generate_emergency_qr(current_user.id)
    
    # Store in database
    emergency = EmergencyQR(
        patient_id=current_user.id,
        qr_token=qr_data["qr_token"],
        expires_at=qr_data["expires_at"]
    )
    db.add(emergency)
    db.commit()
    
    log_to_blockchain(
        db, "emergency_qr_generated",
        actor_id=current_user.id,
        target_id=current_user.id,
        metadata={"expires_at": qr_data["expires_at"].isoformat()}
    )
    
    return {
        "qr_token": qr_data["qr_token"],
        "qr_image": qr_data["qr_image_base64"],
        "emergency_url": qr_data["emergency_url"],
        "expires_at": qr_data["expires_at"].isoformat(),
        "expiry_minutes": qr_data["expiry_minutes"],
    }
