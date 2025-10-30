@echo off
title FinBot AI Launcher
color 0A

echo.
echo  ========================================
echo    FinBot AI - Smart Trading Dashboard
echo  ========================================
echo.
echo  This will start both backend and frontend
echo.
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo.
echo  ========================================
echo.

REM Start backend in new window
echo Starting Backend Server...
start "FinBot AI - Backend" cmd /k "cd backend && run.bat"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
echo Starting Frontend Server...
start "FinBot AI - Frontend" cmd /k "cd frontend && run.bat"

echo.
echo  Both servers are starting in separate windows!
echo.
echo  Once both are running, open your browser to:
echo  http://localhost:3000
echo.
echo  Press any key to exit this launcher...
pause > nul
