@echo off
REM Quick Start - Starts Backend and Opens Extension
echo.
echo ========================================
echo  AI Code Reviewer - Quick Start
echo ========================================
echo.

REM Get the directory paths
setlocal enabledelayedexpansion
set BACKEND_DIR=%~dp0Backend App
set FRONTEND_DIR=%~dp0Frontend app

REM Check if backend directory exists
if not exist "%BACKEND_DIR%" (
    echo ❌ ERROR: Backend App directory not found
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "%FRONTEND_DIR%" (
    echo ❌ ERROR: Frontend app directory not found
    pause
    exit /b 1
)

echo 1️⃣  Starting Backend Server...
start "AI Code Reviewer - Backend" cmd /k "cd /d "%BACKEND_DIR%" && node server.js"

echo 2️⃣  Starting Frontend (Vite)...
start "AI Code Reviewer - Frontend" cmd /c "cd /d "%FRONTEND_DIR%" && node node_modules\vite\bin\vite.js"

echo 3️⃣  Waiting for services to start...
timeout /t 10 /nobreak

echo 4️⃣  Opening application in browser...
start http://localhost:3000

echo.
echo ✅ Setup Complete!
echo - Backend running on: http://localhost:5000
echo - HTML file opened in browser
echo - Keep the backend CMD window open while using the application
echo.
pause
