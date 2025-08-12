"""
Shop Security Module for OneSoko

This module provides additional security measures specifically for shop-related operations,
ensuring that only shop owners can access their own shops and related resources.
"""

import logging
from django.http import JsonResponse
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser
from .models import Shop, UserProfile
import json

logger = logging.getLogger(__name__)

class ShopAccessSecurityMiddleware(MiddlewareMixin):
    """
    Middleware to provide additional security for shop access operations.
    Logs unauthorized access attempts and provides additional validation.
    """
    
    def process_request(self, request):
        """Process incoming requests for shop security validation"""
        # Skip non-shop related requests
        if not self._is_shop_related_request(request.path):
            return None
        
        # Skip public endpoints
        if self._is_public_endpoint(request.path):
            return None
        
        # Check if user is authenticated for shop operations
        if isinstance(request.user, AnonymousUser):
            logger.warning(f"Unauthenticated access attempt to shop endpoint: {request.path}")
            return JsonResponse({
                'error': 'Authentication required for shop operations',
                'detail': 'Please log in to access shop management features.'
            }, status=401)
        
        # Additional validation for shop owners
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            try:
                if not hasattr(request.user, 'profile'):
                    logger.warning(f"User {request.user.id} missing profile for shop operation: {request.path}")
                    return JsonResponse({
                        'error': 'Profile required for shop operations',
                        'detail': 'User profile not found. Please complete your profile setup.'
                    }, status=403)
                
                if not request.user.profile.is_shopowner:
                    logger.warning(f"Non-shop-owner {request.user.id} attempted shop operation: {request.path}")
                    return JsonResponse({
                        'error': 'Shop owner access required',
                        'detail': 'Only registered shop owners can perform this operation.'
                    }, status=403)
                    
            except UserProfile.DoesNotExist:
                logger.warning(f"User {request.user.id} profile not found for shop operation: {request.path}")
                return JsonResponse({
                    'error': 'Profile not found',
                    'detail': 'User profile not found. Please complete your profile setup.'
                }, status=403)
        
        return None
    
    def process_response(self, request, response):
        """Log shop access patterns for security monitoring"""
        if self._is_shop_related_request(request.path) and not self._is_public_endpoint(request.path):
            # Log successful shop operations
            if response.status_code < 400 and not isinstance(request.user, AnonymousUser):
                cache_key = f"shop_access_{request.user.id}_{request.method}_{request.path}"
                cache.set(cache_key, {
                    'timestamp': str(request.META.get('timestamp', '')),
                    'user_id': request.user.id,
                    'method': request.method,
                    'path': request.path,
                    'status': response.status_code
                }, timeout=300)  # 5 minutes
                
            # Log failed access attempts
            elif response.status_code >= 400:
                user_id = getattr(request.user, 'id', 'anonymous')
                logger.warning(f"Failed shop access - User: {user_id}, Path: {request.path}, Status: {response.status_code}")
        
        return response
    
    def _is_shop_related_request(self, path):
        """Check if the request is related to shop operations"""
        shop_paths = [
            '/api/shops/',
            '/api/products/',  # When accessed through shop context
        ]
        return any(path.startswith(sp) for sp in shop_paths)
    
    def _is_public_endpoint(self, path):
        """Check if the endpoint is public (doesn't require authentication)"""
        public_endpoints = [
            '/api/shops/public_list/',
            '/api/shops/public_detail/',
            '/api/shops/search/',
            '/api/shops/by_category/',
            '/api/shops/nearby/',
        ]
        return any(path.startswith(pe) for pe in public_endpoints) or '/public_detail/' in path


class ShopOwnershipValidator:
    """
    Utility class for validating shop ownership in various contexts.
    """
    
    @staticmethod
    def validate_shop_access(user, shop_id):
        """
        Validate that a user has access to a specific shop.
        
        Args:
            user: Django User instance
            shop_id: Shop identifier (shopId)
            
        Returns:
            tuple: (is_valid, error_message)
        """
        if isinstance(user, AnonymousUser):
            return False, "Authentication required"
        
        try:
            if not hasattr(user, 'profile') or not user.profile.is_shopowner:
                return False, "Shop owner access required"
            
            shop = Shop.objects.get(shopId=shop_id)
            if shop.shopowner != user:
                logger.warning(f"User {user.id} attempted unauthorized access to shop {shop_id} owned by {shop.shopowner.id}")
                return False, "Access denied - you do not own this shop"
            
            return True, None
            
        except Shop.DoesNotExist:
            return False, "Shop not found"
        except UserProfile.DoesNotExist:
            return False, "User profile not found"
        except Exception as e:
            logger.error(f"Error validating shop access for user {user.id} and shop {shop_id}: {e}")
            return False, "Internal error during validation"
    
    @staticmethod
    def get_user_shops(user):
        """
        Get all shops owned by a user.
        
        Args:
            user: Django User instance
            
        Returns:
            QuerySet: User's shops or empty queryset
        """
        if isinstance(user, AnonymousUser):
            return Shop.objects.none()
        
        try:
            if not hasattr(user, 'profile') or not user.profile.is_shopowner:
                return Shop.objects.none()
            
            return Shop.objects.filter(shopowner=user)
            
        except Exception as e:
            logger.error(f"Error retrieving shops for user {user.id}: {e}")
            return Shop.objects.none()
    
    @staticmethod
    def log_shop_access_attempt(user, shop_id, action, success=True):
        """
        Log shop access attempts for security monitoring.
        
        Args:
            user: Django User instance
            shop_id: Shop identifier
            action: Action being performed
            success: Whether the access was successful
        """
        user_id = getattr(user, 'id', 'anonymous')
        level = logging.INFO if success else logging.WARNING
        
        logger.log(level, f"Shop access attempt - User: {user_id}, Shop: {shop_id}, Action: {action}, Success: {success}")


# Security configuration
SHOP_SECURITY_CONFIG = {
    'ENABLE_ACCESS_LOGGING': True,
    'LOG_FAILED_ATTEMPTS': True,
    'CACHE_ACCESS_PATTERNS': True,
    'MAX_FAILED_ATTEMPTS': 5,  # Per hour
    'LOCKOUT_DURATION': 3600,  # 1 hour in seconds
}

def get_shop_security_config():
    """Get shop security configuration"""
    return SHOP_SECURITY_CONFIG
