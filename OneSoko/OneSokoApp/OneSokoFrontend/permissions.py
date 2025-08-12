from rest_framework import permissions
from django.core.cache import cache
from django.contrib.auth.models import User
from .models import Shop, UserProfile
import logging

logger = logging.getLogger(__name__)

class IsShopOwner(permissions.BasePermission):
    """
    Allows access only to users with is_shopowner=True in their UserProfile.
    For object-level permissions, ensures users can only access their own shops.
    """
    
    def has_permission(self, request, view):
        # User must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # User must have a profile and be marked as shop owner
        if not hasattr(request.user, 'profile'):
            return False
            
        try:
            return getattr(request.user.profile, 'is_shopowner', False)
        except Exception as e:
            logger.warning(f"Error checking shop owner status for user {request.user.id}: {e}")
            return False
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user owns the specific shop object or related object.
        Only shop owners can access their own shops and related resources.
        """
        # User must pass permission check first
        if not self.has_permission(request, view):
            return False
        
        # Check ownership based on object type
        if hasattr(obj, 'shopowner'):
            # Direct shop object
            is_owner = obj.shopowner == request.user
            if not is_owner:
                logger.warning(f"User {request.user.id} attempted to access shop {obj.shopId} owned by {obj.shopowner.id}")
            return is_owner
        elif hasattr(obj, 'shop'):
            # Object related to a shop (like products, orders)
            is_owner = obj.shop.shopowner == request.user
            if not is_owner:
                logger.warning(f"User {request.user.id} attempted to access resource related to shop {obj.shop.shopId} owned by {obj.shop.shopowner.id}")
            return is_owner
        elif hasattr(obj, 'product') and hasattr(obj.product, 'shop'):
            # Object related to a product in a shop
            is_owner = obj.product.shop.shopowner == request.user
            if not is_owner:
                logger.warning(f"User {request.user.id} attempted to access product resource in shop {obj.product.shop.shopId} owned by {obj.product.shop.shopowner.id}")
            return is_owner
        
        # If we can't determine ownership, deny access for security
        logger.warning(f"Could not determine ownership for object {type(obj)} by user {request.user.id}")
        return False


class IsShopOwnerOrReadOnly(permissions.BasePermission):
    """Allow shop owners to edit their shops, others can only read."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            getattr(request.user.profile, 'is_shopowner', False)
        )
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if hasattr(obj, 'shopowner'):
            return obj.shopowner == request.user
        elif hasattr(obj, 'shop'):
            return obj.shop.shopowner == request.user
        return False


class IsShopOwnerForManagement(permissions.BasePermission):
    """
    Strict permission for shop management operations.
    Only allows shop owners to manage their own shops and related resources.
    No read-only access for non-owners.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # Must be a shop owner
        if not hasattr(request.user, 'profile'):
            return False
            
        try:
            return getattr(request.user.profile, 'is_shopowner', False)
        except Exception as e:
            logger.warning(f"Error checking shop owner status for management operation by user {request.user.id}: {e}")
            return False
    
    def has_object_permission(self, request, view, obj):
        """Only allow access to shop owner's own resources"""
        if not self.has_permission(request, view):
            return False
        
        # Determine ownership
        if hasattr(obj, 'shopowner'):
            return obj.shopowner == request.user
        elif hasattr(obj, 'shop'):
            return obj.shop.shopowner == request.user
        elif hasattr(obj, 'product') and hasattr(obj.product, 'shop'):
            return obj.product.shop.shopowner == request.user
        
        # Deny access if ownership cannot be determined
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow users to edit only their own profile."""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the profile.
        return obj.user == request.user


class IsProfileOwner(permissions.BasePermission):
    """Allow users to access only their own profile."""
    
    def has_permission(self, request, view):
        # Allow admin users to access all profiles
        if request.user.is_staff:
            return True
        
        # For non-admin users, only allow access to their own profile
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Allow admin users to access all profiles
        if request.user.is_staff:
            return True
        
        # Users can only access their own profile
        return obj.user == request.user 


class IsShopOwnerForShopOperations(permissions.BasePermission):
    """Enhanced permission for shop-specific operations"""
    
    def has_permission(self, request, view):
        # Always allow read operations
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For write operations, check if user is shop owner
        if not request.user.is_authenticated:
            return False
        
        # Check if user has shop owner profile
        try:
            profile = request.user.profile
            return profile.is_shopowner
        except UserProfile.DoesNotExist:
            return False
    
    def has_object_permission(self, request, view, obj):
        # Always allow read operations
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For write operations, check ownership
        if hasattr(obj, 'shopowner'):
            return obj.shopowner == request.user
        elif hasattr(obj, 'shop'):
            return obj.shop.shopowner == request.user
        elif hasattr(obj, 'product'):
            return obj.product.shop.shopowner == request.user
        
        return False


class IsMessageParticipant(permissions.BasePermission):
    """Allow access only to participants in a message conversation"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Users can only access messages they sent or received
        return obj.sender == request.user or obj.recipient == request.user


