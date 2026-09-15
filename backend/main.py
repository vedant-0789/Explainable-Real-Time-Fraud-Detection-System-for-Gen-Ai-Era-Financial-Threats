import os
import json
import uuid
import joblib
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import init_db, get_db, TransactionRecord, ScamCallRecord
from dataset_generator import feature_engineering, FEATURE_COLUMNS
from shap_explainer import SHAPExplanationEngine
from scam_call_detector import ScamCallDetector
from train_model import train_and_save_pipeline

app = FastAPI(
    title="Explainable Real-Time Fraud Detection System API",
    description="GenAI-Era Financial Fraud Detection API combining XGBoost + SHAP TreeExplainer with Scam Call Analysis",
    version="1.0.0"
)

# Allow CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model & explainer
MODEL = None
EXPLAINER = None
SHAP_ENGINE = None
SCAM_DETECTOR = ScamCallDetector()

# Pydantic Input/Output Schemas
class TransactionInput(BaseModel):
    step: int = Field(default=3, description="Hour of transaction (1-744)")
    type: str = Field(default="TRANSFER", description="TRANSFER, CASH_OUT, PAYMENT, CASH_IN, DEBIT")
    amount: float = Field(default=500000.0, description="Transaction amount")
    nameOrig: str = Field(default="C987654321", description="Sender Account ID")
    oldbalanceOrg: float = Field(default=500000.0, description="Sender balance prior to transaction")
    newbalanceOrig: float = Field(default=0.0, description="Sender balance after transaction")
    nameDest: str = Field(default="C123456789", description="Recipient Account ID")
    oldbalanceDest: float = Field(default=0.0, description="Recipient balance prior to transaction")
    newbalanceDest: float = Field(default=0.0, description="Recipient balance after transaction")
    account_age_days: int = Field(default=14, description="Sender account age in days")

class CallInput(BaseModel):
    caller_identity: str = Field(default="HDFC Fraud Alert Desk", description="Claimed identity of caller")
    phone_number: str = Field(default="+91-9876543210", description="Caller phone number")
    duration_sec: int = Field(default=120, description="Call duration in seconds")
    transcript: str = Field(
        default="URGENT: This is Bank Security. Your account has been compromised. Share your 6-digit OTP immediately to halt transaction.",
        description="Recorded or transcribed call speech content"
    )

@app.on_event("startup")
def startup_event():
    global MODEL, EXPLAINER, SHAP_ENGINE
    init_db()
    
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    model_path = os.path.join(models_dir, 'xgb_fraud_model.joblib')
    explainer_path = os.path.join(models_dir, 'shap_explainer.joblib')
    
    if not os.path.exists(model_path) or not os.path.exists(explainer_path):
        print("[!] Model or explainer artifacts not found. Training model now...")
        MODEL, EXPLAINER = train_and_save_pipeline()
    else:
        print("[+] Loading pre-trained XGBoost model and SHAP TreeExplainer...")
        MODEL = joblib.load(model_path)
        EXPLAINER = joblib.load(explainer_path)
        
    SHAP_ENGINE = SHAPExplanationEngine(EXPLAINER)
    
    # Seed initial demo data into DB if empty
    db = next(get_db())
    seed_demo_data_if_empty(db)
    db.close()

