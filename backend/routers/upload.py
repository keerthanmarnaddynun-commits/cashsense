import io
import json
import sys
import os
# Add current directory to path to resolve imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel, Field
from typing import Optional, List
from parsers import extract_text_from_pdf, extract_data_from_csv
from models import FinancialSnapshot, AnalysisBatch
from ai_client import client
from google.genai import types
import services.analytics as analytics_service

router = APIRouter(prefix="/api", tags=["upload"])

# 1. Pydantic Models for Schema Validation
class InvoiceItem(BaseModel):
    invoice_id: str = Field(description="Unique ID of the invoice, e.g., INV-2026-003")
    client_name: str = Field(description="Name of the client")
    amount: float = Field(description="Invoice amount value")
    due_date: str = Field(description="Due date formatted as YYYY-MM-DD")
    status: str = Field(description="Status of the invoice, e.g., Pending, Paid")
    historical_payment_behavior: str = Field(description="Detailed payment behavior history of the client")

class BusinessProfile(BaseModel):
    name: Optional[str] = Field(None, description="Name of the business")

class Liquidity(BaseModel):
    current_cash: Optional[float] = Field(None, description="Current available cash balance")

class Receivables(BaseModel):
    total_receivables: Optional[float] = Field(None, description="Total amount of pending receivables")
    at_risk_amount: Optional[float] = Field(None, description="Total amount of receivables considered at risk")

class Payables(BaseModel):
    total_payables: Optional[float] = Field(None, description="Total payables balance")

class Expenses(BaseModel):
    total_expenses: Optional[float] = Field(None, description="Total monthly operating expenses")

class Revenue(BaseModel):
    total_revenue: Optional[float] = Field(None, description="Total monthly revenue")

class ForecastInputs(BaseModel):
    projected_cash_inflow: Optional[float] = Field(None, description="Projected short-term cash inflow")
    projected_cash_outflow: Optional[float] = Field(None, description="Projected short-term cash outflow")

class FinancialAnalysis(BaseModel):
    document_type: str = Field(description="Classification of the document. Must be one of: Bank Statement, Invoice, GST Report, Payroll Report, Expense Ledger, Unknown")
    business_profile: BusinessProfile
    liquidity: Liquidity
    receivables: Receivables
    payables: Payables
    expenses: Expenses
    revenue: Revenue
    forecast_inputs: ForecastInputs
    risk_signals: List[str] = Field(description="List of risk warning indicators or explanations of data discrepancies")
    confidence_score: float = Field(description="Reliability rating score between 0.0 and 1.0")
    overdue_invoices: List[InvoiceItem] = Field(description="List of extracted overdue invoices")
    executive_briefing: str = Field(description="Short CFO-style executive summary highlighting cash position, risks, and recommended actions")


# 2. Gemini Prompts & Configurations
SYSTEM_INSTRUCTION = (
    "You are a senior AI financial analyzer. Analyze the provided financial statement text and classify it.\n"
    "Document classification categories: 'Bank Statement', 'Invoice', 'GST Report', 'Payroll Report', 'Expense Ledger', 'Unknown'.\n"
    "Output a single valid JSON object matching this schema precisely:\n"
    "{\n"
    "  \"document_type\": \"Bank Statement\" | \"Invoice\" | \"GST Report\" | \"Payroll Report\" | \"Expense Ledger\" | \"Unknown\",\n"
    "  \"business_profile\": {\n"
    "    \"name\": string\n"
    "  },\n"
    "  \"liquidity\": {\n"
    "    \"current_cash\": number or null\n"
    "  },\n"
    "  \"receivables\": {\n"
    "    \"total_receivables\": number or null,\n"
    "    \"at_risk_amount\": number or null\n"
    "  },\n"
    "  \"payables\": {\n"
    "    \"total_payables\": number or null\n"
    "  },\n"
    "  \"expenses\": {\n"
    "    \"total_expenses\": number or null\n"
    "  },\n"
    "  \"revenue\": {\n"
    "    \"total_revenue\": number or null\n"
    "  },\n"
    "  \"forecast_inputs\": {\n"
    "    \"projected_cash_inflow\": number or null,\n"
    "    \"projected_cash_outflow\": number or null\n"
    "  },\n"
    "  \"risk_signals\": [string],\n"
    "  \"confidence_score\": number,\n"
    "  \"overdue_invoices\": [\n"
    "    {\n"
    "      \"invoice_id\": string,\n"
    "      \"client_name\": string,\n"
    "      \"amount\": number,\n"
    "      \"due_date\": string,\n"
    "      \"status\": string,\n"
    "      \"historical_payment_behavior\": string\n"
    "    }\n"
    "  ],\n"
    "  \"executive_briefing\": string\n"
    "}\n\n"
    "CRITICAL RULES:\n"
    "1. If the document contains no usable financial metrics or transactions (zero-state handling), set all numeric values inside sub-objects to null (or 0), document_type to 'Unknown', confidence_score to 0.0, and add a string to risk_signals explaining that no financial data was detected.\n"
    "2. Generate a short CFO-style executive briefing in the 'executive_briefing' field.\n"
    "3. Output only valid JSON. Do not include markdown wraps or backticks."
)


