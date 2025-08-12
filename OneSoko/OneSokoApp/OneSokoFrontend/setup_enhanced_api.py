#!/usr/bin/env python3
"""
Setup script for Enhanced OneSoko API
This script helps implement the enhanced API improvements
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'django',
        'djangorestframework',
        'redis',
        'django-redis',
        'django-filter',
        'channels',
        'celery'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install -r requirements_enhanced.txt")
        return False
    
    print("✅ All required dependencies are installed")
    return True

def setup_redis():
    """Setup Redis configuration"""
    print("🔧 Setting up Redis...")
    
    # Check if Redis is running
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis is running")
        return True
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        print("Please install and start Redis:")
        print("  - Ubuntu/Debian: sudo apt-get install redis-server")
        print("  - macOS: brew install redis")
        print("  - Windows: Download from https://redis.io/download")
        return False

def update_settings():
    """Update Django settings with enhanced configurations"""
    print("🔧 Updating Django settings...")
    
    settings_file = "settings.py"
    if not os.path.exists(settings_file):
        print(f"❌ {settings_file} not found")
        return False
    
    # Read current settings
    with open(settings_file, 'r') as f:
        content = f.read()
    
    # Add enhanced configurations
    enhanced_config = '''
# Enhanced API Configuration
from .api_config import get_config_for_environment

# Get environment-specific configuration
env_config = get_config_for_environment()

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Enhanced middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Enhanced middleware
    'your_app.middleware.SecurityMiddleware',
    'your_app.middleware.PerformanceMiddleware',
    'your_app.middleware.CacheMiddleware',
    'your_app.middleware.ShopSecurityMiddleware',
    'your_app.middleware.MessagingSecurityMiddleware',
]

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://onesoko.com",
    "https://www.onesoko.com",
]

CORS_ALLOW_CREDENTIALS = True

# Rate limiting
RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'

# Channels configuration for WebSockets
ASGI_APPLICATION = 'your_project.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# Celery configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}
'''
    
    # Check if enhanced config already exists
    if 'Enhanced API Configuration' in content:
        print("✅ Enhanced configuration already exists")
        return True
    
    # Add enhanced configuration
    with open(settings_file, 'a') as f:
        f.write(enhanced_config)
    
    print("✅ Django settings updated")
    return True

def create_management_commands():
    """Create management commands for enhanced features"""
    print("🔧 Creating management commands...")
    
    # Create management directory structure
    management_dir = Path("management/commands")
    management_dir.mkdir(parents=True, exist_ok=True)
    
    # Create cache warming command
    cache_warming_cmd = '''from django.core.management.base import BaseCommand
from django.core.cache import cache
from your_app.models import Shop, Product, Category

class Command(BaseCommand):
    help = 'Warm up cache with popular data'
    
    def handle(self, *args, **options):
        self.stdout.write('Warming up cache...')
        
        # Cache popular shops
        popular_shops = Shop.objects.filter(status='active').order_by('-total_orders')[:50]
        for shop in popular_shops:
            cache_key = f"shop:{shop.shopId}"
            cache.set(cache_key, shop, 300)
        
        # Cache popular products
        popular_products = Product.objects.filter(is_active=True).order_by('-views')[:100]
        for product in popular_products:
            cache_key = f"product:{product.productId}"
            cache.set(cache_key, product, 600)
        
        # Cache categories
        categories = Category.objects.all()
        for category in categories:
            cache_key = f"category:{category.id}"
            cache.set(cache_key, category, 1800)
        
        self.stdout.write(self.style.SUCCESS('Cache warming completed'))
'''
    
    with open(management_dir / "warm_cache.py", 'w') as f:
        f.write(cache_warming_cmd)
    
    # Create performance monitoring command
    perf_monitoring_cmd = '''from django.core.management.base import BaseCommand
from django.db import connection
from django.core.cache import cache
import time

class Command(BaseCommand):
    help = 'Monitor API performance'
    
    def handle(self, *args, **options):
        self.stdout.write('Monitoring performance...')
        
        # Check database connections
        with connection.cursor() as cursor:
            cursor.execute("SELECT count(*) FROM information_schema.processlist")
            connections = cursor.fetchone()[0]
            self.stdout.write(f'Database connections: {connections}')
        
        # Check cache performance
        cache_hits = cache.get('cache_hits', 0)
        cache_misses = cache.get('cache_misses', 0)
        total_requests = cache_hits + cache_misses
        hit_rate = (cache_hits / total_requests * 100) if total_requests > 0 else 0
        
        self.stdout.write(f'Cache hit rate: {hit_rate:.2f}%')
        self.stdout.write(f'Cache hits: {cache_hits}')
        self.stdout.write(f'Cache misses: {cache_misses}')
        
        self.stdout.write(self.style.SUCCESS('Performance monitoring completed'))
'''
    
    with open(management_dir / "monitor_performance.py", 'w') as f:
        f.write(perf_monitoring_cmd)
    
    print("✅ Management commands created")
    return True

def setup_celery():
    """Setup Celery for background tasks"""
    print("🔧 Setting up Celery...")
    
    celery_config = '''import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')

app = Celery('your_project')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
'''
    
    with open("celery.py", 'w') as f:
        f.write(celery_config)
    
    print("✅ Celery configuration created")
    return True

def create_tests():
    """Create test files for enhanced features"""
    print("🔧 Creating test files...")
    
    test_content = '''import pytest
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from your_app.models import Shop, Product, Message
from your_app.enhanced_messaging import EnhancedMessageManager

class EnhancedAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_shop_creation_with_enhanced_security(self):
        """Test shop creation with enhanced security"""
        data = {
            'name': 'Test Shop',
            'description': 'A test shop',
            'location': 'Test Location'
        }
        response = self.client.post('/api/shops/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_message_rate_limiting(self):
        """Test message rate limiting"""
        message_manager = EnhancedMessageManager()
        
        # Create multiple messages quickly
        recipient = User.objects.create_user(
            username='recipient',
            email='recipient@example.com',
            password='testpass123'
        )
        
        # Should allow first 20 messages
        for i in range(20):
            message = message_manager.create_message(
                sender=self.user,
                recipient=recipient,
                content=f'Test message {i}'
            )
            self.assertIsNotNone(message)
        
        # 21st message should be rate limited
        with self.assertRaises(Exception):
            message_manager.create_message(
                sender=self.user,
                recipient=recipient,
                content='Rate limited message'
            )

class PerformanceTestCase(TestCase):
    def test_optimized_queries(self):
        """Test that queries are optimized"""
        # Create test data
        shop = Shop.objects.create(
            name='Test Shop',
            shopowner=self.user,
            location='Test Location'
        )
        
        # This should use select_related and prefetch_related
        shops = Shop.objects.select_related(
            'shopowner', 'shopowner__profile'
        ).prefetch_related(
            'products', 'products__category'
        ).annotate(
            product_count=Count('products')
        )
        
        # Should not cause N+1 queries
        for shop in shops:
            self.assertIsNotNone(shop.shopowner.username)
            self.assertIsNotNone(shop.product_count)
'''
    
    with open("test_enhanced_api.py", 'w') as f:
        f.write(test_content)
    
    print("✅ Test files created")
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up Enhanced OneSoko API...")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Setup failed: Missing dependencies")
        sys.exit(1)
    
    # Setup Redis
    if not setup_redis():
        print("❌ Setup failed: Redis not available")
        sys.exit(1)
    
    # Update settings
    if not update_settings():
        print("❌ Setup failed: Could not update settings")
        sys.exit(1)
    
    # Create management commands
    if not create_management_commands():
        print("❌ Setup failed: Could not create management commands")
        sys.exit(1)
    
    # Setup Celery
    if not setup_celery():
        print("❌ Setup failed: Could not setup Celery")
        sys.exit(1)
    
    # Create tests
    if not create_tests():
        print("❌ Setup failed: Could not create tests")
        sys.exit(1)
    
    print("=" * 50)
    print("✅ Enhanced OneSoko API setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update your Django settings with the correct app names")
    print("2. Run migrations: python manage.py migrate")
    print("3. Start Redis: redis-server")
    print("4. Start Celery: celery -A your_project worker -l info")
    print("5. Run tests: python manage.py test test_enhanced_api.py")
    print("6. Warm cache: python manage.py warm_cache")
    print("\n📚 Documentation: See API_IMPROVEMENTS.md for detailed information")

if __name__ == "__main__":
    main() 