def seed_demo_data_if_empty(db: Session):
    txn_count = db.query(TransactionRecord).count()
    if txn_count == 0:
        print("[+] Seeding initial sample database records...")
        sample_txns = [
            TransactionInput(step=3, type="TRANSFER", amount=850000.0, nameOrig="C1029384", oldbalanceOrg=850000.0, newbalanceOrig=0.0, nameDest="C998877", oldbalanceDest=0.0, newbalanceDest=0.0, account_age_days=8),
            TransactionInput(step=14, type="PAYMENT", amount=45.99, nameOrig="C8847392", oldbalanceOrg=2450.0, newbalanceOrig=2404.01, nameDest="M992837", oldbalanceDest=10000.0, newbalanceDest=10045.99, account_age_days=450),
            TransactionInput(step=2, type="CASH_OUT", amount=320000.0, nameOrig="C445566", oldbalanceOrg=325000.0, newbalanceOrig=5000.0, nameDest="C778899", oldbalanceDest=120.0, newbalanceDest=120.0, account_age_days=15),
            TransactionInput(step=11, type="CASH_IN", amount=1500.0, nameOrig="C112233", oldbalanceOrg=300.0, newbalanceOrig=1800.0, nameDest="C990011", oldbalanceDest=5000.0, newbalanceDest=3500.0, account_age_days=310),
            TransactionInput(step=4, type="TRANSFER", amount=1200000.0, nameOrig="C771122", oldbalanceOrg=1200000.0, newbalanceOrig=0.0, nameDest="C334455", oldbalanceDest=0.0, newbalanceDest=0.0, account_age_days=4)
        ]
        
        now = datetime.utcnow()
        for idx, t_input in enumerate(sample_txns):
            # Format single row for prediction
            raw_dict = t_input.dict()
            df_single = pd.DataFrame([raw_dict])
            feat_df = feature_engineering(df_single)
            X_single = feat_df[FEATURE_COLUMNS]
            
            prob = float(MODEL.predict_proba(X_single)[0, 1])
            shap_res = SHAP_ENGINE.explain_transaction(X_single, raw_dict, prob)
            
            rec = TransactionRecord(
                id=f"TXN-{1000 + idx}",
                timestamp=now - timedelta(minutes=(5 - idx) * 35),
                step=t_input.step,
                type=t_input.type,
                amount=t_input.amount,
                nameOrig=t_input.nameOrig,
                oldbalanceOrg=t_input.oldbalanceOrg,
                newbalanceOrig=t_input.newbalanceOrig,
                nameDest=t_input.nameDest,
                oldbalanceDest=t_input.oldbalanceDest,
                newbalanceDest=t_input.newbalanceDest,
                account_age_days=t_input.account_age_days,
                risk_score=shap_res['risk_score'],
                risk_level=shap_res['risk_level'],
                is_flagged=shap_res['risk_score'] >= 0.50,
                explanations_json=json.dumps(shap_res['explanations']),
                shap_breakdown_json=json.dumps(shap_res['shap_breakdown'])
            )
            db.add(rec)
            
        sample_calls = [
            CallInput(caller_identity="Bank Security Officer", phone_number="+91-9876501234", duration_sec=140, transcript="Urgent: Your account card has been suspended due to illegal transaction attempt. Please verify your identity by providing your 6-digit OTP code immediately."),
            CallInput(caller_identity="Friend Support", phone_number="+91-9820011223", duration_sec=45, transcript="Hey, I'm reaching out to check if we are meeting for lunch today at 1 PM."),
            CallInput(caller_identity="IRS Tax Clearance", phone_number="+1-800-555-0199", duration_sec=210, transcript="This is an urgent legal notice from Tax Inspection. An arrest warrant has been issued unless you execute an instant wire transfer to clear outstanding fees.")
        ]
        
        for idx, c_input in enumerate(sample_calls):
            res = SCAM_DETECTOR.evaluate_call(
                c_input.caller_identity, c_input.phone_number, c_input.duration_sec, c_input.transcript
            )
            c_rec = ScamCallRecord(
                id=f"CALL-{500 + idx}",
                timestamp=now - timedelta(minutes=(3 - idx) * 50),
                caller_identity=c_input.caller_identity,
                phone_number=c_input.phone_number,
                duration_sec=c_input.duration_sec,
                transcript=c_input.transcript,
                scam_score=res['scam_score'],
                risk_level=res['risk_level'],
                is_scam=res['is_scam'],
                primary_reason=res['primary_reason'],
                reasons_json=json.dumps(res['all_reasons'])
            )
            db.add(c_rec)
            
        db.commit()
        print("[+] Demo records seeded successfully.")

