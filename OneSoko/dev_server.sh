#!/bin/bash

# Development script to run both frontend and backend
# Make sure to run this from the project root directory

set -e

echo "🚀 Starting OneSoko Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[OneSoko]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OneSoko]${NC} $1"
}

print_error() {
    echo -e "${RED}[OneSoko]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[OneSoko]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    print_error "manage.py not found. Please run this script from the Django project root."
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    print_warning "Shutting down development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Trap cleanup function on script exit
trap cleanup SIGINT SIGTERM

# Parse command line arguments
BACKEND_ONLY=false
FRONTEND_ONLY=false
BUILD_FRONTEND=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --build)
            BUILD_FRONTEND=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --backend-only   Run only Django backend"
            echo "  --frontend-only  Run only React frontend"
            echo "  --build         Build frontend before starting"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    print_warning "Virtual environment not detected. Activating..."
    if [ -f "env/bin/activate" ]; then
        source env/bin/activate
        print_success "Virtual environment activated"
    else
        print_error "Virtual environment not found at env/bin/activate"
        print_error "Please create a virtual environment first:"
        print_error "  python -m venv env"
        print_error "  source env/bin/activate"
        print_error "  pip install -r requirements_basic.txt"
        exit 1
    fi
fi

# Install/update Python dependencies
print_status "Checking Python dependencies..."
"$VIRTUAL_ENV/bin/python" -m pip install -r requirements_basic.txt --quiet

# Run migrations
print_status "Running Django migrations..."
"$VIRTUAL_ENV/bin/python" manage.py migrate

# Build frontend if requested
if [ "$BUILD_FRONTEND" = true ]; then
    print_status "Building frontend..."
    "$VIRTUAL_ENV/bin/python" manage.py build_frontend
fi

# Collect static files
print_status "Collecting static files..."
"$VIRTUAL_ENV/bin/python" manage.py collectstatic --noinput --clear

if [ "$FRONTEND_ONLY" = false ]; then
    # Start Django backend
    print_status "Starting Django backend on http://localhost:8000"
    "$VIRTUAL_ENV/bin/python" manage.py runserver 8000 &
    BACKEND_PID=$!
    print_success "Backend started with PID $BACKEND_PID"
fi

if [ "$BACKEND_ONLY" = false ]; then
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js to run the frontend."
        if [ "$FRONTEND_ONLY" = true ]; then
            exit 1
        fi
    else
        # Navigate to frontend directory
        cd OneSokoApp/OneSokoFrontend

        # Install npm dependencies
        print_status "Installing/updating npm dependencies..."
        npm install

        # Start React frontend
        print_status "Starting React frontend on http://localhost:5173"
        npm run dev &
        FRONTEND_PID=$!
        cd ../..
        print_success "Frontend started with PID $FRONTEND_PID"
    fi
fi

# Display running services
echo ""
print_success "🎉 OneSoko Development Environment is ready!"
echo ""
if [ "$FRONTEND_ONLY" = false ]; then
    echo "📊 Django Backend:     http://localhost:8000"
    echo "⚙️  Django Admin:      http://localhost:8000/admin"
    echo "🔧 API Endpoints:     http://localhost:8000/api"
fi
if [ "$BACKEND_ONLY" = false ] && command -v node &> /dev/null; then
    echo "🎨 React Frontend:    http://localhost:5173"
fi
echo ""
print_status "Press Ctrl+C to stop all services"

# Wait for background processes
wait
