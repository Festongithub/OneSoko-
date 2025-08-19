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
    get_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    notification_summary,
    clear_read_notifications,
    create_test_notifications,
)
from .order_management_views import (
    EnhancedOrderViewSet,
    create_order_from_cart,
    order_reports,
)
from .analytics_views import (
    AnalyticsViewSet,
    generate_sales_forecast,
)
from .loyalty_views import (
    LoyaltyProgramViewSet,
    CustomerLoyaltyViewSet,
    process_order_loyalty_points,
    referral_info,
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
router.register(r'enhanced-orders', EnhancedOrderViewSet, basename='enhanced-orders')  # Enhanced order management
router.register(r'analytics', AnalyticsViewSet, basename='analytics')  # Business analytics
router.register(r'loyalty-programs', LoyaltyProgramViewSet, basename='loyalty-programs')  # Loyalty program management
router.register(r'customer-loyalty', CustomerLoyaltyViewSet, basename='customer-loyalty')  # Customer loyalty accounts
router.register(r'orderitems', OrderItemViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'wishlists', WishlistViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
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
    
    # Notification endpoints
    path('api/notifications/', get_notifications, name='get_notifications'),
    path('api/notifications/<int:notification_id>/read/', mark_notification_read, name='mark_notification_read'),
    path('api/notifications/mark-all-read/', mark_all_notifications_read, name='mark_all_notifications_read'),
    path('api/notifications/summary/', notification_summary, name='notification_summary'),
    path('api/notifications/clear-read/', clear_read_notifications, name='clear_read_notifications'),
    path('api/notifications/create-test/', create_test_notifications, name='create_test_notifications'),
    
    # Enhanced Order Management endpoints
    path('api/orders/create-from-cart/', create_order_from_cart, name='create_order_from_cart'),
    path('api/orders/reports/', order_reports, name='order_reports'),
    
    # Advanced Analytics endpoints
    path('api/analytics/forecast/', generate_sales_forecast, name='generate_sales_forecast'),
    
    # Customer Loyalty & Rewards endpoints
    path('api/loyalty/process-order-points/', process_order_loyalty_points, name='process_order_loyalty_points'),
    path('api/loyalty/referral-info/', referral_info, name='referral_info'),
] 
