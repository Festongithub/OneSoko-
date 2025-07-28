from rest_framework import permissions

class IsShopOwner(permissions.BasePermission):
    """Allows access only to users with is_shopowner=True in their UserProfile."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            getattr(request.user.profile, 'is_shopowner', False)
        ) 