# API Routes
@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Explainable Real-Time Fraud Detection System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.post("/transactions/score")
def score_transaction(data: TransactionInput, db: Session = Depends(get_db)):
    """
    Accepts raw transaction data, computes XGBoost fraud probability score,
    generates SHAP feature explanations, saves record to SQLite, and returns detailed result.
    """
    if MODEL is None or SHAP_ENGINE is None:
        raise HTTPException(status_code=500, detail="ML Model or SHAP explainer not initialized.")
        
    raw_dict = data.dict()
    df_single = pd.DataFrame([raw_dict])
    feat_df = feature_engineering(df_single)
    X_single = feat_df[FEATURE_COLUMNS]
    
    prob = float(MODEL.predict_proba(X_single)[0, 1])
    shap_res = SHAP_ENGINE.explain_transaction(X_single, raw_dict, prob)
    
    txn_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
    rec = TransactionRecord(
        id=txn_id,
        timestamp=datetime.utcnow(),
        step=data.step,
        type=data.type,
        amount=data.amount,
        nameOrig=data.nameOrig,
        oldbalanceOrg=data.oldbalanceOrg,
        newbalanceOrig=data.newbalanceOrig,
        nameDest=data.nameDest,
        oldbalanceDest=data.oldbalanceDest,
        newbalanceDest=data.newbalanceDest,
        account_age_days=data.account_age_days,
        risk_score=shap_res['risk_score'],
        risk_level=shap_res['risk_level'],
        is_flagged=shap_res['risk_score'] >= 0.50,
        explanations_json=json.dumps(shap_res['explanations']),
        shap_breakdown_json=json.dumps(shap_res['shap_breakdown'])
    )
    
    db.add(rec)
    db.commit()
    db.refresh(rec)
    
    return {
        "id": rec.id,
        "timestamp": rec.timestamp.isoformat(),
        "amount": rec.amount,
        "type": rec.type,
        "risk_score": rec.risk_score,
        "risk_level": rec.risk_level,
        "is_flagged": rec.is_flagged,
        "explanations": shap_res['explanations'],
        "shap_breakdown": shap_res['shap_breakdown']
    }

@app.get("/transactions/{id}/explanation")
def get_transaction_explanation(id: str, db: Session = Depends(get_db)):
    """
    Returns full SHAP feature attribution explanation for a specific stored transaction.
    """
    rec = db.query(TransactionRecord).filter(TransactionRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail=f"Transaction '{id}' not found.")
        
    return {
        "id": rec.id,
        "timestamp": rec.timestamp.isoformat(),
        "amount": rec.amount,
        "type": rec.type,
        "risk_score": rec.risk_score,
        "risk_level": rec.risk_level,
        "is_flagged": rec.is_flagged,
        "explanations": json.loads(rec.explanations_json),
        "shap_breakdown": json.loads(rec.shap_breakdown_json),
        "transaction_details": {
            "nameOrig": rec.nameOrig,
            "oldbalanceOrg": rec.oldbalanceOrg,
            "newbalanceOrig": rec.newbalanceOrig,
            "nameDest": rec.nameDest,
            "oldbalanceDest": rec.oldbalanceDest,
            "newbalanceDest": rec.newbalanceDest,
            "account_age_days": rec.account_age_days,
            "step": rec.step
        }
    }

@app.get("/transactions")
def list_transactions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    flagged_only: bool = Query(default=False),
    db: Session = Depends(get_db)
):
    """
    Returns a paginated list of scored transactions.
    """
    query = db.query(TransactionRecord)
    if flagged_only:
        query = query.filter(TransactionRecord.is_flagged == True)
        
    total = query.count()
    records = query.order_by(TransactionRecord.timestamp.desc()).offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for r in records:
        result.append({
            "id": r.id,
            "timestamp": r.timestamp.isoformat(),
            "type": r.type,
            "amount": r.amount,
            "nameOrig": r.nameOrig,
            "nameDest": r.nameDest,
            "risk_score": r.risk_score,
            "risk_level": r.risk_level,
            "is_flagged": r.is_flagged,
            "explanations": json.loads(r.explanations_json),
            "shap_breakdown": json.loads(r.shap_breakdown_json)
        })
        
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "transactions": result
    }

