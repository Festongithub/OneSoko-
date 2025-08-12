from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, ShopViewSet, CategoryViewSet, TagViewSet, ReviewViewSet, ProductVariantViewSet, UserProfileViewSet, OrderViewSet, OrderItemViewSet, PaymentViewSet, WishlistViewSet, MessageViewSet, NotificationViewSet, ProductInquiryViewSet, UserRegistrationViewSet, ShopownerRegistrationViewSet, CartViewSet, UserViewSet
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
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
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'orderitems', OrderItemViewSet, basename='orderitem')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'wishlists', WishlistViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'inquiries', ProductInquiryViewSet, basename='inquiry')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'user-registration', UserRegistrationViewSet, basename='user-registration')
router.register(r'shopowner-registration', ShopownerRegistrationViewSet, basename='shopowner-registration')
router.register(r'user', UserViewSet, basename='user')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('api/', include(router.urls)),
]
urlpatterns += [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] 