class IsOrderParticipant(permissions.BasePermission):
    """Allow access only to order participants (customer or shop owner)"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Customers can access their own orders
        if obj.customer == request.user:
            return True
        
        # Shop owners can access orders for their shops
        if hasattr(request.user, 'profile') and request.user.profile.is_shopowner:
            if hasattr(obj, 'shop'):
                return obj.shop.shopowner == request.user
            elif hasattr(obj, 'items'):
                # Check if any item belongs to user's shop
                return obj.items.filter(product__shop__shopowner=request.user).exists()
        
        return False


class IsReviewAuthor(permissions.BasePermission):
    """Allow access only to review authors"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only the author can edit/delete their review
        return obj.user == request.user


class IsProductOwner(permissions.BasePermission):
    """Allow access only to product owners (shop owners)"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            getattr(request.user.profile, 'is_shopowner', False)
        )
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user owns the shop that contains this product
        if hasattr(obj, 'shop'):
            return obj.shop.shopowner == request.user
        elif hasattr(obj, 'product'):
            return obj.product.shop.shopowner == request.user
        
        return False


class IsInquiryParticipant(permissions.BasePermission):
    """Allow access only to inquiry participants (customer or shop owner)"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Customers can access their own inquiries
        if obj.customer == request.user:
            return True
        
        # Shop owners can access inquiries for their products
        if hasattr(request.user, 'profile') and request.user.profile.is_shopowner:
            return obj.product.shop.shopowner == request.user
        
        return False


class RateLimitPermission(permissions.BasePermission):
    """Rate limiting permission for API endpoints"""
    
    def has_permission(self, request, view):
        # Get rate limit settings from view
        rate_limit = getattr(view, 'rate_limit', None)
        if not rate_limit:
            return True
        
        # Check rate limit
        cache_key = f"rate_limit:{request.user.id}:{view.__class__.__name__}"
        current_count = cache.get(cache_key, 0)
        
        if current_count >= rate_limit:
            logger.warning(f"Rate limit exceeded for user {request.user.id} on {view.__class__.__name__}")
            return False
        
        # Increment counter
        cache.set(cache_key, current_count + 1, 60)  # 1 minute expiry
        return True


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow admins full access, others read-only"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff


class IsShopOwnerOrCustomer(permissions.BasePermission):
    """Allow shop owners and customers access to order-related operations"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Customers can access their own orders
        if hasattr(obj, 'customer') and obj.customer == request.user:
            return True
        
        # Shop owners can access orders for their shops
        if hasattr(request.user, 'profile') and request.user.profile.is_shopowner:
            if hasattr(obj, 'shop'):
                return obj.shop.shopowner == request.user
            elif hasattr(obj, 'items'):
                return obj.items.filter(product__shop__shopowner=request.user).exists()
        
        return False


class IsPaymentParticipant(permissions.BasePermission):
    """Allow access only to payment participants"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Customers can access their own payments
        if obj.order.customer == request.user:
            return True
        
        # Shop owners can access payments for their orders
        if hasattr(request.user, 'profile') and request.user.profile.is_shopowner:
            return obj.order.items.filter(product__shop__shopowner=request.user).exists()
        
        return False


class IsWishlistOwner(permissions.BasePermission):
    """Allow access only to wishlist owners"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsNotificationOwner(permissions.BasePermission):
    """Allow access only to notification owners"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsCartOwner(permissions.BasePermission):
    """Allow access only to cart owners"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsPublicOrAuthenticated(permissions.BasePermission):
    """Allow public read access, authenticated users for write operations"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated


class IsShopOwnerForInventory(permissions.BasePermission):
    """Special permission for inventory management operations"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            getattr(request.user.profile, 'is_shopowner', False)
        )
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Check if user owns the shop that contains this inventory item
        if hasattr(obj, 'shop'):
            return obj.shop.shopowner == request.user
        elif hasattr(obj, 'product'):
            return obj.product.shop.shopowner == request.user
        
        return False


class IsShopOwnerForAnalytics(permissions.BasePermission):
    """Permission for shop analytics and reporting"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            getattr(request.user.profile, 'is_shopowner', False)
        )
    
    def has_object_permission(self, request, view, obj):
        # Shop owners can access analytics for their shops
        if hasattr(obj, 'shop'):
            return obj.shop.shopowner == request.user
        elif hasattr(obj, 'shopowner'):
            return obj.shopowner == request.user
        
        return False 