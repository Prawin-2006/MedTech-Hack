"""
MedChain India - Doctor Router
Doctor dashboard, viewing patient records, uploading prescriptions
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.record import MedicalRecord
from models.access import AccessGrant
from services.auth_service import require_role
from services.blockchain_service import log_to_blockchain
from services.ipfs_service import store_file
from utils.encryption import encrypt_data, decrypt_data
from config import MAX_FILE_SIZE

router = APIRouter(prefix="/api/doctors", tags=["Doctor"])


class AddNoteRequest(BaseModel):
    patient_id: int
    title: str
    note_content: str


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


@router.get("/dashboard")
def doctor_dashboard(
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """Get doctor dashboard"""
    # Get patients who granted access
    active_grants = db.query(AccessGrant).filter(
        AccessGrant.grantee_id == current_user.id,
        AccessGrant.is_active == True
    ).all()
    
    patients = []
    for grant in active_grants:
        patient = grant.patient
        records_count = db.query(MedicalRecord).filter(
            MedicalRecord.patient_id == patient.id
        ).count()
        patients.append({
            "id": patient.id,
            "name": patient.full_name,
            "blood_group": patient.blood_group,
            "allergies": patient.allergies,
            "access_level": grant.access_level,
            "records_count": records_count,
        })
    
    return {
        "doctor": {
            "id": current_user.id,
            "name": current_user.full_name,
        },
        "total_patients": len(patients),
        "patients": patients,
    }


@router.get("/patients")
def list_patients(
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """List all patients who granted access to this doctor"""
    grants = db.query(AccessGrant).filter(
        AccessGrant.grantee_id == current_user.id,
        AccessGrant.is_active == True
    ).all()
    
    return {
        "patients": [
            {
                "id": g.patient.id,
                "name": g.patient.full_name,
                "email": g.patient.email,
                "blood_group": g.patient.blood_group,
                "allergies": g.patient.allergies,
                "access_level": g.access_level,
                "granted_at": g.created_at.isoformat() if g.created_at else None,
            }
            for g in grants
        ]
    }


@router.get("/records/{patient_id}")
def view_patient_records(
    patient_id: int,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """View a patient's medical records (if access granted)"""
    # Check access
    grant = db.query(AccessGrant).filter(
        AccessGrant.patient_id == patient_id,
        AccessGrant.grantee_id == current_user.id,
        AccessGrant.is_active == True
    ).first()
    
    if not grant:
        raise HTTPException(status_code=403, detail="Access not granted by this patient")
    
    records = db.query(MedicalRecord).filter(
        MedicalRecord.patient_id == patient_id
    ).order_by(MedicalRecord.created_at.desc()).all()
    
    # Log access on blockchain
    log_to_blockchain(
        db, "record_view",
        actor_id=current_user.id,
        target_id=patient_id,
        metadata={"records_viewed": len(records)}
    )
    
    patient = db.query(User).filter(User.id == patient_id).first()
    
    return {
        "patient": {
            "id": patient.id,
            "name": patient.full_name,
            "blood_group": patient.blood_group,
            "allergies": patient.allergies,
            "medications": patient.medications,
        },
        "access_level": grant.access_level,
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
            }
            for r in records
        ]
    }


@router.post("/prescriptions")
async def upload_prescription(
    patient_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """Upload a prescription for a patient"""
    # Verify access
    grant = db.query(AccessGrant).filter(
        AccessGrant.patient_id == patient_id,
        AccessGrant.grantee_id == current_user.id,
        AccessGrant.is_active == True
    ).first()
    
    if not grant:
        raise HTTPException(status_code=403, detail="Access not granted by this patient")
    
    # Store file
    content = await _read_upload_with_limit(file)
    try:
        storage_result = store_file(content, file.filename, file.content_type or "")
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    
    # Create record
    record = MedicalRecord(
        patient_id=patient_id,
        uploaded_by=current_user.id,
        record_type="prescription",
        title=title,
        description=encrypt_data(description),
        file_path=storage_result["file_path"],
        ipfs_hash=storage_result["ipfs_hash"],
        encrypted="yes",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    bc_log = log_to_blockchain(
        db, "prescription_upload",
        actor_id=current_user.id,
        target_id=patient_id,
        record_id=record.id,
        metadata={"title": title, "ipfs_hash": storage_result["ipfs_hash"]}
    )
    
    record.blockchain_hash = bc_log.tx_hash
    db.commit()
    
    return {
        "message": "Prescription uploaded successfully",
        "record_id": record.id,
        "ipfs_hash": storage_result["ipfs_hash"],
        "blockchain_tx": bc_log.tx_hash,
    }


@router.post("/notes")
def add_clinical_note(
    req: AddNoteRequest,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    """Add clinical notes for a patient"""
    grant = db.query(AccessGrant).filter(
        AccessGrant.patient_id == req.patient_id,
        AccessGrant.grantee_id == current_user.id,
        AccessGrant.is_active == True
    ).first()
    
    if not grant:
        raise HTTPException(status_code=403, detail="Access not granted by this patient")
    
    record = MedicalRecord(
        patient_id=req.patient_id,
        uploaded_by=current_user.id,
        record_type="clinical_notes",
        title=req.title,
        description=encrypt_data(req.note_content),
        encrypted="yes",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    bc_log = log_to_blockchain(
        db, "note_added",
        actor_id=current_user.id,
        target_id=req.patient_id,
        record_id=record.id,
        metadata={"title": req.title}
    )
    
    record.blockchain_hash = bc_log.tx_hash
    db.commit()
    
    return {"message": "Note added successfully", "record_id": record.id}
