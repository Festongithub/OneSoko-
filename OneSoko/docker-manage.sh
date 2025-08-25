#!/bin/bash

# OneSoko Docker Management Script

echo "🐋 OneSoko Docker Management"
echo "============================"
echo ""

case "$1" in
    "start")
        echo "Starting OneSoko services..."
        docker-compose -f docker-compose.production.yml up -d
        ;;
    "stop")
        echo "Stopping OneSoko services..."
        docker-compose -f docker-compose.production.yml down
        ;;
    "restart")
        echo "Restarting OneSoko services..."
        docker-compose -f docker-compose.production.yml restart
        ;;
    "build")
        echo "Building OneSoko images..."
        docker-compose -f docker-compose.production.yml build
        ;;
    "logs")
        echo "Showing OneSoko logs..."
        docker-compose -f docker-compose.production.yml logs -f
        ;;
    "status")
        echo "OneSoko services status:"
        docker-compose -f docker-compose.production.yml ps
        ;;
    "shell")
        echo "Opening Django shell..."
        docker-compose -f docker-compose.production.yml exec web python manage.py shell
        ;;
    "migrate")
        echo "Running database migrations..."
        docker-compose -f docker-compose.production.yml exec web python manage.py migrate
        ;;
    "superuser")
        echo "Creating superuser..."
        docker-compose -f docker-compose.production.yml exec web python manage.py createsuperuser
        ;;
    "collectstatic")
        echo "Collecting static files..."
        docker-compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput
        ;;
    "setup")
        echo "Setting up OneSoko for first time..."
        docker-compose -f docker-compose.production.yml up -d
        sleep 30  # Wait for services to start
        docker-compose -f docker-compose.production.yml exec web python manage.py migrate
        docker-compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput
        echo "Setup complete! Create a superuser with: ./docker-manage.sh superuser"
        ;;
    "clean")
        echo "Cleaning up Docker resources..."
        docker-compose -f docker-compose.production.yml down -v
        docker system prune -f
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|build|logs|status|shell|migrate|superuser|collectstatic|setup|clean}"
        echo ""
        echo "Commands:"
        echo "  start       - Start all services"
        echo "  stop        - Stop all services"
        echo "  restart     - Restart all services"
        echo "  build       - Build Docker images"
        echo "  logs        - Show service logs"
        echo "  status      - Show service status"
        echo "  shell       - Open Django shell"
        echo "  migrate     - Run database migrations"
        echo "  superuser   - Create Django superuser"
        echo "  collectstatic - Collect static files"
        echo "  setup       - First-time setup"
        echo "  clean       - Clean up Docker resources"
        exit 1
        ;;
esac
