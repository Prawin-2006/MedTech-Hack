"""
MedChain India - Blockchain Service (Mock)
Simulates a Polygon blockchain for storing record hashes and access logs
"""
import hashlib
import json
import time
import uuid
from datetime import datetime, timezone
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from models.blockchain import BlockchainLog


def _generate_tx_hash(data: str) -> str:
    """Generate a realistic-looking transaction hash"""
    raw = f"{data}-{time.time()}-{uuid.uuid4()}"
    return "0x" + hashlib.sha256(raw.encode()).hexdigest()


def _generate_data_hash(data: dict) -> str:
    """Generate a hash of the data being stored"""
    serialized = json.dumps(data, sort_keys=True)
    return hashlib.sha256(serialized.encode()).hexdigest()


def _next_block_number(db: Session) -> int:
    current_max = db.query(func.max(BlockchainLog.block_number)).scalar() or 0
    return current_max + 1


def log_to_blockchain(
    db: Session,
    action_type: str,
    actor_id: int = None,
    target_id: int = None,
    record_id: int = None,
    metadata: dict = None
) -> BlockchainLog:
    """
    Log an action to the mock blockchain.
    Actions: record_upload, record_view, access_grant, access_revoke,
             emergency_access, trusted_add, trusted_remove
    """
    data_hash = _generate_data_hash({
        "action": action_type,
        "actor": actor_id,
        "target": target_id,
        "record": record_id,
        "metadata": metadata or {},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    tx_hash = _generate_tx_hash(data_hash)
    block_number = _next_block_number(db)

    log_entry = BlockchainLog(
        tx_hash=tx_hash,
        action_type=action_type,
        data_hash=data_hash,
        actor_id=actor_id,
        target_id=target_id,
        record_id=record_id,
        metadata_json=json.dumps(metadata) if metadata else None,
        block_number=block_number,
        network="polygon-mock"
    )

    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return log_entry


def get_chain_status(db: Session) -> dict:
    """Get mock blockchain status"""
    total_transactions = db.query(BlockchainLog).count()
    last_log = db.query(BlockchainLog).order_by(
        BlockchainLog.block_number.desc(),
        BlockchainLog.timestamp.desc()
    ).first()

    total_blocks = last_log.block_number if last_log else 0
    last_block = None
    if last_log:
        last_block = {
            "block": last_log.block_number,
            "tx_hash": last_log.tx_hash,
            "data_hash": last_log.data_hash,
            "action": last_log.action_type,
            "timestamp": last_log.timestamp.isoformat()
        }

    return {
        "network": "Polygon Mumbai (Mock)",
        "total_blocks": total_blocks,
        "total_transactions": total_transactions,
        "last_block": last_block,
        "chain_valid": True,
        "consensus": "Proof of Stake (Mock)"
    }


def verify_record_hash(record_hash: str, db: Session) -> dict:
    """Verify a record hash or transaction hash exists on the blockchain"""
    log = db.query(BlockchainLog).filter(
        or_(
            BlockchainLog.data_hash == record_hash,
            BlockchainLog.tx_hash == record_hash
        )
    ).first()

    if log:
        return {
            "verified": True,
            "tx_hash": log.tx_hash,
            "block_number": log.block_number,
            "timestamp": log.timestamp.isoformat()
        }
    return {"verified": False}
