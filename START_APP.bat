@echo off
title FinBot AI - Complete Startup
color 0A

echo.
echo ========================================
echo   FinBot AI - Starting Application
echo ========================================
echo.

REM Kill any existing processes on ports 5000 and 3000
echo Checking for existing processes...
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo Port 5000 is in use. Please close the Flask app manually.
)

netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo Port 3000 is in use. Please close the Vite dev server manually.
)

echo.
echo Starting Backend Server...
echo.
start "FinBot Backend" cmd /k "cd backend && python app.py"

timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
echo.
start "FinBot Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Wait 10 seconds, then open: http://localhost:3000
echo.
echo Press any key to exit this launcher...
pause > nul
