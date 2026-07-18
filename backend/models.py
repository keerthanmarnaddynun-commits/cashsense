import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class AnalysisBatch(Base):
    __tablename__ = "analysis_batches"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Cascade relationships on delete
    financial_snapshots = relationship("FinancialSnapshot", back_populates="batch", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="batch", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="batch", cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, index=True)
    batch_id = Column(String, ForeignKey("analysis_batches.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    batch = relationship("AnalysisBatch", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(String, ForeignKey("analysis_batches.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)  # "user" or "model"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")
    batch = relationship("AnalysisBatch", back_populates="messages")

class FinancialSnapshot(Base):
    __tablename__ = "financial_snapshots"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    batch_id = Column(String, ForeignKey("analysis_batches.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=True)
    file_type = Column(String, nullable=True)  # "Bank Statement", "Invoice", etc.
    status = Column(String, default="Processed")
    raw_text = Column(Text, nullable=True)
    raw_data_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    batch = relationship("AnalysisBatch", back_populates="financial_snapshots")
