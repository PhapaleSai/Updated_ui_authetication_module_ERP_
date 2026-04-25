@echo off
echo ==============================================
echo PVG Unified ERP - Localtunnel Setup
echo ==============================================
echo This script will expose your local project to the internet!
echo Please make sure your backend and frontends are running 
echo (via start_erp.bat) before continuing.
echo.
pause

echo.
echo Installing localtunnel (if not already installed)...
call npm install -g localtunnel

echo.
echo [1/2] Starting Localtunnel for Auth Admin (Port 5173)...
start "Tunnel Admin" cmd /k "lt --port 5173 --local-host 127.0.0.1"

echo [2/2] Starting Localtunnel for Student User Portal (Port 5175)...
start "Tunnel User" cmd /k "lt --port 5175 --local-host 127.0.0.1"

echo.
echo ==============================================
echo SUCCESS: Tunnels have been launched in new windows!
echo ==============================================
echo 1. Look at the two newly opened black windows.
echo 2. Each window will give you a "your url is: https://..." link.
echo 3. Share those links with your friends!
echo.
echo (Note: Your API automatically works through the frontend proxy,
echo  so the backend does not need its own tunnel link!)
echo ==============================================
pause
