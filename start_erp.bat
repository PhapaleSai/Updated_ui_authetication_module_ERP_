@echo off
echo ==============================================
echo PVG Unified ERP Startup Sequence
echo ==============================================

echo Cleaning up ghost processes (Freeing ports 8000, 5173, 5175)...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8000') DO taskkill /T /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5173') DO taskkill /T /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5175') DO taskkill /T /F /PID %%a >nul 2>&1
echo Ports cleaned!

echo [1/3] Starting Auth Backend (Port 8000)
start "Auth Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn main:app --port 8000"

echo [2/3] Starting Authentication Admin Dashboard (Port 5173)
start "Auth Admin" cmd /k "cd frontend\admin && node node_modules\vite\bin\vite.js"

echo [3/3] Starting Student User Login (Port 5175)
start "User Portal" cmd /k "cd frontend\user && node node_modules\vite\bin\vite.js"

echo.
echo All services are launching in separate windows!
echo ==============================================
echo AUTH ADMIN (Users/Roles): http://localhost:5173
echo STUDENT USER LOGIN     : http://localhost:5175
echo ==============================================
pause
