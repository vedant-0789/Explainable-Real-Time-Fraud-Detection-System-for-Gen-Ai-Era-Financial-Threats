import numpy as np
import pandas as pd
from dataset_generator import FEATURE_COLUMNS, FEATURE_HUMAN_NAMES

class SHAPExplanationEngine:
    """
    Translates mathematical SHAP values (Shapley feature attributions) into clear, 
    actionable plain-English sentences for financial auditors and users.
    """
    def __init__(self, explainer, feature_columns=FEATURE_COLUMNS):
        self.explainer = explainer
        self.feature_columns = feature_columns

    def explain_transaction(self, feature_row: pd.DataFrame, raw_input_dict: dict, risk_score: float) -> dict:
        """
        Computes SHAP feature importance for a single transaction and returns structured explanations.
        """
        # Compute SHAP values for the transaction
        shap_values = self.explainer.shap_values(feature_row)
        
        # Handle binary classification array shapes from SHAP
        if isinstance(shap_values, list):
            sv = shap_values[1][0] # class 1 (fraud)
        elif len(np.array(shap_values).shape) == 3:
            sv = shap_values[0, :, 1]
        elif len(np.array(shap_values).shape) == 2:
            sv = shap_values[0]
        else:
            sv = np.array(shap_values).flatten()

        feature_vals = feature_row.iloc[0].to_dict()
        
        # Map features to their SHAP contribution values
        attributions = []
        for feat, val in zip(self.feature_columns, sv):
            attributions.append({
                'feature': feat,
                'feature_name': FEATURE_HUMAN_NAMES.get(feat, feat),
                'shap_value': float(val),
                'actual_value': float(feature_vals.get(feat, 0.0))
            })
            
        # Sort by absolute SHAP impact
        attributions.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        # Generate Natural Language Sentences for Top Drivers
        sentences = []
        high_risk = risk_score >= 0.50
        
        for attr in attributions:
            feat = attr['feature']
            s_val = attr['shap_value']
            act_val = attr['actual_value']
            
            # Translate positive SHAP (pushes towards Fraud)
            if s_val > 0.05:
                if feat == 'amount':
                    sentences.append(f"High transaction amount (${raw_input_dict.get('amount', act_val):,.2f}) significantly increased fraud risk.")
                elif feat == 'is_balance_emptied' and act_val == 1:
                    sentences.append("The transaction completely emptied the sender's account balance to $0.00.")
                elif feat == 'balance_ratio_orig' and act_val > 0.8:
                    sentences.append(f"Transaction requested {act_val*100:.1f}% of the sender's total available balance.")
                elif feat == 'is_night_time' and act_val == 1:
                    hour = raw_input_dict.get('step', 0) % 24
                    sentences.append(f"Transaction occurred during high-risk night hours ({hour:02d}:00 AM).")
                elif feat == 'is_zero_dest_balance' and act_val == 1:
                    sentences.append("Destination account has $0.00 prior history and recorded balance.")
                elif feat == 'account_age_days' and act_val < 30:
                    sentences.append(f"Sender account is newly created ({int(act_val)} days old).")
                elif feat == 'type_encoded' and act_val in [1, 2]:
                    t_name = 'TRANSFER' if act_val == 1 else 'CASH_OUT'
                    sentences.append(f"Transaction type '{t_name}' carries an elevated fraud probability in PaySim pattern analysis.")
                elif feat == 'error_balance_orig' and act_val > 0:
                    sentences.append(f"Detected accounting discrepancy (${act_val:,.2f}) between initial and final sender balance.")
            
            # Translate negative SHAP (pushes towards Legitimate)
            elif s_val < -0.05:
                if feat == 'account_age_days' and act_val > 100:
                    sentences.append(f"Long account tenure ({int(act_val)} days active) strongly supports legitimate user behavior.")
                elif feat == 'amount' and act_val < 1000:
                    sentences.append(f"Transaction amount (${act_val:,.2f}) is well within safe normal threshold.")
                elif feat == 'is_night_time' and act_val == 0:
                    sentences.append("Executed during normal business hours.")
                elif feat == 'is_zero_dest_balance' and act_val == 0:
                    sentences.append("Destination account has verified active balance history.")
        
        # Fallback explanation if sentences list is small
        if not sentences:
            if high_risk:
                sentences.append("Transaction exhibits cumulative anomaly scores across transaction velocity and balance movement.")
            else:
                sentences.append("Transaction aligns with normal user spending and account balance patterns.")

        return {
            'risk_score': round(float(risk_score), 4),
            'risk_level': 'HIGH' if risk_score >= 0.75 else ('MEDIUM' if risk_score >= 0.40 else 'LOW'),
            'explanations': sentences[:4], # Top 4 primary explanations
            'shap_breakdown': attributions[:6] # Top 6 SHAP feature values for frontend visual chart
        }
