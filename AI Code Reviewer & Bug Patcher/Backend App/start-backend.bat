@echo off
echo.
echo ========================================
echo  AI Code Reviewer - Backend Startup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the backend server
echo.
echo 🚀 Starting backend server on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js
