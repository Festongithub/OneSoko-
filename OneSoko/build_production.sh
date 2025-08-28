#!/bin/bash

# Production build script for OneSoko
# This script builds the frontend and prepares the application for deployment

set -e

echo "🏗️  Building OneSoko for Production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[Build]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Build]${NC} $1"
}

print_error() {
    echo -e "${RED}[Build]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Build]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    print_error "manage.py not found. Please run this script from the Django project root."
    exit 1
fi

# Set environment to production
export DJANGO_SETTINGS_MODULE=MyOneSoko.settings_production

print_status "Building frontend..."
python manage.py build_frontend --production

print_status "Collecting static files..."
python manage.py collectstatic --noinput --clear

print_status "Running migrations..."
python manage.py migrate --noinput

print_status "Compressing static files..."
# If using django-compressor
# python manage.py compress

print_success "✅ Production build completed!"
print_status "Application is ready for deployment"

echo ""
echo "📦 Built files:"
echo "   Frontend: OneSokoApp/OneSokoFrontend/dist/"
echo "   Static:   staticfiles/"
echo ""
echo "🚀 Ready for deployment with Docker:"
echo "   docker-compose -f docker-compose.fullstack.yml up --build"
