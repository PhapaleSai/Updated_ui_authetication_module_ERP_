@echo off
echo ==============================================
echo PVG Unified ERP - Dual Ngrok Agent
echo ==============================================
echo Closing existing ngrok sessions...
taskkill /f /im ngrok.exe >nul 2>&1

echo.
echo Starting Frontend (5173) and Backend (8000) together...
echo.
.\ngrok_bin\ngrok.exe start --all --config=ngrok_dual.yml
pause
