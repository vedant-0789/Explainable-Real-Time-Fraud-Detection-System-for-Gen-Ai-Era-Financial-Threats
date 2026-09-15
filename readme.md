# Explainable Real-Time Fraud Detection System for GenAI-Era Financial Threats

An explainable, real-time fraud detection platform that goes beyond a bare risk score — every flagged transaction comes with a human-readable reason. The system also includes a scam/impersonation call detection module to address a growing class of GenAI-era fraud (deepfake voice calls, AI-generated phishing scripts) that traditional transaction-only models miss.

> Major Project — B.Tech CSE (AI & ML), VIT Pune

---

## Why This Project

Most fraud detection systems output a black-box probability score with no explanation, making decisions hard to audit or justify to regulators and customers. Meanwhile, fraud is increasingly shifting toward generative-AI-powered social engineering — impersonation calls, AI-written phishing — that classic transaction-pattern classifiers were never built to catch.

This project addresses both gaps in a single unified system:
- **Explainable transaction fraud scoring** — every flag comes with a plain-English reason, not just a number
- **GenAI-era threat detection** — a dedicated module for voice/call-based scam detection

---

## Features

- Real-time transaction fraud risk scoring using a trained XGBoost model
- SHAP-based explainability layer that converts feature attributions into human-readable justifications
- Scam/impersonation call detection module (rule-based heuristics on call metadata and transcripts)
- Interactive dashboard with live stats, a flagged-transactions table, and a manual "test a transaction" form
- Clean, minimal tech stack — easy to run locally for demos and viva

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| ML / Modeling | XGBoost, SHAP |
| Voice/Call Module | Rule-based heuristics (acoustic + NLP features planned as future work) |
| Database | SQLite |
| Frontend | React, Tailwind CSS |
| Datasets | [PaySim](https://www.kaggle.com/datasets/ealaxi/paysim1), [IEEE-CIS Fraud Detection](https://www.kaggle.com/competitions/ieee-fraud-detection) |

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── routes/               # API route definitions
│   │   ├── models/                # Trained model + SHAP explainer
│   │   ├── schemas/               # Pydantic request/response models
│   │   └── db/                    # SQLite database setup
│   ├── train_model.py            # Script to train the XGBoost fraud model
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/           # Dashboard, transaction table, forms
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
├── docs/
│   └── project_synopsis.docx     # Formal project synopsis
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Train the fraud detection model (only needed once)
python train_model.py

# Run the API server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/transactions/score` | Score a transaction for fraud risk |
| `GET` | `/transactions/{id}/explanation` | Get a human-readable explanation for a flagged transaction |
| `GET` | `/transactions` | List recent scored transactions |
| `POST` | `/calls/score` | Score a call for scam/impersonation likelihood |
| `GET` | `/dashboard/summary` | Aggregate stats for the dashboard |

---

## How It Works

1. A transaction is submitted to `/transactions/score`.
2. The trained XGBoost model returns a fraud probability.
3. SHAP computes feature attributions for that specific prediction, which are translated into a plain-English explanation (e.g. *"Flagged because transaction amount is 5x this account's average and occurred at an unusual hour"*).
4. In parallel, call metadata can be submitted to `/calls/score`, which applies heuristic checks (urgency language, OTP/PIN requests, caller ID mismatches) to flag likely scam calls.
5. Both signals surface on a single dashboard for review.

---

## Evaluation

The transaction fraud model is evaluated on:
- Precision, Recall, F1-score
- AUC-PR (used instead of plain accuracy/ROC due to class imbalance in fraud data)
- End-to-end inference latency

---

## Roadmap / Future Work

- [ ] Replace rule-based call scoring with real acoustic feature extraction (voice pitch/synthetic-speech indicators)
- [ ] Extend GenAI-threat coverage to text-based phishing detection
- [ ] Add a tiered on-device/cloud cascade architecture for low-latency edge inference
- [ ] Human-rubric evaluation study of explanation quality

---

## Team

| Name | Role |
|---|---|
| _Member 1_ | Fraud Model Lead |
| _Member 2_ | Explainability Lead |
| _Member 3_ | Voice/Threat Module Lead |
| _Member 4_ | Integration & Evaluation Lead |

---

## License

This project is developed for academic purposes as part of a B.Tech major project at VIT Pune.