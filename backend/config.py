"""
MedChain India - Configuration
Central configuration for the application
"""
import os
import secrets
from dotenv import load_dotenv

load_dotenv()

# Runtime environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medchain.db")

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
if not SECRET_KEY:
    # Development fallback to avoid shipping a predictable default.
    # In production, always require an explicit secret.
    if ENVIRONMENT == "production":
        raise RuntimeError("SECRET_KEY is required in production")
    SECRET_KEY = secrets.token_urlsafe(48)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# File Upload Settings
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(10 * 1024 * 1024)))  # 10MB default
ALLOWED_UPLOAD_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
}
ALLOWED_UPLOAD_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}

def _parse_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name, str(default)).strip().lower()
    return raw in {"1", "true", "yes", "on"}

EXPOSE_UPLOADS = _parse_bool("EXPOSE_UPLOADS", default=False)

# Encryption Key (Fernet)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "").strip()

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# Frontend URL for emergency QR links
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")

# Admin emails allowed to access privileged endpoints
ADMIN_EMAILS = {
    email.strip().lower()
    for email in os.getenv("ADMIN_EMAILS", "").split(",")
    if email.strip()
}

# QR Code Settings
QR_EXPIRY_MINUTES = 30

# Blockchain Mock Settings
BLOCKCHAIN_NETWORK = "polygon-mock"
