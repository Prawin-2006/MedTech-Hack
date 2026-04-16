"""
MedChain India - AI Router
Medical record summarization and drug interaction API
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.ai_service import summarize_record, check_drug_interactions, simulate_voice_to_text
from services.auth_service import get_current_user
from models.user import User

router = APIRouter(prefix="/api/ai", tags=["AI Features"])


class SummarizeRequest(BaseModel):
    text: str
    record_type: Optional[str] = "general"


class DrugCheckRequest(BaseModel):
    drugs: List[str]


@router.post("/summarize")
def ai_summarize(
    req: SummarizeRequest,
    current_user: User = Depends(get_current_user)
):
    """Summarize a medical record using AI"""
    result = summarize_record(req.text, req.record_type)
    return result


@router.post("/drug-check")
def ai_drug_check(
    req: DrugCheckRequest,
    current_user: User = Depends(get_current_user)
):
    """Check drug interactions"""
    result = check_drug_interactions(req.drugs)
    return result


@router.get("/voice-input")
def ai_voice_input(
    language: str = "en",
    current_user: User = Depends(get_current_user)
):
    """Simulate voice to text input (Bhashini API mock)"""
    result = simulate_voice_to_text(language)
    return result
