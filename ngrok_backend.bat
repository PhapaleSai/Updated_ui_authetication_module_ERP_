@echo off
echo ==============================================
echo PVG Unified ERP - Backend Ngrok Setup
echo ==============================================
echo Starting Ngrok for Backend (Port 8000)...
echo.
echo NOTE: If you are on a free Ngrok plan, make sure you close 
echo any other open Ngrok windows before this, otherwise it will fail!
echo.
start "Ngrok Backend" cmd /k ".\ngrok_bin\ngrok.exe http 8000"
