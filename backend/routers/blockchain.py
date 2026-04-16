"""
MedChain India - Blockchain Router
View blockchain logs and verify records
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.blockchain import BlockchainLog
from services.auth_service import get_current_user
from services.blockchain_service import get_chain_status, verify_record_hash
from models.user import User

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain"])


@router.get("/status")
def chain_status():
    """Get blockchain network status"""
    return get_chain_status()


@router.get("/logs")
def get_logs(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get blockchain logs (filtered by user involvement)"""
    logs = db.query(BlockchainLog).filter(
        (BlockchainLog.actor_id == current_user.id) |
        (BlockchainLog.target_id == current_user.id)
    ).order_by(BlockchainLog.timestamp.desc()).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "tx_hash": log.tx_hash,
                "action_type": log.action_type,
                "data_hash": log.data_hash,
                "block_number": log.block_number,
                "network": log.network,
                "timestamp": log.timestamp.isoformat(),
            }
            for log in logs
        ],
        "total": len(logs)
    }


@router.get("/verify/{record_hash}")
def verify_hash(record_hash: str, db: Session = Depends(get_db)):
    """Verify a record hash on the blockchain"""
    result = verify_record_hash(record_hash, db)
    return result


@router.get("/all-logs")
def get_all_logs(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all blockchain logs (admin view)"""
    logs = db.query(BlockchainLog).order_by(
        BlockchainLog.timestamp.desc()
    ).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "tx_hash": log.tx_hash,
                "action_type": log.action_type,
                "data_hash": log.data_hash[:16] + "..." if log.data_hash else None,
                "actor_id": log.actor_id,
                "target_id": log.target_id,
                "record_id": log.record_id,
                "block_number": log.block_number,
                "network": log.network,
                "timestamp": log.timestamp.isoformat(),
            }
            for log in logs
        ],
        "chain_status": get_chain_status()
    }
