@echo off
title DripCheck Pro Workstation
cd /d "%~dp0"

echo ===================================================
echo   DRIPCHECK PRO WORKSTATION
echo   Cleaning any stale processes on port 3005...
echo ===================================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3005" ^| findstr "LISTENING"') do (
    echo   Releasing port 3005 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo ===================================================
echo   Starting DripCheck Pro on http://localhost:3005
echo ===================================================
timeout /t 2 /nobreak >nul
start http://localhost:3005

npm start
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server terminated with error code %ERRORLEVEL%.
    echo Press any key to exit.
    pause
)
pause
