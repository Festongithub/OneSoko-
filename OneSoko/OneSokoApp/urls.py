from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'categories', views.BusinessCategoryViewSet, basename='categories')
router.register(r'shops', views.ShopViewSet, basename='shops')
router.register(r'my-shops', views.MyShopsViewSet, basename='my-shops')

# API patterns
api_patterns = [
    # Specific endpoints that need to come BEFORE router.urls to avoid conflicts
    path('api/shops/public_list/', views.shop_public_list, name='shop_public_list'),
    path('api/shops/quick-create/', views.quick_create_shop, name='quick_create_shop'),
    path('api/shops/search/', views.search_shops, name='search_shops'),
    path('api/shops/autocomplete/', views.autocomplete_shops, name='autocomplete_shops'),
    path('api/shops/by-location/', views.shops_by_location, name='shops_by_location'),
    path('api/shops/trending/', views.trending_shops, name='trending_shops'),
    path('api/userprofiles/me/', views.user_profile_me, name='user_profile_me'),
    path('api/api/user/me/', views.user_profile_me, name='user_profile_me_alt'),  # Alternative path
    path('api/cart/item_count/', views.cart_item_count, name='cart_item_count'),
    path('api/messages/unread_count/', views.messages_unread_count, name='messages_unread_count'),
    path('api/messages/conversations/', views.messages_conversations, name='messages_conversations'),
    path('api/categories/stats/', views.categories_stats, name='categories_stats'),
    path('api/categories/<int:category_id>/products/', views.category_products, name='category_products'),
    
    # Router URLs (these should come after specific patterns)
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/user/profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('api/user-shops/', views.UserShopsView.as_view(), name='user_shops'),
    path('api/shop-stats/', views.shop_stats, name='shop_stats'),
]

# Main URL patterns
urlpatterns = [
    # API endpoints
    path('', include(api_patterns)),
    
    # Health check endpoint
    path('health/', views.health_check, name='health_check'),
]
