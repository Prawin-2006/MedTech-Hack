"""
MedChain India - AI Service
Basic AI features: medical record summarization and drug interaction checking
"""
import re
from typing import List, Dict


# ===== MEDICAL RECORD SUMMARIZER =====

# Common medical keywords for extraction
MEDICAL_KEYWORDS = {
    "diagnosis": ["diagnosed with", "diagnosis:", "assessment:", "impression:", "findings:"],
    "medication": ["prescribed", "medication:", "rx:", "dosage:", "tablet", "capsule", "mg", "ml"],
    "procedure": ["surgery", "procedure:", "operation", "biopsy", "scan", "x-ray", "mri", "ct scan"],
    "vitals": ["bp:", "blood pressure", "heart rate", "temperature", "pulse", "spo2", "weight", "height"],
    "lab_results": ["hemoglobin", "wbc", "rbc", "platelet", "glucose", "creatinine", "cholesterol"],
}


def summarize_record(text: str, record_type: str = "general") -> dict:
    """
    Summarize a medical record using rule-based NLP.
    In production, this would use a fine-tuned medical LLM.
    """
    if not text or len(text.strip()) < 10:
        return {
            "summary": "Insufficient text for summarization.",
            "key_findings": [],
            "confidence": 0.0
        }
    
    text_lower = text.lower()
    key_findings = []
    
    # Extract key findings by category
    for category, keywords in MEDICAL_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                # Extract surrounding context (simple approach)
                idx = text_lower.find(keyword)
                start = max(0, idx - 20)
                end = min(len(text), idx + len(keyword) + 80)
                context = text[start:end].strip()
                key_findings.append({
                    "category": category,
                    "keyword": keyword,
                    "context": context
                })
    
    # Generate summary
    sentences = re.split(r'[.!?]', text)
    important_sentences = []
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) > 20:
            for keywords in MEDICAL_KEYWORDS.values():
                if any(kw in sentence.lower() for kw in keywords):
                    important_sentences.append(sentence)
                    break
    
    summary = ". ".join(important_sentences[:5])
    if not summary:
        summary = ". ".join(s.strip() for s in sentences[:3] if len(s.strip()) > 10)
    
    if summary and not summary.endswith("."):
        summary += "."
    
    return {
        "summary": summary or "No significant findings could be extracted.",
        "key_findings": key_findings[:10],
        "record_type": record_type,
        "word_count": len(text.split()),
        "confidence": min(0.85, 0.3 + (len(key_findings) * 0.1)),
        "ai_model": "MedChain-NLP-v1 (Rule-Based)"
    }


# ===== DRUG INTERACTION CHECKER =====

# Demo drug interaction database
DRUG_INTERACTIONS = {
    ("aspirin", "warfarin"): {
        "severity": "HIGH",
        "description": "Increased risk of bleeding. Both drugs affect blood clotting.",
        "recommendation": "Avoid concurrent use unless medically necessary. Monitor closely."
    },
    ("metformin", "alcohol"): {
        "severity": "HIGH",
        "description": "Risk of lactic acidosis. Alcohol inhibits gluconeogenesis.",
        "recommendation": "Limit alcohol intake. Monitor blood glucose levels."
    },
    ("ibuprofen", "aspirin"): {
        "severity": "MODERATE",
        "description": "Ibuprofen may reduce the cardioprotective effect of aspirin.",
        "recommendation": "Take aspirin at least 30 minutes before ibuprofen."
    },
    ("lisinopril", "potassium"): {
        "severity": "MODERATE",
        "description": "Risk of hyperkalemia. ACE inhibitors increase potassium levels.",
        "recommendation": "Monitor potassium levels regularly."
    },
    ("simvastatin", "grapefruit"): {
        "severity": "MODERATE",
        "description": "Grapefruit increases simvastatin levels, raising risk of myopathy.",
        "recommendation": "Avoid grapefruit consumption while on this medication."
    },
    ("ciprofloxacin", "antacid"): {
        "severity": "LOW",
        "description": "Antacids reduce ciprofloxacin absorption.",
        "recommendation": "Take ciprofloxacin 2 hours before or 6 hours after antacids."
    },
    ("amoxicillin", "methotrexate"): {
        "severity": "HIGH",
        "description": "Amoxicillin may increase methotrexate toxicity.",
        "recommendation": "Monitor methotrexate levels closely."
    },
    ("omeprazole", "clopidogrel"): {
        "severity": "HIGH",
        "description": "Omeprazole reduces the antiplatelet effect of clopidogrel.",
        "recommendation": "Consider pantoprazole as an alternative PPI."
    },
    ("paracetamol", "alcohol"): {
        "severity": "HIGH",
        "description": "Increased risk of hepatotoxicity (liver damage).",
        "recommendation": "Avoid alcohol while taking paracetamol. Limit dosage."
    },
}


def check_drug_interactions(drugs: List[str]) -> dict:
    """
    Check for drug interactions between a list of drugs.
    Uses a rule-based demo database.
    """
    if not drugs or len(drugs) < 2:
        return {
            "interactions_found": 0,
            "interactions": [],
            "message": "At least 2 drugs are required for interaction check."
        }
    
    # Normalize drug names
    normalized = [d.strip().lower() for d in drugs]
    
    interactions_found = []
    
    # Check all pairs
    for i in range(len(normalized)):
        for j in range(i + 1, len(normalized)):
            pair = tuple(sorted([normalized[i], normalized[j]]))
            # Check both orderings
            for key, value in DRUG_INTERACTIONS.items():
                sorted_key = tuple(sorted(key))
                if sorted_key == pair:
                    interactions_found.append({
                        "drug_1": drugs[i],
                        "drug_2": drugs[j],
                        **value
                    })
    
    return {
        "interactions_found": len(interactions_found),
        "interactions": interactions_found,
        "drugs_checked": drugs,
        "total_pairs_checked": len(normalized) * (len(normalized) - 1) // 2,
        "database": "MedChain Drug Interaction DB v1 (Demo)",
        "disclaimer": "This is a demonstration system. Always consult a healthcare professional."
    }


# ===== VOICE INPUT SIMULATION =====

def simulate_voice_to_text(language: str = "en") -> dict:
    """Simulate voice-to-text input"""
    sample_texts = {
        "en": "Patient reports persistent headache for the past three days with mild fever.",
        "hi": "मरीज को पिछले तीन दिनों से लगातार सिरदर्द और हल्का बुखार है।",
        "ta": "நோயாளி கடந்த மூன்று நாட்களாக தொடர்ந்து தலைவலி மற்றும் லேசான காய்ச்சலைக் தெரிவிக்கிறார்."
    }
    return {
        "text": sample_texts.get(language, sample_texts["en"]),
        "language": language,
        "confidence": 0.92,
        "service": "Bhashini API (Simulated)"
    }
