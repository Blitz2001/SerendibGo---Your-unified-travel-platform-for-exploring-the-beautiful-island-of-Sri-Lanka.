@echo off
REM SerendibGo Production Deployment Script for Windows
REM Usage: deploy.bat [environment]

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo 🚀 Deploying SerendibGo to %ENVIRONMENT% environment...

REM Check if required files exist
if not exist ".env.production" (
    echo ❌ Error: .env.production file not found!
    echo Please copy env.production.template to .env.production and configure it.
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not installed!
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker Compose is not installed!
    exit /b 1
)

REM Build and start services
echo 📦 Building Docker images...
docker-compose build

echo 🔄 Starting services...
docker-compose up -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

REM Check if the application is running
curl -f http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Application failed to start!
    echo 📋 Checking logs...
    docker-compose logs app
    exit /b 1
) else (
    echo ✅ Application is running successfully!
    echo 🌐 Health check: http://localhost:5000/health
    echo 🔍 API status: http://localhost:5000/api/status
)

echo 🎉 Deployment completed successfully!
echo 📊 Monitor your application at: https://your-domain.com
echo 🔍 Health check: https://your-domain.com/health
