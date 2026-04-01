@echo off
REM ── Test Report Dashboard - Quick Start Script (Windows) ──

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting Test Report Dashboard...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed
echo.

echo 🔨 Building Docker images...
call docker-compose build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo 📦 Starting services...
call docker-compose up -d
if errorlevel 1 (
    echo ❌ Failed to start services!
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak

echo.
echo ✅ Services are running!
echo.
echo 🌐 Access the application:
echo    Frontend:  http://localhost
echo    Backend:   http://localhost:4000
echo    API Docs:  http://localhost:4000/api
echo.
echo 📋 Useful commands:
echo    docker-compose logs -f              (View logs)
echo    docker-compose down                 (Stop services)
echo    docker-compose ps                   (View status)
echo.
pause
