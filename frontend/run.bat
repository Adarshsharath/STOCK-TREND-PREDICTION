@echo off
echo Starting FinBot AI Frontend...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

REM Run the development server
echo.
echo Starting Vite dev server on http://localhost:3000
echo Press Ctrl+C to stop
echo.
call npm run dev
