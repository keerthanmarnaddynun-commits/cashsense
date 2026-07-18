from sqlalchemy.orm import Session
from models import AnalysisBatch

def create_batch(db: Session, name: str) -> AnalysisBatch:
    batch = AnalysisBatch(name=name)
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch

def get_batches(db: Session):
    return db.query(AnalysisBatch).order_by(AnalysisBatch.created_at.desc()).all()

def get_batch(db: Session, batch_id: str) -> AnalysisBatch:
    return db.query(AnalysisBatch).filter(AnalysisBatch.id == batch_id).first()

def delete_batch(db: Session, batch_id: str) -> bool:
    batch = db.query(AnalysisBatch).filter(AnalysisBatch.id == batch_id).first()
    if batch:
        db.delete(batch)
        db.commit()
        return True
    return False
