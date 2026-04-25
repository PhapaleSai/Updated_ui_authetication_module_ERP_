@echo off
echo ==============================================
echo PVG Unified ERP - Ngrok Setup
echo ==============================================
echo Ensure your frontend and backend are already running!
echo This script uses your installed Ngrok.
echo.

echo [1/1] Starting Ngrok for Auth Admin Dashboard...
start "Ngrok Admin" cmd /k ".\ngrok_bin\ngrok.exe http 5173"

echo.
echo (WARNING: Your free Ngrok plan only allows ONE tunnel at a time.)
echo (If you want to host the Student portal instead, edit this script and change 5173 to 5175)

echo.
echo ==============================================
echo Tunnels opened! 
echo Check the new black windows for your ngrok.io links.
echo Remember: Your frontend runs on / and your backend 
echo runs automatically on /api via the built-in Vite proxy!
echo ==============================================
pause
