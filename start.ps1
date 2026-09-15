# Explainable Real-Time Fraud Detection System Launch Script
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " Explainable Real-Time Fraud Detection System (GenAI Era) - PowerShell Launcher" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan

$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Write-Host "[1/3] Verifying Python Model & SHAP Artifacts..." -ForegroundColor Yellow
python backend/train_model.py

Write-Host "`n[2/3] Launching FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[3/3] Launching React Dashboard on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; cd frontend; & 'C:\Program Files\nodejs\npm.cmd' run dev"

Write-Host "`n=========================================================================" -ForegroundColor Cyan
Write-Host " AegisX System Services Started!" -ForegroundColor Green
Write-Host " - FastAPI REST API & OpenAPI Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host " - Unified React Dashboard UI:       http://localhost:5173" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Cyan
