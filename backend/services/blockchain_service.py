"""
MedChain India - Blockchain Service (Mock)
Simulates a Polygon blockchain for storing record hashes and access logs
"""
import hashlib
import json
import time
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models.blockchain import BlockchainLog


# In-memory mock blockchain state
_block_counter = 0
_chain = []


def _generate_tx_hash(data: str) -> str:
    """Generate a realistic-looking transaction hash"""
    raw = f"{data}-{time.time()}-{uuid.uuid4()}"
    return "0x" + hashlib.sha256(raw.encode()).hexdigest()


def _generate_data_hash(data: dict) -> str:
    """Generate a hash of the data being stored"""
    serialized = json.dumps(data, sort_keys=True)
    return hashlib.sha256(serialized.encode()).hexdigest()


def _next_block() -> int:
    """Get next mock block number"""
    global _block_counter
    _block_counter += 1
    return _block_counter


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
    block_number = _next_block()
    
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
    
    # Also append to in-memory chain
    _chain.append({
        "block": block_number,
        "tx_hash": tx_hash,
        "data_hash": data_hash,
        "action": action_type,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return log_entry


def get_chain_status() -> dict:
    """Get mock blockchain status"""
    return {
        "network": "Polygon Mumbai (Mock)",
        "total_blocks": _block_counter,
        "total_transactions": len(_chain),
        "last_block": _chain[-1] if _chain else None,
        "chain_valid": True,
        "consensus": "Proof of Stake (Mock)"
    }


def verify_record_hash(record_hash: str, db: Session) -> dict:
    """Verify a record hash exists on the blockchain"""
    log = db.query(BlockchainLog).filter(
        BlockchainLog.data_hash == record_hash
    ).first()
    
    if log:
        return {
            "verified": True,
            "tx_hash": log.tx_hash,
            "block_number": log.block_number,
            "timestamp": log.timestamp.isoformat()
        }
    return {"verified": False}
