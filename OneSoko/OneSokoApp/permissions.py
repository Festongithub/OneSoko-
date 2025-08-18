from rest_framework import permissions

class IsShopOwner(permissions.BasePermission):
    """Allows access only to users with is_shopowner=True in their UserProfile."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            getattr(request.user.profile, 'is_shopowner', False)
        )


class IsShopOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission that allows shop owners to edit their own content,
    and everyone to read.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions require shop owner status
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            getattr(request.user.profile, 'is_shopowner', False)
        )
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions require the shop owner to own the object
        if hasattr(obj, 'shop'):
            return obj.shop.shopowner == request.user
        elif hasattr(obj, 'shopowner'):
            return obj.shopowner == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False 