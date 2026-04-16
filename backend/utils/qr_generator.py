"""
MedChain India - QR Code Generator
Generates emergency access QR codes for patients
"""
import qrcode
import io
import base64
import uuid
from datetime import datetime, timedelta, timezone
from config import QR_EXPIRY_MINUTES


def generate_emergency_qr(patient_id: int, base_url: str = "http://localhost:5173") -> dict:
    """
    Generate a QR code for emergency access.
    Returns QR token and base64-encoded QR image.
    """
    # Generate unique token
    qr_token = f"EMR-{uuid.uuid4().hex[:16].upper()}"
    
    # Build emergency access URL
    emergency_url = f"{base_url}/emergency/{qr_token}"
    
    # Generate QR code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(emergency_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="#1a1a2e", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    # Calculate expiry
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=QR_EXPIRY_MINUTES)
    
    return {
        "qr_token": qr_token,
        "qr_image_base64": qr_base64,
        "emergency_url": emergency_url,
        "expires_at": expires_at,
        "expiry_minutes": QR_EXPIRY_MINUTES,
    }
