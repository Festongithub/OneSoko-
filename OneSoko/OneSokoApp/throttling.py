"""
Custom Throttling for OneSoko Application

This module provides advanced rate limiting and throttling capabilities.
For full functionality in production, install django-ratelimit:
    pip install django-ratelimit

In development without django-ratelimit, basic DRF throttling will still work,
but the sensitive operation throttling will be disabled.
"""

from django.contrib.auth.models import AnonymousUser
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from rest_framework import status
from rest_framework.response import Response
import time

class CustomUserRateThrottle(UserRateThrottle):
    """
    Custom rate throttling for authenticated users
    """
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            # Premium users get higher limits
            if hasattr(request.user, 'userprofile') and request.user.userprofile.is_premium:
                self.scope = 'premium_user'
            else:
                self.scope = 'user'
        return super().get_cache_key(request, view)

class CustomAnonRateThrottle(AnonRateThrottle):
    """
    Custom rate throttling for anonymous users
    """
    scope = 'anon'

class APIKeyThrottle(UserRateThrottle):
    """
    Rate throttling based on API keys for business clients
    """
    scope = 'api_key'
    
    def get_cache_key(self, request, view):
        api_key = request.META.get('HTTP_X_API_KEY')
        if api_key:
            return f'throttle_api_key_{api_key}'
        return None

# Advanced throttling with burst protection
class BurstRateThrottle(UserRateThrottle):
    """
    Implements burst protection - allows short bursts but limits sustained load
    """
    scope = 'burst'
    
    def allow_request(self, request, view):
        """
        Implement burst protection algorithm
        """
        if self.rate is None:
            return True

        self.key = self.get_cache_key(request, view)
        if self.key is None:
            return True

        self.history = self.cache.get(self.key, [])
        self.now = self.timer()

        # Drop any requests from the history which have now passed the throttle duration
        while self.history and self.history[-1] <= self.now - self.duration:
            self.history.pop()

        # Check for burst (too many requests in short time)
        recent_requests = [req for req in self.history if req > self.now - 60]  # Last minute
        if len(recent_requests) > self.num_requests // 2:  # More than half the limit in 1 minute
            return False

        if len(self.history) >= self.num_requests:
            return self.throttle_failure()
        
        return self.throttle_success()

# Middleware for request monitoring
class RequestMonitoringMiddleware:
    """
    Monitor requests for suspicious patterns
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        # Check for suspicious patterns
        self.check_suspicious_activity(request)
        
        response = self.get_response(request)
        
        # Log slow requests
        duration = time.time() - start_time
        if duration > 5.0:  # Log requests taking more than 5 seconds
            import logging
            logger = logging.getLogger('slow_requests')
            logger.warning(f"Slow request: {request.path} took {duration:.2f}s")
        
        return response
    
    def check_suspicious_activity(self, request):
        """
        Check for suspicious request patterns
        """
        from django.core.cache import cache
        
        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        # Track requests per IP
        cache_key = f'req_count_{ip}'
        requests = cache.get(cache_key, 0)
        requests += 1
        cache.set(cache_key, requests, 300)  # 5 minutes
        
        # Block if too many requests
        if requests > 1000:  # More than 1000 requests in 5 minutes
            from django.http import HttpResponseTooManyRequests
            raise HttpResponseTooManyRequests("Too many requests")

# Rate limiting configuration for settings.py
REST_FRAMEWORK_THROTTLE_RATES = {
    'anon': '100/hour',           # Anonymous users
    'user': '1000/hour',          # Regular authenticated users
    'premium_user': '5000/hour',  # Premium users
    'api_key': '10000/hour',      # API key users
    'burst': '50/min',            # Burst protection
    'login': '5/min',             # Login attempts
    'register': '3/min',          # Registration attempts
}

# Custom throttle for sensitive operations
import importlib.util
from django.utils.decorators import method_decorator

# Check if django-ratelimit is available and import dynamically
RATELIMIT_AVAILABLE = importlib.util.find_spec("django_ratelimit") is not None

if RATELIMIT_AVAILABLE:
    import importlib
    ratelimit_module = importlib.import_module("django_ratelimit.decorators")
    ratelimit = ratelimit_module.ratelimit
else:
    # django-ratelimit not installed - create a dummy decorator for development
    def ratelimit(*args, **kwargs):
        def decorator(func):
            return func
        return decorator

def sensitive_operation_throttle(view_func):
    """
    Decorator for sensitive operations like password reset, payment
    Note: Requires 'pip install django-ratelimit' for production use
    """
    if RATELIMIT_AVAILABLE:
        @method_decorator(ratelimit(key='ip', rate='5/min', method='POST'))
        @method_decorator(ratelimit(key='user', rate='10/hour', method='POST'))
        def wrapper(*args, **kwargs):
            return view_func(*args, **kwargs)
        return wrapper
    else:
        # In development without django-ratelimit, return function unchanged
        return view_func