@app.post("/calls/score")
def score_call(data: CallInput, db: Session = Depends(get_db)):
    """
    Accepts voice call metadata & transcript, evaluates scam likelihood using NLP heuristics,
    saves record to database, and returns scam score + explanation reasons.
    """
    res = SCAM_DETECTOR.evaluate_call(
        data.caller_identity, data.phone_number, data.duration_sec, data.transcript
    )
    
    call_id = f"CALL-{uuid.uuid4().hex[:8].upper()}"
    c_rec = ScamCallRecord(
        id=call_id,
        timestamp=datetime.utcnow(),
        caller_identity=data.caller_identity,
        phone_number=data.phone_number,
        duration_sec=data.duration_sec,
        transcript=data.transcript,
        scam_score=res['scam_score'],
        risk_level=res['risk_level'],
        is_scam=res['is_scam'],
        primary_reason=res['primary_reason'],
        reasons_json=json.dumps(res['all_reasons'])
    )
    
    db.add(c_rec)
    db.commit()
    db.refresh(c_rec)
    
    return {
        "id": c_rec.id,
        "timestamp": c_rec.timestamp.isoformat(),
        "caller_identity": c_rec.caller_identity,
        "phone_number": c_rec.phone_number,
        "scam_score": c_rec.scam_score,
        "risk_level": c_rec.risk_level,
        "is_scam": c_rec.is_scam,
        "primary_reason": c_rec.primary_reason,
        "all_reasons": res['all_reasons']
    }

@app.get("/calls")
def list_calls(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    scams_only: bool = Query(default=False),
    db: Session = Depends(get_db)
):
    query = db.query(ScamCallRecord)
    if scams_only:
        query = query.filter(ScamCallRecord.is_scam == True)
        
    total = query.count()
    records = query.order_by(ScamCallRecord.timestamp.desc()).offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for c in records:
        result.append({
            "id": c.id,
            "timestamp": c.timestamp.isoformat(),
            "caller_identity": c.caller_identity,
            "phone_number": c.phone_number,
            "duration_sec": c.duration_sec,
            "transcript": c.transcript,
            "scam_score": c.scam_score,
            "risk_level": c.risk_level,
            "is_scam": c.is_scam,
            "primary_reason": c.primary_reason,
            "all_reasons": json.loads(c.reasons_json)
        })
        
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "calls": result
    }

@app.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns aggregate stats for the unified dashboard.
    """
    total_txns = db.query(TransactionRecord).count()
    flagged_txns = db.query(TransactionRecord).filter(TransactionRecord.is_flagged == True).count()
    
    total_calls = db.query(ScamCallRecord).count()
    flagged_scam_calls = db.query(ScamCallRecord).filter(ScamCallRecord.is_scam == True).count()
    
    # Calculate high risk percentage
    high_risk_txns = db.query(TransactionRecord).filter(TransactionRecord.risk_level == "HIGH").count()
    med_risk_txns = db.query(TransactionRecord).filter(TransactionRecord.risk_level == "MEDIUM").count()
    low_risk_txns = db.query(TransactionRecord).filter(TransactionRecord.risk_level == "LOW").count()
    
    # Recent high risk transactions
    recent_flagged = db.query(TransactionRecord).filter(TransactionRecord.is_flagged == True).order_by(TransactionRecord.timestamp.desc()).limit(5).all()
    
    recent_flagged_list = []
    for r in recent_flagged:
        recent_flagged_list.append({
            "id": r.id,
            "amount": r.amount,
            "type": r.type,
            "risk_score": r.risk_score,
            "timestamp": r.timestamp.isoformat(),
            "primary_explanation": json.loads(r.explanations_json)[0] if r.explanations_json else "High anomaly score"
        })

    return {
        "total_transactions_processed": total_txns,
        "fraud_transactions_flagged": flagged_txns,
        "fraud_rate_percentage": round((flagged_txns / total_txns * 100) if total_txns > 0 else 0.0, 2),
        "total_voice_calls_analyzed": total_calls,
        "scam_calls_intercepted": flagged_scam_calls,
        "scam_call_rate_percentage": round((flagged_scam_calls / total_calls * 100) if total_calls > 0 else 0.0, 2),
        "risk_distribution": {
            "HIGH": high_risk_txns,
            "MEDIUM": med_risk_txns,
            "LOW": low_risk_txns
        },
        "recent_alerts": recent_flagged_list
    }
