import time
import json
import hashlib
import hmac
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import PermissionDenied
from rest_framework import status
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)

class SecurityMiddleware(MiddlewareMixin):
    """
    Enhanced security middleware for API protection
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.rate_limit_cache = {}
        self.request_count = {}
    
    def process_request(self, request):
        """Process incoming requests for security checks"""
        start_time = time.time()
        request.start_time = start_time
        
        # Add security headers
        self.add_security_headers(request)
        
        # Rate limiting
        if not self.check_rate_limit(request):
            return JsonResponse({
                'error': 'Rate limit exceeded. Please try again later.',
                'retry_after': 60
            }, status=429)
        
        # API key validation for sensitive endpoints
        if self.is_sensitive_endpoint(request.path):
            if not self.validate_api_key(request):
                return JsonResponse({
                    'error': 'Invalid or missing API key'
                }, status=401)
        
        # Request signature validation for shop operations
        if self.is_shop_operation(request.path):
            if not self.validate_request_signature(request):
                return JsonResponse({
                    'error': 'Invalid request signature'
                }, status=401)
        
        return None
    
    def process_response(self, request, response):
        """Process outgoing responses"""
        # Add security headers to response
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        
        # Log request performance
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(f"Request {request.method} {request.path} took {duration:.3f}s")
            
            # Add performance header
            response['X-Response-Time'] = f"{duration:.3f}s"
        
        return response
    
    def add_security_headers(self, request):
        """Add security headers to request"""
        request.META['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest'
    
    def check_rate_limit(self, request):
        """Implement rate limiting"""
        client_ip = self.get_client_ip(request)
        endpoint = request.path
        cache_key = f"rate_limit:{client_ip}:{endpoint}"
        
        # Get current request count
        current_count = cache.get(cache_key, 0)
        
        # Define rate limits based on endpoint
        limits = {
            '/api/auth/': 10,  # 10 requests per minute for auth
            '/api/shops/': 100,  # 100 requests per minute for shops
            '/api/products/': 200,  # 200 requests per minute for products
            '/api/messages/': 50,  # 50 requests per minute for messages
            'default': 60  # 60 requests per minute for other endpoints
        }
        
        limit = limits.get(endpoint, limits['default'])
        
        if current_count >= limit:
            return False
        
        # Increment counter
        cache.set(cache_key, current_count + 1, 60)  # 1 minute expiry
        return True
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
    
    def is_sensitive_endpoint(self, path):
        """Check if endpoint requires API key validation"""
        sensitive_paths = [
            '/api/admin/',
            '/api/shops/create/',
            '/api/products/create/',
            '/api/orders/',
            '/api/payments/'
        ]
        return any(path.startswith(sensitive_path) for sensitive_path in sensitive_paths)
    
    def validate_api_key(self, request):
        """Validate API key for sensitive operations"""
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return False
        
        # In production, validate against database
        # For now, use a simple check
        valid_keys = getattr(settings, 'VALID_API_KEYS', [])
        return api_key in valid_keys
    
    def is_shop_operation(self, path):
        """Check if request is a shop operation"""
        shop_ops = [
            '/api/shops/',
            '/api/products/',
            '/api/orders/'
        ]
        return any(path.startswith(op) for op in shop_ops)
    
    def validate_request_signature(self, request):
        """Validate request signature for shop operations"""
        signature = request.headers.get('X-Request-Signature')
        if not signature:
            return False
        
        # Get request body
        body = request.body.decode('utf-8') if request.body else ''
        
        # Create expected signature
        secret = getattr(settings, 'REQUEST_SECRET', 'default_secret')
        expected_signature = hmac.new(
            secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)


class PerformanceMiddleware(MiddlewareMixin):
    """
    Performance monitoring and optimization middleware
    """
    
    def process_request(self, request):
        """Start performance monitoring"""
        request.start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """Monitor response performance"""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log slow requests
            if duration > 1.0:  # Log requests taking more than 1 second
                logger.warning(f"Slow request: {request.method} {request.path} took {duration:.3f}s")
            
            # Add performance metrics to response headers
            response['X-Response-Time'] = f"{duration:.3f}s"
            response['X-Cache-Status'] = 'MISS'  # Will be updated by cache middleware
        
        return response


class CacheMiddleware(MiddlewareMixin):
    """
    Intelligent caching middleware for API responses
    """
    
    def process_request(self, request):
        """Check cache for GET requests"""
        if request.method == 'GET':
            cache_key = self.generate_cache_key(request)
            cached_response = cache.get(cache_key)
            
            if cached_response:
                logger.info(f"Cache HIT for {request.path}")
                return JsonResponse(cached_response, status=200)
        
        return None
    
    def process_response(self, request, response):
        """Cache successful GET responses"""
        if (request.method == 'GET' and 
            response.status_code == 200 and 
            not request.path.startswith('/api/auth/')):
            
            cache_key = self.generate_cache_key(request)
            cache_data = json.loads(response.content.decode('utf-8'))
            
            # Set cache with appropriate TTL based on endpoint
            ttl = self.get_cache_ttl(request.path)
            cache.set(cache_key, cache_data, ttl)
            
            response['X-Cache-Status'] = 'MISS'
        
        return response
    
    def generate_cache_key(self, request):
        """Generate unique cache key for request"""
        key_parts = [
            request.path,
            request.GET.urlencode(),
            request.headers.get('Authorization', ''),
            request.headers.get('Accept-Language', 'en')
        ]
        return hashlib.md5('|'.join(key_parts).encode()).hexdigest()
    
    def get_cache_ttl(self, path):
        """Get cache TTL based on endpoint"""
        ttl_map = {
            '/api/shops/': 300,  # 5 minutes for shops
            '/api/products/': 600,  # 10 minutes for products
            '/api/categories/': 1800,  # 30 minutes for categories
            '/api/reviews/': 300,  # 5 minutes for reviews
            'default': 60  # 1 minute for other endpoints
        }
        
        for pattern, ttl in ttl_map.items():
            if path.startswith(pattern):
                return ttl
        
        return ttl_map['default']


class ShopSecurityMiddleware(MiddlewareMixin):
    """
    Specialized security middleware for shop operations
    """
    
    def process_request(self, request):
        """Validate shop ownership and permissions"""
        if self.is_shop_operation(request.path):
            if not request.user.is_authenticated:
                return JsonResponse({
                    'error': 'Authentication required for shop operations'
                }, status=401)
            
            # Check if user is shop owner for sensitive operations
            if self.is_sensitive_shop_operation(request.path, request.method):
                if not self.validate_shop_ownership(request):
                    return JsonResponse({
                        'error': 'Access denied. Only shop owners can perform this operation.'
                    }, status=403)
        
        return None
    
    def is_shop_operation(self, path):
        """Check if request is a shop operation"""
        shop_paths = [
            '/api/shops/',
            '/api/products/',
            '/api/orders/',
            '/api/payments/'
        ]
        return any(path.startswith(sp) for sp in shop_paths)
    
    def is_sensitive_shop_operation(self, path, method):
        """Check if operation requires shop ownership"""
        sensitive_ops = [
            ('/api/shops/', ['POST', 'PUT', 'DELETE']),
            ('/api/products/', ['POST', 'PUT', 'DELETE']),
            ('/api/orders/', ['PUT', 'PATCH']),
            ('/api/payments/', ['POST', 'PUT'])
        ]
        
        for pattern, methods in sensitive_ops:
            if path.startswith(pattern) and method in methods:
                return True
        
        return False
    
    def validate_shop_ownership(self, request):
        """Validate that user owns the shop being operated on"""
        # Extract shop ID from request
        shop_id = self.extract_shop_id(request)
        if not shop_id:
            return False
        
        # Check if user owns the shop
        from .models import Shop
        try:
            shop = Shop.objects.get(shopId=shop_id)
            return shop.shopowner == request.user
        except Shop.DoesNotExist:
            return False
    
    def extract_shop_id(self, request):
        """Extract shop ID from request path or body"""
        # Try to get from URL parameters
        shop_id = request.resolver_match.kwargs.get('pk')
        if shop_id:
            return shop_id
        
        # Try to get from request body
        if request.body:
            try:
                data = json.loads(request.body.decode('utf-8'))
                return data.get('shop_id') or data.get('shop')
            except json.JSONDecodeError:
                pass
        
        return None


class MessagingSecurityMiddleware(MiddlewareMixin):
    """
    Security middleware specifically for messaging operations
    """
    
    def process_request(self, request):
        """Validate messaging permissions and rate limits"""
        if self.is_messaging_operation(request.path):
            if not request.user.is_authenticated:
                return JsonResponse({
                    'error': 'Authentication required for messaging'
                }, status=401)
            
            # Check messaging rate limits
            if not self.check_messaging_rate_limit(request):
                return JsonResponse({
                    'error': 'Message rate limit exceeded. Please wait before sending more messages.'
                }, status=429)
            
            # Validate message recipients
            if request.method == 'POST':
                if not self.validate_message_recipient(request):
                    return JsonResponse({
                        'error': 'Invalid recipient or insufficient permissions'
                    }, status=403)
        
        return None
    
    def is_messaging_operation(self, path):
        """Check if request is a messaging operation"""
        return path.startswith('/api/messages/')
    
    def check_messaging_rate_limit(self, request):
        """Check messaging-specific rate limits"""
        client_ip = self.get_client_ip(request)
        user_id = request.user.id if request.user.is_authenticated else 'anonymous'
        
        cache_key = f"msg_rate_limit:{user_id}:{client_ip}"
        current_count = cache.get(cache_key, 0)
        
        # Allow 20 messages per minute per user
        if current_count >= 20:
            return False
        
        cache.set(cache_key, current_count + 1, 60)
        return True
    
    def validate_message_recipient(self, request):
        """Validate message recipient permissions"""
        try:
            data = json.loads(request.body.decode('utf-8'))
            recipient_id = data.get('recipient')
            
            if not recipient_id:
                return False
            
            # Check if recipient exists and is not the sender
            from django.contrib.auth.models import User
            try:
                recipient = User.objects.get(id=recipient_id)
                if recipient == request.user:
                    return False  # Can't message yourself
                return True
            except User.DoesNotExist:
                return False
                
        except json.JSONDecodeError:
            return False
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR') 