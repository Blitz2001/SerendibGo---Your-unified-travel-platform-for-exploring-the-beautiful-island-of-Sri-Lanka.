@echo off
REM 🏝️ SerendibGo Quick Start Script for Windows
REM This script helps you get the SerendibGo project running quickly

echo 🚀 Starting SerendibGo Development Setup...

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js version: %NODE_VERSION%

REM Check if npm is installed
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm version: %NPM_VERSION%

REM Install dependencies
echo [INFO] Installing project dependencies...
call npm run install-all

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [SUCCESS] Dependencies installed successfully

REM Check if environment file exists
if not exist "env.local" (
    echo [WARNING] env.local file not found. Creating from template...
    copy env.example env.local
    echo [SUCCESS] Created env.local from template
    echo [WARNING] Please update env.local with your configuration
) else (
    echo [SUCCESS] Environment file found
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Start development servers
echo [INFO] Starting development servers...
echo [SUCCESS] Starting SerendibGo in development mode...
echo [INFO] Frontend will be available at: http://localhost:3000
echo [INFO] Backend API will be available at: http://localhost:5001
echo [INFO] Health check: http://localhost:5001/health

REM Start the development servers
call npm run dev

pause
