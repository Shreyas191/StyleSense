#!/bin/bash

# AI Outfit Analyzer - Installation Script (Linux/Mac)
# This script will set up and run the AI Outfit Analyzer

set -e

echo "=========================================="
echo "AI Outfit Analyzer - Installation Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Docker is installed
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi
print_success "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed!"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi
print_success "Docker Compose is installed"

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
print_success "Docker is running"

echo ""
echo "=========================================="
echo "Step 1: Configure Environment Variables"
echo "=========================================="
echo ""

# Backend environment setup
if [ ! -f "backend/.env" ]; then
    print_info "Setting up backend environment..."
    cp backend/.env.example backend/.env
    print_success "Created backend/.env"
    
    # Generate a secure secret key
    if command -v openssl &> /dev/null; then
        SECRET_KEY=$(openssl rand -hex 32)
        sed -i.bak "s/your-secret-key-change-this-in-production-min-32-characters/$SECRET_KEY/" backend/.env
        rm backend/.env.bak
        print_success "Generated secure SECRET_KEY"
    else
        print_info "Please manually set SECRET_KEY in backend/.env"
    fi
    
    echo ""
    print_info "IMPORTANT: You need to add your Gemini API key!"
    echo ""
    echo "1. Visit: https://makersuite.google.com/app/apikey"
    echo "2. Sign in with Google"
    echo "3. Click 'Create API Key'"
    echo "4. Copy the API key"
    echo ""
    read -p "Paste your Gemini API key here: " GEMINI_KEY
    
    if [ -n "$GEMINI_KEY" ]; then
        sed -i.bak "s/your-gemini-api-key-here/$GEMINI_KEY/" backend/.env
        rm backend/.env.bak
        print_success "Gemini API key configured"
    else
        print_error "No API key provided. You'll need to add it manually to backend/.env"
    fi
else
    print_info "backend/.env already exists, skipping..."
fi

# Frontend environment setup
if [ ! -f "frontend/.env" ]; then
    print_info "Setting up frontend environment..."
    cp frontend/.env.example frontend/.env
    print_success "Created frontend/.env"
else
    print_info "frontend/.env already exists, skipping..."
fi

echo ""
echo "=========================================="
echo "Step 2: Building and Starting Services"
echo "=========================================="
echo ""

print_info "This may take 5-10 minutes on first run..."
echo ""

# Build and start services
docker-compose down 2>/dev/null || true
docker-compose up --build -d

echo ""
print_success "Services started successfully!"

echo ""
echo "=========================================="
echo "Step 3: Waiting for Services to be Ready"
echo "=========================================="
echo ""

# Wait for backend to be ready
print_info "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend is ready!"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for frontend to be ready
print_info "Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is ready!"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "=========================================="
echo "✓ Installation Complete!"
echo "=========================================="
echo ""
echo "Your AI Outfit Analyzer is now running!"
echo ""
echo "Access the application:"
echo "  • Frontend:  http://localhost:3000"
echo "  • Backend:   http://localhost:8000"
echo "  • API Docs:  http://localhost:8000/docs"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Click 'Sign Up' to create an account"
echo "  3. Upload an outfit image"
echo "  4. Get AI-powered fashion analysis!"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop the application:"
echo "  docker-compose down"
echo ""
echo "Restart the application:"
echo "  docker-compose up -d"
echo ""
print_success "Happy outfit analyzing! 🎨"
echo ""