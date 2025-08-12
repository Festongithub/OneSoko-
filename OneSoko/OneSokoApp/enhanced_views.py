"""
Enhanced Views for OneSoko Application
Provides optimized database queries, better security, and improved performance
"""

from django.db import models
from django.core.cache import cache
from django.db.models import Prefetch, Q, Count, Avg, Sum
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Shop, Product, Category, Review, Order, Message, 
    UserProfile, Cart, CartItem, Notification, ProductInquiry
)
from .serializers import (
    ShopSerializer, ProductSerializer, CategorySerializer, ReviewSerializer,
    OrderSerializer, MessageSerializer, UserProfileSerializer, CartSerializer,
    NotificationSerializer, ProductInquirySerializer
)
from .permissions import (
    IsShopOwner, IsShopOwnerOrReadOnly, IsMessageParticipant,
    IsOrderParticipant, IsReviewAuthor, IsProductOwner,
    IsInquiryParticipant, IsShopOwnerOrCustomer, IsPaymentParticipant,
    IsWishlistOwner, IsNotificationOwner, IsCartOwner,
    IsPublicOrAuthenticated, IsShopOwnerForInventory, IsShopOwnerForAnalytics
)
from .api_config import API_PERFORMANCE_CONFIG, CACHE_STRATEGY
from .enhanced_messaging import EnhancedMessageManager, ShopMessagingManager
import logging

logger = logging.getLogger(__name__)

class OptimizedPagination(PageNumberPagination):
    """Optimized pagination with configurable page sizes"""
    
    page_size = API_PERFORMANCE_CONFIG['PAGINATION']['DEFAULT_PAGE_SIZE']
    max_page_size = API_PERFORMANCE_CONFIG['PAGINATION']['MAX_PAGE_SIZE']
    page_size_query_param = API_PERFORMANCE_CONFIG['PAGINATION']['PAGE_SIZE_QUERY_PARAM']


