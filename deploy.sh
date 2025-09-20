#!/bin/bash

# SerendibGo Production Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
APP_NAME="serendibgo"
DOMAIN=${2:-"your-domain.com"}

echo "🚀 Deploying SerendibGo to $ENVIRONMENT environment..."

# Check if required files exist
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please copy env.production.template to .env.production and configure it."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed!"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed!"
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check if the application is running
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Health check: http://localhost:5000/health"
    echo "🔍 API status: http://localhost:5000/api/status"
else
    echo "❌ Application failed to start!"
    echo "📋 Checking logs..."
    docker-compose logs app
    exit 1
fi

# Setup SSL certificates (if using Let's Encrypt)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🔒 Setting up SSL certificates..."
    # Add Let's Encrypt setup here if needed
fi

echo "🎉 Deployment completed successfully!"
echo "📊 Monitor your application at: https://$DOMAIN"
echo "🔍 Health check: https://$DOMAIN/health"
