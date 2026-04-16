"""
MedChain India - Authentication Router
Register, Login, Profile endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
from models.user import User
from services.auth_service import (
    hash_password, verify_password, create_access_token, get_current_user
)
from services.blockchain_service import log_to_blockchain

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ===== Pydantic Schemas =====

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str  # patient, doctor, trusted_person
    phone: Optional[str] = None
    aadhaar_mock: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    language_pref: Optional[str] = "en"


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    language_pref: Optional[str] = None


# ===== Endpoints =====

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if req.role not in ["patient", "doctor", "trusted_person"]:
        raise HTTPException(status_code=400, detail="Invalid role. Use: patient, doctor, trusted_person")
    
    # Create user
    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        role=req.role,
        phone=req.phone,
        aadhaar_mock=req.aadhaar_mock,
        blood_group=req.blood_group,
        allergies=req.allergies,
        language_pref=req.language_pref or "en"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log to blockchain
    log_to_blockchain(db, "user_register", actor_id=user.id,
                      metadata={"role": req.role, "email": req.email})
    
    # Generate token
    token = create_access_token({"sub": str(user.id), "role": user.role})
    
    return {
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "language_pref": user.language_pref,
        }
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login and get JWT token"""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    
    token = create_access_token({"sub": str(user.id), "role": user.role})
    
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "language_pref": user.language_pref,
        }
    }


@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone": current_user.phone,
        "aadhaar_mock": current_user.aadhaar_mock,
        "blood_group": current_user.blood_group,
        "allergies": current_user.allergies,
        "medications": current_user.medications,
        "language_pref": current_user.language_pref,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.put("/profile")
def update_profile(
    req: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.phone is not None:
        current_user.phone = req.phone
    if req.blood_group is not None:
        current_user.blood_group = req.blood_group
    if req.allergies is not None:
        current_user.allergies = req.allergies
    if req.medications is not None:
        current_user.medications = req.medications
    if req.language_pref is not None:
        current_user.language_pref = req.language_pref
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile updated successfully"}


@router.post("/aadhaar-verify")
def mock_aadhaar_verification(
    aadhaar_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mock Aadhaar verification"""
    if len(aadhaar_number) != 12 or not aadhaar_number.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number format")
    
    current_user.aadhaar_mock = aadhaar_number
    db.commit()
    
    log_to_blockchain(db, "aadhaar_verification", actor_id=current_user.id,
                      metadata={"aadhaar_last4": aadhaar_number[-4:]})
    
    return {
        "message": "Aadhaar verified successfully (Mock)",
        "verified": True,
        "name_match": True,
        "aadhaar_last4": aadhaar_number[-4:]
    }
