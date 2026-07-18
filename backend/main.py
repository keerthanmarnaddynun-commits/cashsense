import sys
import os
# Add current directory to path to resolve database and model imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
from models import Conversation, Message
from ai_client import client
from google.genai import types

# Import modular API routers
from routers.batches import router as batches_router, doc_router
from routers.upload import router as upload_router

# Instantiate a FastAPI application
app = FastAPI(title="CashSense AI Financial Intelligence Engine")

# Apply Base metadata creation on startup event
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

# Apply CORSMiddleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular routers
app.include_router(batches_router)
app.include_router(doc_router)
app.include_router(upload_router)

@app.get("/api/chat/history")
def get_chat_history(batch_id: str, db: Session = Depends(get_db)):
    db_conv = db.query(Conversation).filter(Conversation.batch_id == batch_id).first()
    if not db_conv:
        return []
    messages = db.query(Message).filter(Message.conversation_id == db_conv.id).order_by(Message.timestamp.asc()).all()
    return [{
        "id": str(m.id),
        "role": "user" if m.role == "user" else "assistant",
        "text": m.content,
        "timestamp": m.timestamp.strftime("%I:%M %p")
    } for m in messages]

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

@app.post("/api/chat")
def post_chat(
    request: ChatRequest, 
    batch_id: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    global client
    if client is None:
        raise HTTPException(status_code=500, detail="AI Client not configured.")
    
    # Require batch_id for context isolation
    if not batch_id:
        raise HTTPException(status_code=400, detail="batch_id query parameter is required.")
        
    # 1. Retrieve or generate conversation isolated per batch workspace
    conversation_id = request.conversation_id
    if not conversation_id:
        # Check if an active conversation exists for this batch
        db_conv = db.query(Conversation).filter(Conversation.batch_id == batch_id).first()
        if not db_conv:
            conversation_id = str(uuid.uuid4())
            try:
                db_conv = Conversation(id=conversation_id, batch_id=batch_id)
                db.add(db_conv)
                db.commit()
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")
        else:
            conversation_id = db_conv.id
    else:
        db_conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not db_conv:
            try:
                db_conv = Conversation(id=conversation_id, batch_id=batch_id)
                db.add(db_conv)
                db.commit()
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=400, detail="Invalid conversation/batch association.")
        elif db_conv.batch_id != batch_id:
            raise HTTPException(status_code=400, detail="Conversation does not belong to this batch.")
            
    # 2. History retrieval
    db_messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.timestamp.asc()).all()
    
    # 3. Gemini history formatting
    history = []
    for msg in db_messages:
        history.append({
            "role": msg.role,
            "parts": [{"text": msg.content}]
        })
        
    # Load batch-specific financials context for advisor briefing
    import services.analytics as analytics_service
    batch_analytics = analytics_service.aggregate_batch_analytics(db, batch_id)
    kpis = batch_analytics["kpis"]
    
    business_name = "Workspace Business"
    currency = "INR"
    current_cash = kpis["current_cash"]
    total_receivables = kpis["total_receivables"]
    total_expenses = kpis["total_expenses"]
    net_position = kpis["net_forecast_position"]
    overdue_invoices_json = json.dumps(batch_analytics["invoices"])
    
    context = (
        f"You are a concise financial advisor copilot.\n"
        f"Business Name: {business_name}\n"
        f"Currency: {currency}\n"
        f"Current Cash Balance: {current_cash}\n"
        f"Pending Receivables: {total_receivables}\n"
        f"Monthly Expenses: {total_expenses}\n"
        f"Net Forecast Position: {net_position}\n"
        f"Overdue Invoices: {overdue_invoices_json}\n"
    )
    
    # 4. AI generation with historical chat feed
    try:
        contents = history + [
            {
                "role": "user",
                "parts": [{"text": request.message}]
            }
        ]
        
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=context,
                temperature=0.3
            )
        )
        response_text = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Client Error: {str(e)}")
        
    # 5. Save responses to database
    try:
        user_msg = Message(
            conversation_id=conversation_id,
            batch_id=batch_id,
            role="user",
            content=request.message
        )
        model_msg = Message(
            conversation_id=conversation_id,
            batch_id=batch_id,
            role="model",
            content=response_text
        )
        db.add(user_msg)
        db.add(model_msg)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database record save failed: {str(e)}")
        
    # 6. Return payload
    return {
        "conversation_id": conversation_id,
        "response": response_text
    }
