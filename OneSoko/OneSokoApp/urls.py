from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, ShopViewSet, CategoryViewSet, TagViewSet, ReviewViewSet, ProductVariantViewSet, UserProfileViewSet, OrderViewSet, OrderItemViewSet, PaymentViewSet, WishlistViewSet, MessageViewSet, NotificationViewSet
)

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'shops', ShopViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'variants', ProductVariantViewSet)
router.register(r'userprofiles', UserProfileViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'orderitems', OrderItemViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'wishlists', WishlistViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'notifications', NotificationViewSet)

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('api/', include(router.urls)),
] 