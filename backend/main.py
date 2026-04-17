"""
MedChain India - Main Application
Blockchain-based Healthcare Record System for India
FastAPI Backend Server
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config import CORS_ORIGINS, UPLOAD_DIR, EXPOSE_UPLOADS
from database import init_db

# Import routers
from routers import auth, patients, doctors, trusted, emergency, blockchain, ai

# Initialize FastAPI app
app = FastAPI(
    title="MedChain India API",
    description="Blockchain-based Healthcare Record System for India",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads only when explicitly enabled.
if EXPOSE_UPLOADS:
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(trusted.router)
app.include_router(emergency.router)
app.include_router(blockchain.router)
app.include_router(ai.router)


@app.get("/health", tags=["Health"])
async def health_check_public():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "MedChain India API",
        "version": "1.0.0"
    }


@app.on_event("startup")
def on_startup():
    """Initialize database on startup"""
    init_db()
    print("🏥 MedChain India API started successfully!")
    print("📖 API docs: http://localhost:8000/api/docs")


@app.get("/")
def root():
    return {
        "name": "MedChain India API",
        "version": "1.0.0",
        "description": "Blockchain-based Healthcare Record System",
        "docs": "/api/docs",
        "endpoints": {
            "auth": "/api/auth",
            "patients": "/api/patients",
            "doctors": "/api/doctors",
            "trusted": "/api/trusted",
            "emergency": "/api/emergency",
            "blockchain": "/api/blockchain",
            "ai": "/api/ai",
        }
    }


@app.get("/api/health")
def health_check_api():
    return {"status": "healthy", "service": "MedChain India"}
