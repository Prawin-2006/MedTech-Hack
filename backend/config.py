"""
MedChain India - Configuration
Central configuration for the application
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medchain.db")

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "medchain-india-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# File Upload Settings
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Encryption Key (Fernet)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# QR Code Settings
QR_EXPIRY_MINUTES = 30

# Blockchain Mock Settings
BLOCKCHAIN_NETWORK = "polygon-mock"
