@echo off
echo ========================================
echo 🚀 Starting CliniqAI...
echo ========================================

echo.
echo 📦 Installing frontend dependencies (first time only)...
cd D:\cliniqai\frontend
call npm install

echo.
echo ✅ Starting Backend at http://localhost:8000
start "CliniqAI Backend" cmd /k "cd /d D:\cliniqai\backend && set PYTHONPATH=D:\cliniqai\backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo.
echo ✅ Starting Frontend at http://localhost:5173
start "CliniqAI Frontend" cmd /k "cd /d D:\cliniqai\frontend && npm run dev"

echo.
echo ========================================
echo 📍 CliniqAI is running!
echo    Backend: http://localhost:8000
echo    Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit (servers will keep running)...
pause > nul
