"""
MedChain India - Database Setup
SQLAlchemy database engine and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

# Create engine - use check_same_thread=False for SQLite
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    from models.user import User
    from models.record import MedicalRecord
    from models.access import AccessGrant, TrustedPerson, EmergencyQR
    from models.blockchain import BlockchainLog
    Base.metadata.create_all(bind=engine)
