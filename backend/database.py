import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), 'fraud_detection.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TransactionRecord(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    step = Column(Integer, default=1)
    type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    nameOrig = Column(String, nullable=False)
    oldbalanceOrg = Column(Float, nullable=False)
    newbalanceOrig = Column(Float, nullable=False)
    nameDest = Column(String, nullable=False)
    oldbalanceDest = Column(Float, nullable=False)
    newbalanceDest = Column(Float, nullable=False)
    account_age_days = Column(Integer, default=100)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    is_flagged = Column(Boolean, default=False)
    explanations_json = Column(Text, nullable=False) # JSON array of sentences
    shap_breakdown_json = Column(Text, nullable=False) # JSON array of feature contributions

class ScamCallRecord(Base):
    __tablename__ = "scam_calls"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    caller_identity = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    duration_sec = Column(Integer, default=60)
    transcript = Column(Text, nullable=False)
    scam_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    is_scam = Column(Boolean, default=False)
    primary_reason = Column(String, nullable=False)
    reasons_json = Column(Text, nullable=False)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
