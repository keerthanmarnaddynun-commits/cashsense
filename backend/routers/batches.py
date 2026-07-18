import sys
import os
# Add current directory to path to resolve imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel
import services.batch_service as batch_service
import services.analytics as analytics_service
from models import FinancialSnapshot

router = APIRouter(prefix="/api/batches", tags=["batches"])
doc_router = APIRouter(prefix="/api/documents", tags=["documents"])

class BatchCreate(BaseModel):
    name: str

@router.post("", response_model=None)
def create_batch(request: BatchCreate, db: Session = Depends(get_db)):
    batch = batch_service.create_batch(db, name=request.name)
    return {
        "id": batch.id,
        "name": batch.name,
        "created_at": batch.created_at.isoformat()
    }

@router.get("", response_model=None)
def get_batches(db: Session = Depends(get_db)):
    batches = batch_service.get_batches(db)
    return [{
        "id": b.id,
        "name": b.name,
        "created_at": b.created_at.isoformat()
    } for b in batches]

@router.get("/{batch_id}", response_model=None)
def get_batch(batch_id: str, db: Session = Depends(get_db)):
    batch = batch_service.get_batch(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch workspace not found.")
    return {
        "id": batch.id,
        "name": batch.name,
        "created_at": batch.created_at.isoformat()
    }

@router.delete("/{batch_id}")
def delete_batch(batch_id: str, db: Session = Depends(get_db)):
    success = batch_service.delete_batch(db, batch_id)
    if not success:
        raise HTTPException(status_code=404, detail="Batch workspace not found.")
    return {"message": "Workspace deleted successfully."}

@router.get("/{batch_id}/analytics")
def get_batch_analytics(batch_id: str, db: Session = Depends(get_db)):
    batch = batch_service.get_batch(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch workspace not found.")
    return analytics_service.aggregate_batch_analytics(db, batch_id)

@router.get("/{batch_id}/documents")
def get_batch_documents(batch_id: str, db: Session = Depends(get_db)):
    batch = batch_service.get_batch(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch workspace not found.")
    docs = db.query(FinancialSnapshot).filter(FinancialSnapshot.batch_id == batch_id).order_by(FinancialSnapshot.created_at.desc()).all()
    return [{
        "id": d.id,
        "filename": d.filename or "Unnamed Document",
        "file_type": d.file_type or "Unknown",
        "created_at": d.created_at.isoformat(),
        "status": d.status
    } for d in docs]

@doc_router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(FinancialSnapshot).filter(FinancialSnapshot.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    try:
        db.delete(doc)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
    return {"message": "Document deleted successfully."}
