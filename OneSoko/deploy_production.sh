#!/bin/bash

# OneSoko Production Deployment Script
# This script deploys the Django backend with WSGI and React frontend

set -e  # Exit on any error

echo "🚀 Starting OneSoko Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_MODE=${1:-docker}  # docker, manual, or update
DOMAIN=${2:-localhost}
USE_SSL=${3:-false}

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

# Check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    if [ "$DEPLOYMENT_MODE" = "docker" ]; then
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed!"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose is not installed!"
            exit 1
        fi
    else
        if ! command -v python3 &> /dev/null; then
            print_error "Python 3 is not installed!"
            exit 1
        fi
        
        if ! command -v node &> /dev/null; then
            print_error "Node.js is not installed!"
            exit 1
        fi
        
        if ! command -v nginx &> /dev/null; then
            print_warning "Nginx is not installed. Install it for production deployment."
        fi
    fi
    
    print_success "Dependencies check completed!"
}

# Build frontend
build_frontend() {
    print_status "Building React frontend..."
    
    cd OneSokoApp/OneSokoFrontend
    
    # Install dependencies (including dev dependencies needed for build)
    npm ci
    
    # Build for production
    npm run build
    
    # Copy built files to Django static directory
    mkdir -p ../../static_frontend
    cp -r dist/* ../../static_frontend/
    
    cd ../..
    
    print_success "Frontend built successfully!"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
# Django Settings
DJANGO_ENV=production
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DEBUG=False
ALLOWED_HOSTS=$DOMAIN,www.$DOMAIN,localhost,127.0.0.1

# Database (MySQL)
DATABASE_URL=mysql://onesoko_user:onesoko_password@localhost:3306/onesoko_db

# Redis
REDIS_URL=redis://localhost:6379/1

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@$DOMAIN

# Security (for HTTPS)
SECURE_SSL_REDIRECT=$USE_SSL
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https

# Static/Media Files
STATIC_URL=/static/
MEDIA_URL=/media/
EOF
        print_warning "Created .env file. Please update it with your actual values!"
    fi
    
    print_success "Environment setup completed!"
}

# Docker deployment
deploy_docker() {
    print_status "Deploying with Docker..."
    
    # Stop existing containers
    docker-compose -f docker-compose.fullstack.yml down 2>/dev/null || true
    
    # Build and start services
    docker-compose -f docker-compose.fullstack.yml up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Run migrations
    docker-compose -f docker-compose.fullstack.yml exec web python manage.py migrate
    
    # Collect static files
    docker-compose -f docker-compose.fullstack.yml exec web python manage.py collectstatic --noinput
    
    # Create superuser if needed
    print_status "Creating superuser (if needed)..."
    docker-compose -f docker-compose.fullstack.yml exec web python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@$DOMAIN', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"
    
    print_success "Docker deployment completed!"
    print_status "Application is running at: http://localhost:8080"
    print_status "Admin interface: http://localhost:8080/admin"
    print_status "API base URL: http://localhost:8080/api"
}

# Manual deployment (without Docker)
deploy_manual() {
    print_status "Deploying manually..."
    
    # Install Python dependencies
    pip install -r requirements_production.txt
    
    # Setup database
    python manage.py migrate
    
    # Collect static files
    python manage.py collectstatic --noinput
    
    # Create directories
    mkdir -p logs
    mkdir -p staticfiles
    mkdir -p media
    
    print_success "Manual deployment setup completed!"
    print_status "To start the server:"
    print_status "  Development: python manage.py runserver"
    print_status "  Production with Gunicorn: gunicorn --bind 0.0.0.0:8000 MyOneSoko.wsgi:application"
}

# Generate systemd service file
generate_systemd_service() {
    print_status "Generating systemd service file..."
    
    sudo tee /etc/systemd/system/onesoko.service > /dev/null << EOF
[Unit]
Description=OneSoko Django Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=$(pwd)
Environment=DJANGO_ENV=production
ExecStart=$(which gunicorn) --bind unix:/run/onesoko.sock --workers 3 MyOneSoko.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable onesoko
    
    print_success "Systemd service created!"
}

# Generate Nginx configuration
generate_nginx_config() {
    print_status "Generating Nginx configuration..."
    
    sudo tee /etc/nginx/sites-available/onesoko > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static files
    location /static/ {
        alias $(pwd)/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias $(pwd)/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # API endpoints
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/run/onesoko.sock;
    }

    # Admin interface
    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/run/onesoko.sock;
    }

    # Frontend (React app)
    location / {
        try_files \$uri \$uri/ /index.html;
        root $(pwd)/static_frontend;
        expires 1h;
        add_header Cache-Control "public";
    }

    # Health check endpoint
    location /health/ {
        include proxy_params;
        proxy_pass http://unix:/run/onesoko.sock;
    }
}
EOF

    if [ "$USE_SSL" = "true" ]; then
        print_status "SSL is enabled. Make sure to configure SSL certificates!"
    fi

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/onesoko /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    
    print_success "Nginx configuration created!"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    if [ "$DEPLOYMENT_MODE" = "docker" ]; then
        # Check if containers are running
        if docker-compose -f docker-compose.fullstack.yml ps | grep -q "Up"; then
            print_success "Docker containers are running!"
            
            # Check application response
            if curl -f http://localhost:8080/health/ >/dev/null 2>&1; then
                print_success "Application is responding correctly!"
            else
                print_warning "Application may not be fully ready yet. Check logs with: docker-compose -f docker-compose.fullstack.yml logs"
            fi
        else
            print_error "Some containers are not running!"
        fi
    else
        # Check manual deployment
        if pgrep -f "gunicorn.*MyOneSoko.wsgi" >/dev/null; then
            print_success "Gunicorn is running!"
        else
            print_warning "Gunicorn is not running. Start it manually or use systemd."
        fi
    fi
}

# Main execution
main() {
    print_status "OneSoko Deployment Script"
    print_status "Mode: $DEPLOYMENT_MODE"
    print_status "Domain: $DOMAIN"
    print_status "SSL: $USE_SSL"
    
    check_dependencies
    setup_environment
    build_frontend
    
    case $DEPLOYMENT_MODE in
        docker)
            deploy_docker
            ;;
        manual)
            deploy_manual
            ;;
        systemd)
            deploy_manual
            generate_systemd_service
            generate_nginx_config
            ;;
        update)
            print_status "Updating application..."
            build_frontend
            if [ -f docker-compose.fullstack.yml ]; then
                docker-compose -f docker-compose.fullstack.yml exec web python manage.py migrate
                docker-compose -f docker-compose.fullstack.yml exec web python manage.py collectstatic --noinput
                docker-compose -f docker-compose.fullstack.yml restart web
            else
                python manage.py migrate
                python manage.py collectstatic --noinput
                sudo systemctl restart onesoko 2>/dev/null || print_warning "Could not restart systemd service"
            fi
            ;;
        *)
            print_error "Invalid deployment mode. Use: docker, manual, systemd, or update"
            exit 1
            ;;
    esac
    
    health_check
    
    print_success "🎉 OneSoko deployment completed!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Update your .env file with production values"
    print_status "2. Configure your domain DNS to point to this server"
    print_status "3. Set up SSL certificates (Let's Encrypt recommended)"
    print_status "4. Configure backup procedures for database and media files"
    print_status ""
    print_status "Useful commands:"
    if [ "$DEPLOYMENT_MODE" = "docker" ]; then
        print_status "  View logs: docker-compose -f docker-compose.fullstack.yml logs -f"
        print_status "  Restart: docker-compose -f docker-compose.fullstack.yml restart"
        print_status "  Stop: docker-compose -f docker-compose.fullstack.yml down"
    else
        print_status "  View logs: journalctl -u onesoko -f"
        print_status "  Restart: sudo systemctl restart onesoko"
        print_status "  Status: sudo systemctl status onesoko"
    fi
}

# Run main function
main "$@"