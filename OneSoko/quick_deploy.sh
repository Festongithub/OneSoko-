#!/bin/bash

# OneSoko Quick Deployment Script
# Usage: ./quick_deploy.sh [development|production] [domain]

set -e

ENVIRONMENT=${1:-development}
DOMAIN=${2:-localhost}

echo "🚀 OneSoko Quick Deployment"
echo "Environment: $ENVIRONMENT"
echo "Domain: $DOMAIN"
echo ""

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: Please run this script from the OneSoko root directory"
    exit 1
fi

# Function to generate a random secret key
generate_secret_key() {
    python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
}

# Setup environment file
setup_env() {
    if [ ! -f ".env" ]; then
        echo "📝 Creating environment file..."
        cp .env.example .env
        
        # Generate and set secret key
        SECRET_KEY=$(generate_secret_key)
        sed -i "s/your-super-secret-key-change-this-in-production/$SECRET_KEY/g" .env
        
        # Set domain
        if [ "$DOMAIN" != "localhost" ]; then
            sed -i "s/yourdomain.com/$DOMAIN/g" .env
        fi
        
        # Set environment
        if [ "$ENVIRONMENT" = "production" ]; then
            sed -i "s/DEBUG=False/DEBUG=False/g" .env
            sed -i "s/SECURE_SSL_REDIRECT=false/SECURE_SSL_REDIRECT=true/g" .env
        else
            sed -i "s/DEBUG=False/DEBUG=True/g" .env
        fi
        
        echo "✅ Environment file created!"
        echo "⚠️  Please update .env with your actual database and email credentials"
    else
        echo "✅ Environment file already exists"
    fi
}

# Development deployment
deploy_development() {
    echo "🔧 Setting up development environment..."
    
    # Install Python dependencies
    if [ ! -d "env" ]; then
        echo "📦 Creating virtual environment..."
        python3 -m venv env
    fi
    
    source env/bin/activate
    pip install -r requirements_basic.txt
    
    # Setup database
    echo "🗄️  Setting up database..."
    python manage.py migrate
    
    # Build frontend
    echo "🎨 Building frontend..."
    cd OneSokoApp/OneSokoFrontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    cd ../..
    
    # Collect static files
    python manage.py collectstatic --noinput
    
    echo ""
    echo "✅ Development setup complete!"
    echo ""
    echo "To start the development server:"
    echo "  source env/bin/activate"
    echo "  python manage.py runserver"
    echo ""
    echo "Or use the development server script:"
    echo "  ./dev_server.sh"
}

# Production deployment
deploy_production() {
    echo "🚀 Setting up production environment..."
    
    # Check for Docker
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        echo "🐳 Docker detected - using Docker deployment"
        
        # Use the main deployment script
        chmod +x deploy_production.sh
        ./deploy_production.sh docker "$DOMAIN" true
        
    else
        echo "📦 Docker not found - using manual deployment"
        
        # Manual production setup
        if [ ! -d "env" ]; then
            python3 -m venv env
        fi
        
        source env/bin/activate
        pip install -r requirements_production.txt
        pip install gunicorn
        
        # Build frontend
        cd OneSokoApp/OneSokoFrontend
        npm ci --only=production
        npm run build
        cd ../..
        
        # Setup Django
        python manage.py migrate
        python manage.py collectstatic --noinput
        
        echo ""
        echo "✅ Production setup complete!"
        echo ""
        echo "To start the production server:"
        echo "  source env/bin/activate"
        echo "  gunicorn --config gunicorn.conf.py MyOneSoko.wsgi:application"
        echo ""
        echo "For full production deployment with Nginx and systemd:"
        echo "  ./deploy_production.sh systemd $DOMAIN true"
    fi
}

# Main execution
main() {
    setup_env
    
    case $ENVIRONMENT in
        development|dev)
            deploy_development
            ;;
        production|prod)
            deploy_production
            ;;
        *)
            echo "❌ Invalid environment. Use 'development' or 'production'"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
