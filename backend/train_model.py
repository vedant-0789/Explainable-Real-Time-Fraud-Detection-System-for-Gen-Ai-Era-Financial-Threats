import sys
import os
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
import shap
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, f1_score

from dataset_generator import generate_paysim_dataset, feature_engineering, FEATURE_COLUMNS

# Fix encoding on Windows stdout
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def train_and_save_pipeline():
    print("[+] Generating synthetic PaySim transaction dataset...")
    raw_df = generate_paysim_dataset(n_samples=6000, fraud_ratio=0.08, random_state=42)
    feat_df = feature_engineering(raw_df)
    
    X = feat_df[FEATURE_COLUMNS]
    y = feat_df['isFraud']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"[*] Training XGBoost Fraud Classifier on {len(X_train)} samples...")
    # Calculate scale_pos_weight for imbalanced dataset
    ratio = float(np.sum(y_train == 0)) / np.sum(y_train == 1)
    
    model = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=ratio,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_preds = model.predict(X_test)
    y_probs = model.predict_proba(X_test)[:, 1]
    
    f1 = f1_score(y_test, y_preds)
    auc = roc_auc_score(y_test, y_probs)
    
    print("\n[+] XGBoost Model Evaluation Results:")
    print(f"   - F1-Score: {f1:.4f}")
    print(f"   - ROC-AUC:  {auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_preds))
    
    print("[*] Initializing SHAP TreeExplainer on trained XGBoost model...")
    explainer = shap.TreeExplainer(model)
    
    # Ensure models/ directory exists
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'xgb_fraud_model.joblib')
    explainer_path = os.path.join(models_dir, 'shap_explainer.joblib')
    
    joblib.dump(model, model_path)
    joblib.dump(explainer, explainer_path)
    
    print(f"[SAVED] Model saved to: {model_path}")
    print(f"[SAVED] SHAP explainer saved to: {explainer_path}")
    
    return model, explainer

if __name__ == '__main__':
    train_and_save_pipeline()
