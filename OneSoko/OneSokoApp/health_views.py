# Health check views for monitoring and load balancers

from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
import time
import os


def health_check(request):
    """
    Basic health check endpoint
    Returns 200 if the application is healthy
    """
    return JsonResponse({
        'status': 'healthy',
        'timestamp': int(time.time()),
        'version': '1.0.0',
        'environment': os.environ.get('DJANGO_ENV', 'development')
    })


def health_check_detailed(request):
    """
    Detailed health check that tests database and cache connectivity
    """
    health_data = {
        'status': 'healthy',
        'timestamp': int(time.time()),
        'version': '1.0.0',
        'environment': os.environ.get('DJANGO_ENV', 'development'),
        'checks': {}
    }
    
    overall_healthy = True
    
    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        health_data['checks']['database'] = {'status': 'healthy'}
    except Exception as e:
        health_data['checks']['database'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_healthy = False
    
    # Cache check (Redis)
    try:
        cache.set('health_check', 'test', 30)
        cache_value = cache.get('health_check')
        if cache_value == 'test':
            health_data['checks']['cache'] = {'status': 'healthy'}
        else:
            health_data['checks']['cache'] = {
                'status': 'unhealthy',
                'error': 'Cache value mismatch'
            }
            overall_healthy = False
    except Exception as e:
        health_data['checks']['cache'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_healthy = False
    
    # Static files check
    try:
        static_root = getattr(settings, 'STATIC_ROOT', None)
        if static_root and os.path.exists(static_root):
            health_data['checks']['static_files'] = {'status': 'healthy'}
        else:
            health_data['checks']['static_files'] = {
                'status': 'warning',
                'message': 'Static files directory not found'
            }
    except Exception as e:
        health_data['checks']['static_files'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
    
    # Update overall status
    if not overall_healthy:
        health_data['status'] = 'unhealthy'
    
    status_code = 200 if overall_healthy else 503
    return JsonResponse(health_data, status=status_code)


def readiness_check(request):
    """
    Readiness check for Kubernetes/container orchestration
    """
    try:
        # Check if we can connect to the database
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        return JsonResponse({
            'status': 'ready',
            'timestamp': int(time.time())
        })
    except Exception as e:
        return JsonResponse({
            'status': 'not ready',
            'error': str(e),
            'timestamp': int(time.time())
        }, status=503)


def liveness_check(request):
    """
    Liveness check for container orchestration
    """
    return JsonResponse({
        'status': 'alive',
        'timestamp': int(time.time())
    })
