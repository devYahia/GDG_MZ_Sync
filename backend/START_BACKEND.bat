@echo off
echo Starting Backend Server...
echo.
cd /d %~dp0
uvicorn api.main:app --reload --port 8001 --host 0.0.0.0
pause