# Helper function to trigger Gemini structured extraction
def analyze_text_with_gemini(text: str) -> dict:
    if client is None:
        raise Exception("AI Client not configured.")
    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=f"Extracted document text:\n{text}",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.1,
                response_mime_type="application/json",
                response_schema=FinancialAnalysis
            )
        )
        
        # Clean response string of backticks
        text_response = response.text.strip()
        if text_response.startswith("```"):
            lines = text_response.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text_response = "\n".join(lines).strip()
            
        return json.loads(text_response)
    except Exception as e:
        raise Exception(f"AI synthesis failed: {str(e)}")


@router.post("/upload")
async def upload_file(
    batch_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify batch exists
    batch = db.query(AnalysisBatch).filter(AnalysisBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch workspace not found.")
        
    filename = file.filename or ""
    
    # 1. Extract raw text from file
    if filename.endswith(".pdf"):
        try:
            file_bytes = await file.read()
            extracted_text = extract_text_from_pdf(file_bytes)
            if not extracted_text or extracted_text.startswith("Error parsing PDF"):
                raise Exception("Corrupted or invalid PDF content.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Corrupted or invalid PDF file: {str(e)}")
            
    elif filename.endswith(".csv"):
        try:
            file_bytes = await file.read()
            import pandas as pd
            df = pd.read_csv(io.BytesIO(file_bytes))
            if df.empty:
                raise Exception("CSV is empty.")
            extracted_text = df.to_string()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Empty or invalid CSV file: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or CSV.")
        
    # 2. Invoke Gemini Financial Extraction
    try:
        parsed_json = analyze_text_with_gemini(extracted_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # 3. Persist Snapshot
    try:
        db_snapshot = FinancialSnapshot(
            batch_id=batch_id,
            filename=filename,
            file_type=parsed_json.get("document_type", "Unknown"),
            status="Processed",
            raw_text=extracted_text,
            raw_data_json=json.dumps(parsed_json)
        )
        db.add(db_snapshot)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database snapshot save failed: {str(e)}")
        
    # 4. Return updated aggregated batch analytics
    return analytics_service.aggregate_batch_analytics(db, batch_id)


@router.post("/documents/{document_id}/reprocess")
def reprocess_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(FinancialSnapshot).filter(FinancialSnapshot.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    if not doc.raw_text:
        raise HTTPException(status_code=400, detail="Document raw text cache is unavailable. Reprocessing blocked.")
        
    # 1. Re-run Gemini on cached raw text
    try:
        parsed_json = analyze_text_with_gemini(doc.raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # 2. Update Database Record
    try:
        doc.raw_data_json = json.dumps(parsed_json)
        doc.file_type = parsed_json.get("document_type", "Unknown")
        doc.status = "Processed"
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")
        
    # 3. Return updated batch analytics
    return analytics_service.aggregate_batch_analytics(db, doc.batch_id)
