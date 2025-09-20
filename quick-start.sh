#!/bin/bash

# 🏝️ SerendibGo Quick Start Script
# This script helps you get the SerendibGo project running quickly

echo "🚀 Starting SerendibGo Development Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js version: $NODE_VERSION"

# Check if npm is installed
print_status "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm version: $NPM_VERSION"

# Check if MongoDB is running (optional check)
print_status "Checking MongoDB connection..."
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        print_success "MongoDB is running"
    else
        print_warning "MongoDB is installed but not running. Please start MongoDB or use MongoDB Atlas."
    fi
else
    print_warning "MongoDB not found. Please install MongoDB or use MongoDB Atlas."
fi

# Install dependencies
print_status "Installing project dependencies..."
npm run install-all

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check if environment file exists
if [ ! -f "env.local" ]; then
    print_warning "env.local file not found. Creating from template..."
    cp env.example env.local
    print_success "Created env.local from template"
    print_warning "Please update env.local with your configuration"
else
    print_success "Environment file found"
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Populate sample data
print_status "Populating sample data..."
curl -X POST http://localhost:5001/api/populate-sample-data > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Sample data populated"
else
    print_warning "Could not populate sample data (server may not be running)"
fi

# Start development servers
print_status "Starting development servers..."
print_success "Starting SerendibGo in development mode..."
print_status "Frontend will be available at: http://localhost:3000"
print_status "Backend API will be available at: http://localhost:5001"
print_status "Health check: http://localhost:5001/health"

# Start the development servers
npm run dev
