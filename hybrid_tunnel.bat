@echo off
echo ==============================================
echo PVG Unified ERP - HYBRID Setup
echo ==============================================
echo FRONTEND - Ngrok
echo BACKEND  - Localtunnel
echo.

echo [1/2] Starting Localtunnel for BACKEND (Port 8000)...
start "Tunnel Backend" cmd /k "lt --port 8000 --subdomain pvg-erp-backend-api --local-host 127.0.0.1"

echo [2/2] Starting Ngrok for FRONTEND (Port 5173)...
start "Ngrok Frontend" cmd /k ".\ngrok_bin\ngrok.exe http 5173"

echo.
echo ==============================================
echo Tunnels opened!
echo 1. Your Frontend is on the NEW NGROK window link!
echo 2. Your Backend is permanently connected at:
echo    https://pvg-erp-backend-api.loca.lt
echo ==============================================
pause
