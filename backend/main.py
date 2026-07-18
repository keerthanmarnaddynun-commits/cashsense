import json
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from database import engine, Base, get_db, Conversation, Message, save_financial_snapshot

# Invoke load_dotenv immediately after imports
load_dotenv()

# Instantiate a FastAPI application
app = FastAPI()

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

# Instantiate the Google GenAI client globally
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Look for it under generic variant names just in case
    api_key = os.getenv("GOOGLE_API_KEY")

if api_key:
    try:
        client = genai.Client(api_key=api_key)
        print("Google GenAI Client initialized successfully.")
    except Exception as e:
        client = None
else:
    client = None


def load_financial_data():
    try:
        with open("mock_data.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            with open(os.path.join(base_dir, "mock_data.json"), "r") as f:
                return json.load(f)
        except FileNotFoundError:
            raise HTTPException(status_code=500, detail="Mock data file missing.")

def calculate_metrics(data):
    current_cash = data["business_info"]["current_cash_balance"]
    total_receivables = 0
    at_risk_amount = 0
    overdue_invoices = []
    
    current_date = datetime(2026, 7, 1)
    
    for inv in data.get("invoices", []):
        if inv.get("status") == "Pending":
            total_receivables += inv.get("amount", 0)
        
        due_date_str = inv.get("due_date")
        due_date_dt = datetime.strptime(due_date_str, "%Y-%m-%d")
        
        historical_behavior = inv.get("historical_payment_behavior", "")
        if due_date_dt < current_date or "Chronically late" in historical_behavior:
            at_risk_amount += inv.get("amount", 0)
            overdue_invoices.append(inv)
            
    total_expenses = sum(exp.get("amount", 0) for exp in data.get("monthly_expenses", []))
    net_position = current_cash + total_receivables - total_expenses
    
    return {
        "current_cash": current_cash,
        "total_receivables": total_receivables,
        "total_expenses": total_expenses,
        "at_risk_amount": at_risk_amount,
        "net_forecast_position": net_position,
        "overdue_invoices": overdue_invoices
    }

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

@app.get("/api/financials")
def get_financials():
    data = load_financial_data()
    metrics = calculate_metrics(data)
    return metrics

@app.post("/api/chat")
def post_chat(request: ChatRequest, db: Session = Depends(get_db)):
    global client
    if client is None:
        raise HTTPException(status_code=500, detail="AI Client not configured.")
    
    # 1. Retrieve or generate conversation
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        try:
            db_conv = Conversation(id=conversation_id)
            db.add(db_conv)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")
    else:
        # Validate existence of conversation
        db_conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not db_conv:
            raise HTTPException(status_code=400, detail="Invalid conversation ID provided.")
            
    # 2. History retrieval
    db_messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.timestamp.asc()).all()
    
    # 3. Gemini history formatting
    history = []
    for msg in db_messages:
        history.append({
            "role": msg.role,
            "parts": [{"text": msg.content}]
        })
        
    # Load business financials context
    try:
        data = load_financial_data()
        metrics = calculate_metrics(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load business financial data: {str(e)}")
    
    business_name = data.get("business_info", {}).get("name", "N/A")
    currency = data.get("business_info", {}).get("currency", "N/A")
    current_cash = metrics["current_cash"]
    total_receivables = metrics["total_receivables"]
    total_expenses = metrics["total_expenses"]
    at_risk_amount = metrics["at_risk_amount"]
    net_position = metrics["net_forecast_position"]
    overdue_invoices_json = json.dumps(metrics["overdue_invoices"])
    
    context = (
        f"You are a concise financial advisor copilot.\n"
        f"Business Name: {business_name}\n"
        f"Currency: {currency}\n"
        f"Current Cash Balance: {current_cash}\n"
        f"Pending Receivables: {total_receivables}\n"
        f"Monthly Expenses: {total_expenses}\n"
        f"At-Risk Amount: {at_risk_amount}\n"
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
            role="user",
            content=request.message
        )
        model_msg = Message(
            conversation_id=conversation_id,
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


