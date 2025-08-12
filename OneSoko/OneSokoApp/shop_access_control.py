"""
Shop Access Control Decorators

This module provides decorators for securing shop-related API endpoints
and ensuring only shop owners can access their own shops.
"""

from functools import wraps
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import Shop, UserProfile
from .shop_security import ShopOwnershipValidator
import logging

logger = logging.getLogger(__name__)

def shop_owner_required(view_func):
    """
    Decorator to ensure only shop owners can access the view.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Authentication required',
                'detail': 'Please log in to access shop owner features.'
            }, status=401)
        
        try:
            if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
                return JsonResponse({
                    'error': 'Shop owner access required',
                    'detail': 'Only registered shop owners can access this feature.'
                }, status=403)
        except UserProfile.DoesNotExist:
            return JsonResponse({
                'error': 'Profile not found',
                'detail': 'User profile not found. Please complete your profile setup.'
            }, status=404)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper

def shop_ownership_required(shop_param='shop_id'):
    """
    Decorator to ensure user owns the shop they're trying to access.
    
    Args:
        shop_param (str): Name of the parameter containing the shop ID
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Get shop ID from various sources
            shop_id = None
            
            # Try to get from URL parameters
            if shop_param in kwargs:
                shop_id = kwargs[shop_param]
            # Try to get from query parameters
            elif shop_param in request.GET:
                shop_id = request.GET[shop_param]
            # Try to get from request body
            elif hasattr(request, 'data') and shop_param in request.data:
                shop_id = request.data[shop_param]
            # Try common parameter names
            elif 'pk' in kwargs:
                shop_id = kwargs['pk']
            elif 'shop_id' in kwargs:
                shop_id = kwargs['shop_id']
            elif 'shopId' in kwargs:
                shop_id = kwargs['shopId']
            
            if not shop_id:
                return JsonResponse({
                    'error': 'Shop ID required',
                    'detail': f'Shop identifier ({shop_param}) not found in request.'
                }, status=400)
            
            # Validate shop ownership
            is_valid, error_message = ShopOwnershipValidator.validate_shop_access(
                request.user, shop_id
            )
            
            if not is_valid:
                ShopOwnershipValidator.log_shop_access_attempt(
                    request.user, shop_id, view_func.__name__, success=False
                )
                return JsonResponse({
                    'error': 'Access denied',
                    'detail': error_message
                }, status=403)
            
            # Log successful access
            ShopOwnershipValidator.log_shop_access_attempt(
                request.user, shop_id, view_func.__name__, success=True
            )
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator

def secure_shop_operation(operation_name="shop_operation"):
    """
    Comprehensive decorator for shop operations that combines
    shop owner validation and ownership checks.
    """
    def decorator(view_func):
        @shop_owner_required
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            logger.info(f"Secure shop operation: {operation_name} by user {request.user.id}")
            
            try:
                result = view_func(request, *args, **kwargs)
                logger.info(f"Secure shop operation completed: {operation_name} by user {request.user.id}")
                return result
            except Exception as e:
                logger.error(f"Error in secure shop operation {operation_name} by user {request.user.id}: {e}")
                raise
        
        return wrapper
    return decorator

# DRF ViewSet method decorators
def secure_shop_viewset_action(action_name="viewset_action"):
    """
    Decorator specifically for Django REST Framework ViewSet actions
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            # Check if user is authenticated
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required',
                    'detail': 'Please log in to access shop features.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user is shop owner
            try:
                if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
                    return Response({
                        'error': 'Shop owner access required',
                        'detail': 'Only registered shop owners can perform this action.'
                    }, status=status.HTTP_403_FORBIDDEN)
            except UserProfile.DoesNotExist:
                return Response({
                    'error': 'Profile not found',
                    'detail': 'User profile not found. Please complete your profile setup.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # For object-level operations, check ownership
            if hasattr(self, 'get_object'):
                try:
                    obj = self.get_object()
                    if hasattr(obj, 'shopowner') and obj.shopowner != request.user:
                        logger.warning(f"User {request.user.id} attempted unauthorized access to shop {obj.shopId}")
                        return Response({
                            'error': 'Access denied',
                            'detail': 'You do not have permission to access this shop.'
                        }, status=status.HTTP_403_FORBIDDEN)
                except Exception as e:
                    logger.error(f"Error checking object permissions in {action_name}: {e}")
                    return Response({
                        'error': 'Permission validation error',
                        'detail': 'Could not validate permissions for this operation.'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            logger.info(f"ViewSet action {action_name} executed by user {request.user.id}")
            return view_func(self, request, *args, **kwargs)
        
        return wrapper
    return decorator
