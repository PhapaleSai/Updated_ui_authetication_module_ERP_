@echo off
echo ==============================================
echo PVG Unified ERP - Dual Links Setup
echo ==============================================
echo Since Ngrok Free Plan only allows 1 link, we are using a smart trick:
echo 1. Ngrok will host your Backend (Port 8000)
echo 2. LocalTunnel will host your Frontend (Port 5173)
echo.
echo Starting LocalTunnel for Frontend...
start "LocalTunnel Frontend" cmd /k "npx localtunnel --port 5173"

echo Starting Ngrok for Backend...
start "Ngrok Backend" cmd /k ".\ngrok_bin\ngrok.exe http 8000"

echo.
echo Check the two new black windows for your 2 SEPARATE links!
echo ==============================================
pause