class EnhancedShopViewSet(viewsets.ModelViewSet):
    """
    Enhanced Shop ViewSet with optimized queries and security
    """
    
    serializer_class = ShopSerializer
    pagination_class = OptimizedPagination
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'description', 'city', 'country']
    ordering_fields = ['name', 'created_at', 'total_orders', 'total_sales']
    filterset_fields = ['status', 'city', 'country']
    
    def get_queryset(self):
        """Optimized queryset with select_related and prefetch_related"""
        queryset = Shop.objects.select_related(
            'shopowner',
            'shopowner__profile'
        ).prefetch_related(
            'products',
            'products__category',
            'products__tags'
        ).annotate(
            product_count=Count('products'),
            review_count=Count('reviews'),
            avg_rating=Avg('reviews__rating')
        )
        
        # Apply filters
        if self.action == 'list':
            queryset = queryset.filter(status='active')
        
        return queryset
    
    def get_permissions(self):
        """Dynamic permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsShopOwner]
        elif self.action in ['public_list', 'public_detail', 'search']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsShopOwnerOrReadOnly]
        
        return [permission() for permission in permission_classes]
    
    @method_decorator(cache_page(API_PERFORMANCE_CONFIG['CACHE_TTL']['SHOPS']))
    @method_decorator(vary_on_cookie)
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_list(self, request):
        """Get all public shops with caching"""
        shops = self.get_queryset().filter(status='active')
        
        # Apply search and filters
        search = request.query_params.get('search')
        if search:
            shops = shops.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(city__icontains=search) |
                Q(country__icontains=search)
            )
        
        # Apply ordering
        ordering = request.query_params.get('ordering', '-created_at')
        shops = shops.order_by(ordering)
        
        page = self.paginate_queryset(shops)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_detail(self, request, pk=None):
        """Get public shop details with optimized queries"""
        try:
            shop = self.get_queryset().get(shopId=pk, status='active')
            serializer = self.get_serializer(shop)
            return Response(serializer.data)
        except Shop.DoesNotExist:
            return Response(
                {'error': 'Shop not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search(self, request):
        """Enhanced shop search with multiple criteria"""
        query = request.query_params.get('q', '')
        location = request.query_params.get('location', '')
        category = request.query_params.get('category', '')
        
        shops = self.get_queryset().filter(status='active')
        
        if query:
            shops = shops.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(products__name__icontains=query) |
                Q(products__description__icontains=query)
            ).distinct()
        
        if location:
            shops = shops.filter(
                Q(city__icontains=location) |
                Q(country__icontains=location)
            )
        
        if category:
            shops = shops.filter(products__category__name__icontains=category).distinct()
        
        # Apply ordering by relevance or popularity
        ordering = request.query_params.get('ordering', '-total_orders')
        shops = shops.order_by(ordering)
        
        page = self.paginate_queryset(shops)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_shops(self, request):
        """Get shops owned by current user"""
        shops = self.get_queryset().filter(shopowner=request.user)
        serializer = self.get_serializer(shops, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get shop analytics (shop owners only)"""
        try:
            shop = self.get_queryset().get(shopId=pk, shopowner=request.user)
            
            # Get analytics data
            analytics = {
                'total_products': shop.products.count(),
                'total_orders': shop.orders.count(),
                'total_sales': shop.orders.aggregate(
                    total=Sum('total_amount')
                )['total'] or 0,
                'avg_rating': shop.reviews.aggregate(
                    avg=Avg('rating')
                )['avg'] or 0,
                'recent_orders': shop.orders.order_by('-created_at')[:10],
                'top_products': shop.products.annotate(
                    order_count=Count('order_items')
                ).order_by('-order_count')[:5],
            }
            
            return Response(analytics)
        except Shop.DoesNotExist:
            return Response(
                {'error': 'Shop not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class EnhancedProductViewSet(viewsets.ModelViewSet):
    """
    Enhanced Product ViewSet with optimized queries
    """
    
    serializer_class = ProductSerializer
    pagination_class = OptimizedPagination
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['name', 'price', 'created_at', 'quantity']
    filterset_fields = ['category', 'is_active', 'shop']
    
    def get_queryset(self):
        """Optimized queryset with related data"""
        queryset = Product.objects.select_related(
            'shop',
            'shop__shopowner',
            'category'
        ).prefetch_related(
            'tags',
            'variants',
            'reviews'
        ).annotate(
            review_count=Count('reviews'),
            avg_rating=Avg('reviews__rating'),
            order_count=Count('order_items')
        )
        
        if self.action == 'list':
            queryset = queryset.filter(is_active=True)
        
        return queryset
    
    def get_permissions(self):
        """Dynamic permissions"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsProductOwner]
        elif self.action in ['public_list', 'public_detail']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsPublicOrAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    @method_decorator(cache_page(API_PERFORMANCE_CONFIG['CACHE_TTL']['PRODUCTS']))
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_list(self, request):
        """Get public products with caching"""
        products = self.get_queryset().filter(is_active=True)
        
        # Apply filters
        category = request.query_params.get('category')
        if category:
            products = products.filter(category__name__icontains=category)
        
        shop_id = request.query_params.get('shop')
        if shop_id:
            products = products.filter(shop__shopId=shop_id)
        
        # Apply ordering
        ordering = request.query_params.get('ordering', '-created_at')
        products = products.order_by(ordering)
        
        page = self.paginate_queryset(products)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_products(self, request):
        """Get products owned by current user"""
        products = self.get_queryset().filter(shop__shopowner=request.user)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        """Get product variants"""
        try:
            product = self.get_queryset().get(productId=pk)
            variants = product.variants.all()
            serializer = ProductVariantSerializer(variants, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class EnhancedMessageViewSet(viewsets.ModelViewSet):
    """
    Enhanced Message ViewSet with real-time capabilities
    """
    
    serializer_class = MessageSerializer
    pagination_class = OptimizedPagination
    permission_classes = [IsMessageParticipant]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.message_manager = EnhancedMessageManager()
        self.shop_messaging = ShopMessagingManager()
    
    def get_queryset(self):
        """Get messages for current user"""
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        ).select_related(
            'sender',
            'sender__profile',
            'recipient',
            'recipient__profile',
            'shop',
            'product',
            'order'
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get all conversations for current user"""
        conversations = self.message_manager.get_user_conversations(request.user)
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def with_user(self, request):
        """Get conversation with specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = User.objects.get(id=user_id)
            limit = int(request.query_params.get('limit', 50))
            offset = int(request.query_params.get('offset', 0))
            
            messages = self.message_manager.get_conversation(
                request.user, other_user, limit, offset
            )
            
            serializer = self.get_serializer(messages, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark message as read"""
        try:
            message = self.message_manager.mark_as_read(pk, request.user)
            serializer = self.get_serializer(message)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread message count"""
        count = self.message_manager.get_unread_count(request.user)
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'])
    def shop_conversations(self, request):
        """Get shop-related conversations (shop owners only)"""
        if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
            return Response(
                {'error': 'Only shop owners can access shop conversations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        conversations = self.shop_messaging.get_shop_conversations(request.user)
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)


class EnhancedOrderViewSet(viewsets.ModelViewSet):
    """
    Enhanced Order ViewSet with optimized queries
    """
    
    serializer_class = OrderSerializer
    pagination_class = OptimizedPagination
    permission_classes = [IsOrderParticipant]
    
    def get_queryset(self):
        """Get orders for current user or shop"""
        user = self.request.user
        
        if hasattr(user, 'profile') and user.profile.is_shopowner:
            # Shop owner: get orders for their shops
            return Order.objects.filter(
                items__product__shop__shopowner=user
            ).select_related(
                'customer',
                'customer__profile'
            ).prefetch_related(
                'items',
                'items__product',
                'items__product__shop'
            ).distinct()
        else:
            # Customer: get their own orders
            return Order.objects.filter(
                customer=user
            ).select_related(
                'customer',
                'customer__profile'
            ).prefetch_related(
                'items',
                'items__product',
                'items__product__shop'
            )
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get current user's orders"""
        orders = self.get_queryset()
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status (shop owners only)"""
        try:
            order = self.get_queryset().get(id=pk)
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order.status = new_status
            order.save()
            
            # Send notification to customer
            self.send_order_update_notification(order, new_status)
            
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def send_order_update_notification(self, order, status):
        """Send notification for order status update"""
        message_manager = EnhancedMessageManager()
        
        status_messages = {
            'processing': 'Your order is being processed',
            'shipped': 'Your order has been shipped',
            'delivered': 'Your order has been delivered',
            'cancelled': 'Your order has been cancelled'
        }
        
        message_content = status_messages.get(status, f'Order status updated to {status}')
        
        try:
            message_manager.create_message(
                sender=order.items.first().product.shop.shopowner,
                recipient=order.customer,
                content=message_content,
                message_type='order_update',
                order=order
            )
        except Exception as e:
            logger.error(f"Failed to send order update notification: {e}")


class EnhancedReviewViewSet(viewsets.ModelViewSet):
    """
    Enhanced Review ViewSet with optimized queries
    """
    
    serializer_class = ReviewSerializer
    pagination_class = OptimizedPagination
    permission_classes = [IsReviewAuthor]
    
    def get_queryset(self):
        """Optimized queryset for reviews"""
        return Review.objects.select_related(
            'user',
            'user__profile',
            'product',
            'product__shop',
            'shop'
        ).order_by('-created_at')
    
    @method_decorator(cache_page(API_PERFORMANCE_CONFIG['CACHE_TTL']['REVIEWS']))
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def by_product(self, request):
        """Get reviews for a specific product"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reviews = self.get_queryset().filter(product__productId=product_id)
        
        # Apply rating filter
        rating = request.query_params.get('rating')
        if rating:
            reviews = reviews.filter(rating=rating)
        
        page = self.paginate_queryset(reviews)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """Get current user's reviews"""
        reviews = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


class EnhancedCartViewSet(viewsets.ModelViewSet):
    """
    Enhanced Cart ViewSet with optimized queries
    """
    
    serializer_class = CartSerializer
    permission_classes = [IsCartOwner]
    
    def get_queryset(self):
        """Get cart for current user"""
        return Cart.objects.filter(
            user=self.request.user
        ).prefetch_related(
            'items',
            'items__product',
            'items__product__shop'
        )
    
    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """Get current user's cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart with validation"""
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(productId=product_id, is_active=True)
            cart, created = Cart.objects.get_or_create(user=request.user)
            
            # Check if item already exists in cart
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class EnhancedNotificationViewSet(viewsets.ModelViewSet):
    """
    Enhanced Notification ViewSet
    """
    
    serializer_class = NotificationSerializer
    permission_classes = [IsNotificationOwner]
    
    def get_queryset(self):
        """Get notifications for current user"""
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        try:
            notification = self.get_queryset().get(id=pk)
            notification.is_read = True
            notification.save()
            serializer = self.get_serializer(notification)
            return Response(serializer.data)
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'success'})


# Import missing serializers
from .serializers import (
    ProductVariantSerializer, ConversationSerializer
)
from django.contrib.auth.models import User 