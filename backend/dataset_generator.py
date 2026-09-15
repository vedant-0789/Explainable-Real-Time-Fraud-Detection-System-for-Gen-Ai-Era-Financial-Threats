import numpy as np
import pandas as pd

def generate_paysim_dataset(n_samples: int = 6000, fraud_ratio: float = 0.08, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic dataset mimicking the Kaggle PaySim financial fraud schema.
    PaySim tracks mobile money transactions with features:
    step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig, nameDest, oldbalanceDest, newbalanceDest, isFraud
    """
    np.random.seed(random_state)
    
    n_fraud = int(n_samples * fraud_ratio)
    n_legit = n_samples - n_fraud
    
    types = ['PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT']
    type_probs_legit = [0.40, 0.20, 0.25, 0.12, 0.03]
    # In PaySim, fraud almost exclusively happens in TRANSFER and CASH_OUT
    type_probs_fraud = [0.0, 0.50, 0.50, 0.0, 0.0]
    
    # 1. Generate Legitimate Transactions
    steps_legit = np.random.randint(1, 744, size=n_legit) # 30 days of hourly steps
    types_legit = np.random.choice(types, size=n_legit, p=type_probs_legit)
    
    # Normal amounts log-normally distributed
    amounts_legit = np.random.lognormal(mean=7.5, sigma=1.2, size=n_legit).round(2)
    amounts_legit = np.clip(amounts_legit, 5.0, 150000.0)
    
    old_bal_orig_legit = (amounts_legit * np.random.uniform(1.1, 10.0, size=n_legit) + np.random.uniform(100, 50000, size=n_legit)).round(2)
    new_bal_orig_legit = np.where(
        np.isin(types_legit, ['CASH_OUT', 'PAYMENT', 'TRANSFER']),
        np.maximum(0, old_bal_orig_legit - amounts_legit),
        old_bal_orig_legit + amounts_legit
    ).round(2)
    
    old_bal_dest_legit = np.random.uniform(0, 200000, size=n_legit).round(2)
    # Zero balance dest for some payment merchants
    zero_dest_mask = np.random.rand(n_legit) < 0.25
    old_bal_dest_legit[zero_dest_mask] = 0.0
    
    new_bal_dest_legit = np.where(
        np.isin(types_legit, ['CASH_OUT', 'PAYMENT', 'TRANSFER']),
        old_bal_dest_legit + amounts_legit,
        np.maximum(0, old_bal_dest_legit - amounts_legit)
    ).round(2)
    new_bal_dest_legit[zero_dest_mask] = 0.0
    
    account_age_legit = np.random.randint(30, 1500, size=n_legit)
    
    df_legit = pd.DataFrame({
        'step': steps_legit,
        'type': types_legit,
        'amount': amounts_legit,
        'nameOrig': [f'C{np.random.randint(100000000, 999999999)}' for _ in range(n_legit)],
        'oldbalanceOrg': old_bal_orig_legit,
        'newbalanceOrig': new_bal_orig_legit,
        'nameDest': [f'M{np.random.randint(100000000, 999999999)}' if t == 'PAYMENT' else f'C{np.random.randint(100000000, 999999999)}' for t in types_legit],
        'oldbalanceDest': old_bal_dest_legit,
        'newbalanceDest': new_bal_dest_legit,
        'account_age_days': account_age_legit,
        'isFraud': 0
    })
    
    # 2. Generate Fraudulent Transactions
    # Fraud often happens during odd hours (1 AM to 5 AM: step % 24 in 1..5)
    fraud_hours = np.random.choice([1, 2, 3, 4, 5, 23, 0], size=n_fraud)
    days = np.random.randint(0, 30, size=n_fraud)
    steps_fraud = days * 24 + fraud_hours
    
    types_fraud = np.random.choice(types, size=n_fraud, p=type_probs_fraud)
    # Fraud amounts are significantly higher, often draining the entire account balance
    amounts_fraud = np.random.uniform(80000.0, 2000000.0, size=n_fraud).round(2)
    
    # In fraud, oldbalanceOrg is almost exactly equal to amount (wiping out balance)
    old_bal_orig_fraud = (amounts_fraud + np.random.uniform(0, 50, size=n_fraud)).round(2)
    new_bal_orig_fraud = np.maximum(0, old_bal_orig_fraud - amounts_fraud).round(2) # drops to 0 or near 0
    
    # Fraud destinations often have 0 initial balance and 0 resulting recorded balance (mule accounts)
    old_bal_dest_fraud = np.zeros(n_fraud)
    new_bal_dest_fraud = np.zeros(n_fraud)
    
    account_age_fraud = np.random.randint(1, 45, size=n_fraud) # newly created accounts
    
    df_fraud = pd.DataFrame({
        'step': steps_fraud,
        'type': types_fraud,
        'amount': amounts_fraud,
        'nameOrig': [f'C{np.random.randint(100000000, 999999999)}' for _ in range(n_fraud)],
        'oldbalanceOrg': old_bal_orig_fraud,
        'newbalanceOrig': new_bal_orig_fraud,
        'nameDest': [f'C{np.random.randint(100000000, 999999999)}' for _ in range(n_fraud)],
        'oldbalanceDest': old_bal_dest_fraud,
        'newbalanceDest': new_bal_dest_fraud,
        'account_age_days': account_age_fraud,
        'isFraud': 1
    })
    
    df = pd.concat([df_legit, df_fraud], ignore_index=True)
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df

def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw PaySim fields into feature representations used for XGBoost training and SHAP explainability.
    """
    df_feat = df.copy()
    
    # 1. Type Encoding
    type_map = {'TRANSFER': 1, 'CASH_OUT': 2, 'PAYMENT': 3, 'CASH_IN': 4, 'DEBIT': 5}
    df_feat['type_encoded'] = df_feat['type'].map(type_map).fillna(0).astype(int)
    
    # 2. Temporal Features
    df_feat['hour_of_day'] = df_feat['step'] % 24
    df_feat['is_night_time'] = ((df_feat['hour_of_day'] >= 0) & (df_feat['hour_of_day'] <= 5)).astype(int)
    
    # 3. Balance & Accounting Anomaly Features
    df_feat['balance_ratio_orig'] = (df_feat['amount'] / (df_feat['oldbalanceOrg'] + 1.0)).round(4)
    df_feat['error_balance_orig'] = (df_feat['newbalanceOrig'] + df_feat['amount'] - df_feat['oldbalanceOrg']).abs().round(2)
    df_feat['error_balance_dest'] = (df_feat['oldbalanceDest'] + df_feat['amount'] - df_feat['newbalanceDest']).abs().round(2)
    df_feat['is_zero_dest_balance'] = ((df_feat['oldbalanceDest'] == 0) & (df_feat['newbalanceDest'] == 0)).astype(int)
    df_feat['is_balance_emptied'] = ((df_feat['newbalanceOrig'] == 0) & (df_feat['oldbalanceOrg'] > 0)).astype(int)
    
    return df_feat

FEATURE_COLUMNS = [
    'amount',
    'type_encoded',
    'oldbalanceOrg',
    'newbalanceOrig',
    'oldbalanceDest',
    'newbalanceDest',
    'account_age_days',
    'hour_of_day',
    'is_night_time',
    'balance_ratio_orig',
    'error_balance_orig',
    'error_balance_dest',
    'is_zero_dest_balance',
    'is_balance_emptied'
]

FEATURE_HUMAN_NAMES = {
    'amount': 'Transaction Amount',
    'type_encoded': 'Transaction Type',
    'oldbalanceOrg': 'Sender Initial Balance',
    'newbalanceOrig': 'Sender New Balance',
    'oldbalanceDest': 'Recipient Initial Balance',
    'newbalanceDest': 'Recipient New Balance',
    'account_age_days': 'Sender Account Age (Days)',
    'hour_of_day': 'Hour of Day (24h)',
    'is_night_time': 'Night Time Execution (1 AM - 5 AM)',
    'balance_ratio_orig': 'Amount to Balance Ratio',
    'error_balance_orig': 'Sender Balance Discrepancy',
    'error_balance_dest': 'Recipient Balance Discrepancy',
    'is_zero_dest_balance': 'Unregistered / Zero Balance Recipient',
    'is_balance_emptied': 'Complete Account Balance Depletion'
}

if __name__ == '__main__':
    df = generate_paysim_dataset()
    print(f"Generated PaySim synthetic dataset with shape {df.shape}")
    print(f"Fraud count: {df['isFraud'].sum()} / {len(df)}")
