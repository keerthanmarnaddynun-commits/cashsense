from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from typing import Generator

DATABASE_URL = "sqlite:///./cashsense.db"

# Create SQLAlchemy engine with sqlite check_same_thread disabled for multi-threading in FastAPI
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)  # UUID string
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    financial_snapshots = relationship("FinancialSnapshot", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" or "model"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class FinancialSnapshot(Base):
    __tablename__ = "financial_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    raw_data_json = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="financial_snapshots")

# Dependency injection for DB session helper
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_financial_snapshot(conversation_id: str, raw_data: dict) -> None:
    import json
    db = SessionLocal()
    try:
        # Check if conversation exists, create if not
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            conv = Conversation(id=conversation_id)
            db.add(conv)
            db.commit()
        
        snapshot = FinancialSnapshot(
            conversation_id=conversation_id,
            raw_data_json=json.dumps(raw_data)
        )
        db.add(snapshot)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

