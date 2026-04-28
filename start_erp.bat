@echo off
echo ==============================================
echo PVG Unified ERP Startup Sequence
echo ==============================================

echo Cleaning up ghost processes (Freeing ports 8000, 5173, 5175)...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8000') DO taskkill /T /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5173') DO taskkill /T /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5175') DO taskkill /T /F /PID %%a >nul 2>&1
echo Ports cleaned!

echo [1/2] Starting Auth Backend (Port 8000)
start "Auth Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn main:app --port 8000"

echo [2/2] Starting Unified ERP Portal (Port 5173)
start "Unified Portal" cmd /k "cd frontend\admin && node node_modules\vite\bin\vite.js"

echo.
echo All services are launching in separate windows!
echo ==============================================
echo UNIFIED PORTAL (Admin & Students): http://localhost:5173
echo ==============================================
pause
