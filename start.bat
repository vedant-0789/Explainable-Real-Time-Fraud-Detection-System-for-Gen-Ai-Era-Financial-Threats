@echo off
echo =========================================================================
echo  Explainable Real-Time Fraud Detection System (GenAI Era) - Start Script
echo =========================================================================
echo.

set PATH=C:\Program Files\nodejs;%PATH%

echo [1/3] Training XGBoost model & initializing SHAP TreeExplainer if needed...
python backend\train_model.py

echo.
echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "AegisX FastAPI Backend" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" --cd backend

echo.
echo [3/3] Starting React Frontend on http://localhost:5173 ...
start "AegisX React Frontend" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && npm run dev" --cd frontend

echo.
echo =========================================================================
echo  System Initialized Successfully!
echo  - Backend API & Interactive Docs: http://127.0.0.1:8000/docs
echo  - Unified React Dashboard:        http://localhost:5173
echo =========================================================================
pause
