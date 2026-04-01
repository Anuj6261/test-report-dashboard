#!/bin/bash

# ── Test Report Dashboard - Quick Start Script ──

set -e

echo "🚀 Starting Test Report Dashboard..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "📦 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
if docker-compose ps | grep -q "healthy"; then
    echo "✅ Services are running!"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend:  http://localhost"
    echo "   Backend:   http://localhost:4000"
    echo "   API Docs:  http://localhost:4000/api"
    echo ""
    echo "📋 View logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Stop services:"
    echo "   docker-compose down"
else
    echo "⚠️  Services may not be fully ready yet. Checking logs..."
    docker-compose logs
fi
