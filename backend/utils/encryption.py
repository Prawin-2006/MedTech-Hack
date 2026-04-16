"""
MedChain India - Encryption Utilities
AES encryption for sensitive medical data
"""
from cryptography.fernet import Fernet
from config import ENCRYPTION_KEY
import base64
import hashlib

# Generate or use configured key
def _get_fernet_key():
    if ENCRYPTION_KEY:
        # Derive a proper Fernet key from the configured key
        key = hashlib.sha256(ENCRYPTION_KEY.encode()).digest()
        return base64.urlsafe_b64encode(key)
    else:
        # Generate a key for development
        return Fernet.generate_key()

_fernet_key = _get_fernet_key()
_cipher = Fernet(_fernet_key)


def encrypt_data(data: str) -> str:
    """Encrypt sensitive string data"""
    if not data:
        return data
    return _cipher.encrypt(data.encode()).decode()


def decrypt_data(encrypted_data: str) -> str:
    """Decrypt encrypted string data"""
    if not encrypted_data:
        return encrypted_data
    try:
        return _cipher.decrypt(encrypted_data.encode()).decode()
    except Exception:
        return encrypted_data  # Return as-is if decryption fails


def hash_data(data: str) -> str:
    """Create a SHA-256 hash of data"""
    return hashlib.sha256(data.encode()).hexdigest()
