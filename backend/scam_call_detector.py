import re

class ScamCallDetector:
    """
    Evaluates incoming voice call metadata and transcripts using rule-based NLP 
    heuristics to detect social engineering, urgency manipulation, and phishing attempt flags.
    """
    
    HIGH_RISK_KEYWORDS = {
        'otp_phishing': ['otp', 'pin', 'verification code', 'cvv', 'password', '6-digit code', 'one-time password'],
        'urgency_coercion': ['immediately', 'urgent', 'account blocked', 'within 10 minutes', 'suspended', 'legal action', 'warrant', 'police'],
        'authority_impersonation': ['bank security', 'fraud department', 'cyber crime', 'tax inspector', 'rbi officer', 'support manager', 'fedex customs'],
        'remote_access': ['anydesk', 'teamviewer', 'quicksupport', 'download app', 'screen share'],
        'financial_coercion': ['wire transfer', 'transfer money to safe account', 'gift card', 'bitcoin', 'crypto', 'refund fee']
    }

    def evaluate_call(self, caller_identity: str, phone_number: str, duration_sec: int, transcript: str) -> dict:
        transcript_lower = transcript.lower()
        identity_lower = caller_identity.lower()
        
        reasons = []
        score = 0.05 # Baseline risk
        
        # 1. OTP / Credential Request Check (Critical Flag)
        for kw in self.HIGH_RISK_KEYWORDS['otp_phishing']:
            if kw in transcript_lower:
                score += 0.45
                reasons.append(f"Caller explicitly requested sensitive credentials or OTP ('{kw}').")
                break
                
        # 2. Urgency & Coercion Check
        urgency_hits = [kw for kw in self.HIGH_RISK_KEYWORDS['urgency_coercion'] if kw in transcript_lower]
        if urgency_hits:
            score += 0.25
            reasons.append(f"High urgency coercion language detected ('{', '.join(urgency_hits[:2])}').")

        # 3. Impersonation Claims
        impersonation_hits = [kw for kw in self.HIGH_RISK_KEYWORDS['authority_impersonation'] if kw in transcript_lower or kw in identity_lower]
        if impersonation_hits:
            score += 0.20
            reasons.append(f"Claimed high-trust official identity ('{impersonation_hits[0]}').")

        # 4. Remote Access / Screen Share Demands
        remote_hits = [kw for kw in self.HIGH_RISK_KEYWORDS['remote_access'] if kw in transcript_lower]
        if remote_hits:
            score += 0.35
            reasons.append(f"Requested installation of remote access tool ('{remote_hits[0]}').")

        # 5. Financial Transfer / Safety Account Redirection
        fin_hits = [kw for kw in self.HIGH_RISK_KEYWORDS['financial_coercion'] if kw in transcript_lower]
        if fin_hits:
            score += 0.30
            reasons.append("Demand for money transfer to external 'safety' account or non-standard payment channel.")

        # 6. Phone Number / Identity Mismatch Heuristic
        # e.g. Claiming to be official bank but calling from personal mobile number range (+91-9... or standard unverified line)
        if ('bank' in identity_lower or 'official' in identity_lower) and not phone_number.startswith('1800'):
            score += 0.15
            reasons.append("Caller ID mismatch: Claimed bank official line, but originated from an unverified 10-digit line.")

        # Cap score between 0.0 and 0.99
        score = min(0.99, max(0.01, score))
        
        risk_level = 'HIGH' if score >= 0.70 else ('MEDIUM' if score >= 0.35 else 'LOW')
        is_scam = score >= 0.50

        if not reasons:
            reasons.append("No suspicious impersonation or credential phishing markers detected in transcript.")

        return {
            'scam_score': round(float(score), 4),
            'risk_level': risk_level,
            'is_scam': is_scam,
            'primary_reason': reasons[0],
            'all_reasons': reasons
        }
