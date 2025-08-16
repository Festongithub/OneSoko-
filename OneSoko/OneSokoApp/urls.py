from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, ShopViewSet, CategoryViewSet, TagViewSet, ReviewViewSet, ProductVariantViewSet, UserProfileViewSet, OrderViewSet, OrderItemViewSet, PaymentViewSet, WishlistViewSet, MessageViewSet, NotificationViewSet, UserRegistrationViewSet, ShopownerRegistrationViewSet, ShopOwnerInfoViewSet,
    ShopReviewViewSet, ShopReviewResponseViewSet, ShopRatingSummaryViewSet, ReviewHelpfulVoteViewSet, ShopWithReviewsViewSet
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .auth_views import (
    CustomTokenObtainPairView,
    register_user,
    register_shop_owner,
    oauth_login,
    user_profile,
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
router.register(r'users', UserRegistrationViewSet, basename='user-registration')
router.register(r'shopowners', ShopownerRegistrationViewSet, basename='shopowner-registration')
router.register(r'shop-owner-info', ShopOwnerInfoViewSet, basename='shop-owner-info')

# Shop Review System Routes
router.register(r'shop-reviews', ShopReviewViewSet, basename='shop-reviews')
router.register(r'shop-review-responses', ShopReviewResponseViewSet, basename='shop-review-responses')
router.register(r'shop-rating-summaries', ShopRatingSummaryViewSet, basename='shop-rating-summaries')
router.register(r'review-helpful-votes', ReviewHelpfulVoteViewSet, basename='review-helpful-votes')
router.register(r'shops-with-reviews', ShopWithReviewsViewSet, basename='shops-with-reviews')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('api/', include(router.urls)),
]

# Authentication URLs
urlpatterns += [
    # JWT Token endpoints
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Registration endpoints
    path('api/auth/register/', register_user, name='register_user'),
    path('api/auth/register/shop-owner/', register_shop_owner, name='register_shop_owner'),
    
    # OAuth endpoints
    path('api/auth/oauth/', oauth_login, name='oauth_login'),
    
    # Profile endpoint
    path('api/auth/profile/', user_profile, name='user_profile'),
] 
