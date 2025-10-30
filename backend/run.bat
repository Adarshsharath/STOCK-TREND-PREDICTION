@echo off
echo Starting FinBot AI Backend...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env and add your PERPLEXITY_API_KEY
    echo.
)

REM Run the Flask app
echo.
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop
echo.
python app.py
