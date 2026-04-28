@echo off
echo ==============================================
echo PVG Unified ERP - Dual Account Ngrok Setup
echo ==============================================

echo Starting Frontend (Port 5173) using Account 1...
start "Ngrok Frontend" cmd /k ".\ngrok_bin\ngrok.exe http 5173 --authtoken 3CWaKkfYzQwLQzjs4cwmCUhOVif_2xxMscyHAKpK5fXcFMoie"

echo Starting Backend (Port 8000) using Account 2...
start "Ngrok Backend" cmd /k ".\ngrok_bin\ngrok.exe http 8000 --authtoken 30OfoKnGhaE5cyQ2GOvAwR1I4F7_3UuFxpx9F96gM7GHc5vYX"

echo.
echo Both Ngrok windows launched successfully with separate accounts!
echo ==============================================
pause
