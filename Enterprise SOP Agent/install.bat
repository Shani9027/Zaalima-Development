@echo off
REM OpsMind AI - Installation Script
REM Run this script to install and start the application

echo.
echo ========================================
echo     OpsMind AI - Full Stack Setup
echo ========================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Node.js and npm...
node --version
npm --version
echo ✓ Node.js and npm are installed
echo.

REM Navigate to project directory
cd /d "%~dp0"
echo [2/4] Installing dependencies...
echo This may take a few minutes...
echo.

REM Install dependencies with legacy peer deps flag
call npm install --legacy-peer-deps --no-audit

if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed
    echo Trying with --force flag...
    call npm install --legacy-peer-deps --force --no-audit
    
    if %errorlevel% neq 0 (
        echo ERROR: Installation failed
        echo Please try manually:
        echo   npm install --legacy-peer-deps --force
        pause
        exit /b 1
    )
)

echo.
echo ✓ Dependencies installed successfully
echo.

echo [3/4] Building the project...
call npm run build

if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo ✓ Project built successfully
echo.

echo [4/4] Ready to start!
echo.
echo ========================================
echo     Installation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Frontend will be at http://localhost:5173
echo   3. Backend API at http://localhost:3000
echo.
echo For production:
echo   npm start
echo.
pause
