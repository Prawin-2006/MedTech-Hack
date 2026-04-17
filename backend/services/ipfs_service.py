"""
MedChain India - IPFS Service (Simulated)
Simulates IPFS file storage with local file system
"""
import hashlib
import os
import uuid
from config import (
    UPLOAD_DIR,
    MAX_FILE_SIZE,
    ALLOWED_UPLOAD_MIME_TYPES,
    ALLOWED_UPLOAD_EXTENSIONS,
)


def _generate_ipfs_hash(file_content: bytes) -> str:
    """Generate a CID-like hash for simulated IPFS"""
    content_hash = hashlib.sha256(file_content).hexdigest()
    return f"Qm{content_hash[:44]}"  # Simulate IPFS CIDv0 format


def _validate_upload(file_content: bytes, filename: str, content_type: str = "") -> None:
    if not file_content:
        raise ValueError("Uploaded file is empty")
    if len(file_content) > MAX_FILE_SIZE:
        raise ValueError(f"File exceeds maximum allowed size ({MAX_FILE_SIZE} bytes)")

    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise ValueError("Unsupported file extension")

    if content_type and content_type not in ALLOWED_UPLOAD_MIME_TYPES:
        raise ValueError("Unsupported file content type")


def _safe_upload_path(file_path: str) -> str:
    candidate = os.path.abspath(os.path.join(UPLOAD_DIR, file_path))
    upload_root = os.path.abspath(UPLOAD_DIR)
    if not candidate.startswith(upload_root + os.sep):
        raise ValueError("Invalid file path")
    return candidate


def store_file(file_content: bytes, filename: str, content_type: str = "") -> dict:
    """
    Store a file in simulated IPFS (local filesystem).
    Returns the IPFS hash and local path.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    _validate_upload(file_content, filename, content_type)
    
    # Generate IPFS-like hash
    ipfs_hash = _generate_ipfs_hash(file_content)
    
    # Store with unique name
    ext = os.path.splitext(filename)[1].lower()
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    return {
        "ipfs_hash": ipfs_hash,
        "file_path": stored_name,
        "size_bytes": len(file_content),
        "original_name": filename,
        "storage": "IPFS (Simulated)"
    }


def retrieve_file(file_path: str) -> bytes:
    """Retrieve a file from simulated IPFS"""
    full_path = _safe_upload_path(file_path)
    if not os.path.exists(full_path):
        return None
    with open(full_path, "rb") as f:
        return f.read()


def delete_file(file_path: str) -> bool:
    """Delete a file from simulated IPFS"""
    full_path = _safe_upload_path(file_path)
    if os.path.exists(full_path):
        os.remove(full_path)
        return True
    return False
