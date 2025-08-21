from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Product, Shop, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, Wishlist, Message, Notification,
    ShopReview, ShopReviewResponse, ShopRatingSummary, ReviewHelpfulVote, EmailSubscription
)
from .serializers import (
    ProductSerializer, ShopSerializer, CategorySerializer, TagSerializer, ReviewSerializer, ProductVariantSerializer, UserProfileSerializer, OrderSerializer, OrderItemSerializer, PaymentSerializer, WishlistSerializer, MessageSerializer, NotificationSerializer,
    ShopReviewSerializer, ShopReviewCreateSerializer, ShopReviewResponseSerializer, ShopRatingSummarySerializer, ReviewHelpfulVoteSerializer, ShopWithReviewsSerializer, EmailSubscriptionSerializer
)
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, ShopownerRegistrationSerializer
from rest_framework import permissions, serializers
from rest_framework import mixins
from .permissions import IsShopOwner
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

# Create your views here.

# Shop Filter for advanced filtering
class ShopFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    description = django_filters.CharFilter(lookup_expr='icontains')
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    country = django_filters.CharFilter(field_name='country', lookup_expr='icontains')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Shop
        fields = ['name', 'description', 'location', 'city', 'country', 'search']

    def filter_search(self, queryset, name, value):
        """
        Custom search filter that searches across multiple fields
        """
        return queryset.filter(
            Q(name__icontains=value) |
            Q(description__icontains=value) |
            Q(location__icontains=value) |
            Q(city__icontains=value) |
            Q(country__icontains=value) |
            Q(shopowner__first_name__icontains=value) |
            Q(shopowner__last_name__icontains=value)
        )

# Product Filter for advanced filtering
# Product ViewSet
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price']
    ordering = ['name']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        Allow read-only access for unauthenticated users, require authentication for modifications.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

# Shop ViewSet with enhanced search and filtering
class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.filter(is_active=True).select_related('shopowner').prefetch_related('products')
    serializer_class = ShopSerializer
    permission_classes = [IsShopOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ShopFilter
    search_fields = ['name', 'description', 'location', 'city', 'country', 'shopowner__first_name', 'shopowner__last_name']
    ordering_fields = ['name', 'created_at', 'views', 'total_sales']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'search', 'locations']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsShopOwner]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Returns all shops that are not suspended.
        For customer-facing view, we show active and pending shops.
        """
        # Show all shops except suspended ones
        queryset = Shop.objects.exclude(status='suspended').select_related('shopowner').prefetch_related('products')
        
        # Add product count annotation
        queryset = queryset.annotate(products_count=Count('products'))
        
        # Filter by shop owner if 'owner=me' parameter is provided
        owner = self.request.query_params.get('owner', None)
        if owner == 'me' and self.request.user.is_authenticated:
            queryset = queryset.filter(shopowner=self.request.user)
        
        return queryset

    def perform_create(self, serializer):
        # Automatically set the shopowner to the current user
        serializer.save(shopowner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve to increment view count
        """
        instance = self.get_object()
        # Increment view count
        instance.views += 1
        instance.save(update_fields=['views'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def locations(self, request):
        """
        Get unique locations from all shops
        """
        queryset = self.get_queryset()
        
        # Get all unique location values
        locations = set()
        
        # Add locations from location field
        location_values = queryset.values_list('location', flat=True).distinct()
        for location in location_values:
            if location and location.strip():
                locations.add(location.strip())
                # Also add individual parts if comma-separated
                if ',' in location:
                    parts = [part.strip() for part in location.split(',')]
                    locations.update(parts)
        
        # Add locations from city field
        city_values = queryset.values_list('city', flat=True).distinct()
        for city in city_values:
            if city and city.strip():
                locations.add(city.strip())
        
        # Add locations from country field
        country_values = queryset.values_list('country', flat=True).distinct()
        for country in country_values:
            if country and country.strip():
                locations.add(country.strip())
        
        # Remove empty strings and sort
        locations = sorted([loc for loc in locations if loc])
        
        return Response(locations)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Advanced search endpoint for shops
        """
        query = request.query_params.get('q', '')
        location = request.query_params.get('location', '')
        verified_only = request.query_params.get('verified', '').lower() == 'true'
        sort_by = request.query_params.get('sort', 'name')
        
        queryset = self.get_queryset()
        
        # Apply search query
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(location__icontains=query) |
                Q(city__icontains=query) |
                Q(shopowner__first_name__icontains=query) |
                Q(shopowner__last_name__icontains=query)
            )
        
        # Filter by location
        if location:
            queryset = queryset.filter(
                Q(location__icontains=location) |
                Q(city__icontains=location) |
                Q(country__icontains=location)
            )
        
        # Filter verified shops only
        if verified_only:
            # Note: Shop model doesn't have is_verified field currently
            # queryset = queryset.filter(is_verified=True)
            pass
        
        # Apply sorting
        if sort_by == 'name':
            queryset = queryset.order_by('name')
        elif sort_by == 'name_desc':
            queryset = queryset.order_by('-name')
        elif sort_by == 'created_at':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'created_at_desc':
            queryset = queryset.order_by('created_at')
        elif sort_by == 'products_count':
            queryset = queryset.order_by('-products_count')
        elif sort_by == 'rating':
            # For now, random order since we don't have ratings implemented
            queryset = queryset.order_by('?')
        elif sort_by == 'views':
            queryset = queryset.order_by('-views')
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        shop = self.get_object()
        products = shop.products.filter(is_active=True)
        
        # Optional product filtering within shop
        search = request.query_params.get('search', '')
        category = request.query_params.get('category', '')
        
        if search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        if category:
            products = products.filter(category__name__icontains=category)
        
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_product(self, request, pk=None):
        shop = self.get_object()
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            shop.products.add(product)
            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='products/(?P<product_id>[^/.]+)')
    def delete_product(self, request, pk=None, product_id=None):
        shop = self.get_object()
        try:
            product = shop.products.get(pk=product_id)
            shop.products.remove(product)
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found in this shop.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get popular shops based on views and products count
        """
        queryset = self.get_queryset().order_by('-views', '-products_count')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured shops (shops with most products)
        """
        queryset = self.get_queryset().order_by('-products_count', '-views')[:6]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# Category ViewSet
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# Tag ViewSet
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

# Review ViewSet
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

# ProductVariant ViewSet
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer

# UserProfile ViewSet
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

# Order ViewSet
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

# OrderItem ViewSet
class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

# Payment ViewSet
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

# Wishlist ViewSet
class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer

# Message ViewSet
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

# Notification ViewSet
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return notifications for the current user only.
        Filter by type and read status if provided.
        """
        user = self.request.user
        queryset = Notification.objects.filter(user=user)
        
        # Filter by notification type
        notification_type = self.request.query_params.get('type', None)
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the current user."""
        updated_count = Notification.objects.filter(
            user=request.user, 
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': f'Marked {updated_count} notifications as read',
            'updated_count': updated_count
        })
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a specific notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        
        return Response({
            'message': 'Notification marked as read',
            'notification': self.get_serializer(notification).data
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications for the current user."""
        count = Notification.objects.filter(
            user=request.user, 
            is_read=False
        ).count()
        
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get notification summary with counts by type and priority."""
        from django.db.models import Count
        
        user = request.user
        
        # Count by type
        type_counts = Notification.objects.filter(user=user, is_read=False)\
            .values('type')\
            .annotate(count=Count('type'))\
            .order_by('type')
        
        # Count by priority
        priority_counts = Notification.objects.filter(user=user, is_read=False)\
            .values('priority')\
            .annotate(count=Count('priority'))\
            .order_by('priority')
        
        # Recent notifications (last 5)
        recent_notifications = Notification.objects.filter(user=user)\
            .order_by('-timestamp')[:5]
        
        return Response({
            'total_unread': Notification.objects.filter(user=user, is_read=False).count(),
            'type_counts': list(type_counts),
            'priority_counts': list(priority_counts),
            'recent_notifications': self.get_serializer(recent_notifications, many=True).data
        })
    
    @action(detail=False, methods=['delete'])
    def clear_read(self, request):
        """Delete all read notifications for the current user."""
        deleted_count, _ = Notification.objects.filter(
            user=request.user, 
            is_read=True
        ).delete()
        
        return Response({
            'message': f'Deleted {deleted_count} read notifications',
            'deleted_count': deleted_count
        })

# User registration viewset
class UserRegistrationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

# Shopowner registration viewset
class ShopownerRegistrationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = ShopownerRegistrationSerializer
    permission_classes = [permissions.AllowAny]

# Shop-Owner Information ViewSet (for admin/debugging purposes)
class ShopOwnerInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet to display shops with comprehensive owner information.
    Useful for verifying that shops are properly stored with owner credentials.
    """
    queryset = Shop.objects.select_related('shopowner').all()
    serializer_class = ShopSerializer
    permission_classes = [permissions.AllowAny]  # Change to IsAdminUser in production
    
    @action(detail=False, methods=['get'])
    def with_owners(self, request):
        """
        Get all shops with detailed owner information.
        """
        shops = Shop.objects.select_related('shopowner__userprofile').all()
        
        shop_data = []
        for shop in shops:
            shop_info = {
                'shop_id': str(shop.shopId),
                'shop_name': shop.name,
                'shop_description': shop.description,
                'shop_location': shop.location,
                'shop_status': shop.status,
                'shop_created': shop.created_at.isoformat(),
                'shop_analytics': {
                    'views': shop.views,
                    'total_sales': float(shop.total_sales),
                    'total_orders': shop.total_orders,
                },
                'owner_credentials': {
                    'user_id': shop.shopowner.id,
                    'username': shop.shopowner.username,
                    'email': shop.shopowner.email,
                    'first_name': shop.shopowner.first_name,
                    'last_name': shop.shopowner.last_name,
                    'full_name': shop.owner_full_name,
                    'date_joined': shop.shopowner.date_joined.isoformat(),
                },
                'owner_profile': {
                    'is_shopowner': getattr(shop.shopowner.userprofile, 'is_shopowner', False) if hasattr(shop.shopowner, 'userprofile') else False,
                    'phone_number': getattr(shop.shopowner.userprofile, 'phone_number', '') if hasattr(shop.shopowner, 'userprofile') else '',
                    'address': getattr(shop.shopowner.userprofile, 'address', '') if hasattr(shop.shopowner, 'userprofile') else '',
                },
                'shop_contact': {
                    'shop_email': shop.email,
                    'shop_phone': shop.phone,
                }
            }
            shop_data.append(shop_info)
        
        return Response({
            'count': len(shop_data),
            'shops_with_owners': shop_data
        })

    @action(detail=True, methods=['get'])
    def owner_details(self, request, pk=None):
        """
        Get detailed owner information for a specific shop.
        """
        shop = self.get_object()
        return Response(shop.full_shop_info)


# Shop Review System ViewSets

class ShopReviewFilter(django_filters.FilterSet):
    rating = django_filters.NumberFilter()
    rating_gte = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    rating_lte = django_filters.NumberFilter(field_name='rating', lookup_expr='lte')
    shop = django_filters.UUIDFilter(field_name='shop__id')
    customer = django_filters.CharFilter(field_name='customer__username', lookup_expr='icontains')
    is_verified_purchase = django_filters.BooleanFilter()
    status = django_filters.ChoiceFilter(choices=ShopReview.STATUS_CHOICES)
    
    class Meta:
        model = ShopReview
        fields = ['rating', 'rating_gte', 'rating_lte', 'shop', 'customer', 'is_verified_purchase', 'status']

class ShopReviewViewSet(viewsets.ModelViewSet):
    queryset = ShopReview.objects.all()
    serializer_class = ShopReviewSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ShopReviewFilter
    search_fields = ['title', 'review_text', 'customer__username']
    ordering_fields = ['created_at', 'rating', 'helpful_votes']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ShopReviewCreateSerializer
        return ShopReviewSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        # Check if user already reviewed this shop
        shop = serializer.validated_data['shop']
        if ShopReview.objects.filter(customer=self.request.user, shop=shop).exists():
            raise serializers.ValidationError("You have already reviewed this shop.")
        
        # Check if this is a verified purchase (you can implement this logic based on orders)
        # For now, we'll set it to False by default
        is_verified = False  # TODO: Check if user has purchased from this shop
        
        serializer.save(customer=self.request.user, is_verified_purchase=is_verified)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Only show approved reviews to non-owners
        if not self.request.user.is_authenticated or not hasattr(self.request.user, 'userprofile'):
            queryset = queryset.filter(status='approved')
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_shop(self, request):
        """Get reviews for a specific shop"""
        shop_id = request.query_params.get('shop_id')
        if not shop_id:
            return Response({'error': 'shop_id parameter is required'}, status=400)
        
        reviews = self.get_queryset().filter(shop_id=shop_id, status='approved')
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_helpful(self, request, pk=None):
        """Toggle helpful vote for a review"""
        review = self.get_object()
        
        # Check if user already voted
        existing_vote = ReviewHelpfulVote.objects.filter(
            review=review, customer=request.user
        ).first()
        
        is_helpful = request.data.get('is_helpful', True)
        
        if existing_vote:
            if existing_vote.is_helpful == is_helpful:
                # Remove vote if same vote
                existing_vote.delete()
                action_taken = 'removed'
            else:
                # Update vote
                existing_vote.is_helpful = is_helpful
                existing_vote.save()
                action_taken = 'updated'
        else:
            # Create new vote
            ReviewHelpfulVote.objects.create(
                review=review, customer=request.user, is_helpful=is_helpful
            )
            action_taken = 'created'
        
        helpful_count = ReviewHelpfulVote.objects.filter(review=review, is_helpful=True).count()
        return Response({
            'action': action_taken,
            'helpful_count': helpful_count,
            'is_helpful': is_helpful if action_taken != 'removed' else None
        })

class ShopReviewResponseViewSet(viewsets.ModelViewSet):
    queryset = ShopReviewResponse.objects.all()
    serializer_class = ShopReviewResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Shop owners can only see responses to reviews of their shops
        if hasattr(self.request.user, 'userprofile') and self.request.user.userprofile.is_shopowner:
            # Get shops owned by this user
            owned_shops = Shop.objects.filter(shopowner=self.request.user)
            return self.queryset.filter(review__shop__in=owned_shops)
        return self.queryset.none()
    
    def perform_create(self, serializer):
        review = serializer.validated_data['review']
        
        # Check if user owns the shop
        if not hasattr(self.request.user, 'userprofile') or not self.request.user.userprofile.is_shopowner:
            raise serializers.ValidationError("Only shop owners can respond to reviews.")
        
        owned_shops = Shop.objects.filter(shopowner=self.request.user)
        if review.shop not in owned_shops:
            raise serializers.ValidationError("You can only respond to reviews of your shops.")
        
        # Check if response already exists
        if ShopReviewResponse.objects.filter(review=review).exists():
            raise serializers.ValidationError("A response to this review already exists.")
        
        serializer.save(shop_owner=self.request.user)

class ShopRatingSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ShopRatingSummary.objects.all()
    serializer_class = ShopRatingSummarySerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def by_shop(self, request):
        """Get rating summary for a specific shop"""
        shop_id = request.query_params.get('shop_id')
        if not shop_id:
            return Response({'error': 'shop_id parameter is required'}, status=400)
        
        try:
            summary = ShopRatingSummary.objects.get(shop_id=shop_id)
            serializer = self.get_serializer(summary)
            return Response(serializer.data)
        except ShopRatingSummary.DoesNotExist:
            return Response({'error': 'Rating summary not found for this shop'}, status=404)

class ReviewHelpfulVoteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReviewHelpfulVote.objects.all()
    serializer_class = ReviewHelpfulVoteSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Filter by review if provided
        review_id = self.request.query_params.get('review_id')
        if review_id:
            return self.queryset.filter(review_id=review_id)
        return self.queryset

# Enhanced Shop ViewSet with Reviews
class ShopWithReviewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopWithReviewsSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ShopFilter
    search_fields = ['name', 'description', 'location', 'city', 'country']
    ordering_fields = ['name', 'created_at', 'rating_summary__average_rating']
    ordering = ['name']
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get all reviews for a specific shop"""
        shop = self.get_object()
        reviews = ShopReview.objects.filter(shop=shop, status='approved').order_by('-created_at')
        
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = ShopReviewSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ShopReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def rating_breakdown(self, request, pk=None):
        """Get detailed rating breakdown for a shop"""
        shop = self.get_object()
        
        # Get or create rating summary
        summary, created = ShopRatingSummary.objects.get_or_create(shop=shop)
        if created or not summary.last_updated:
            summary.update_rating_summary()
        
        return Response({
            'shop_id': shop.id,
            'shop_name': shop.name,
            'total_reviews': summary.total_reviews,
            'average_rating': summary.average_rating,
            'rating_distribution': {
                '5_stars': summary.rating_percentages[5],
                '4_stars': summary.rating_percentages[4],
                '3_stars': summary.rating_percentages[3],
                '2_stars': summary.rating_percentages[2],
                '1_star': summary.rating_percentages[1],
            },
            'last_updated': summary.last_updated
        })


# Email Subscription Views
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.http import urlencode


class EmailSubscriptionCreateView(APIView):
    """Create a new email subscription"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EmailSubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            # Set default subscription types if none provided
            if not serializer.validated_data.get('subscription_types'):
                serializer.validated_data['subscription_types'] = ['newsletter']
            
            # Link to user if authenticated
            if request.user.is_authenticated:
                serializer.validated_data['user'] = request.user
            
            subscription = serializer.save()
            
            # Generate confirmation token
            confirmation_token = subscription.generate_confirmation_token()
            subscription.save()
            
            # Send confirmation email
            self.send_confirmation_email(subscription, confirmation_token, request)
            
            return Response({
                'message': 'Subscription created successfully! Please check your email to confirm.',
                'subscription_id': subscription.subscriptionId,
                'email': subscription.email
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_confirmation_email(self, subscription, token, request):
        """Send confirmation email to subscriber"""
        try:
            # Build confirmation URL
            confirmation_url = request.build_absolute_uri(
                reverse('email-subscription-confirm') + f'?token={token}'
            )
            
            # Email context
            context = {
                'subscription': subscription,
                'confirmation_url': confirmation_url,
                'site_name': 'OneSoko',
            }
            
            # Send email
            send_mail(
                subject='Confirm your OneSoko newsletter subscription',
                message=f'Please confirm your subscription by clicking: {confirmation_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[subscription.email],
                html_message=render_to_string('emails/subscription_confirmation.html', context) if hasattr(settings, 'TEMPLATES') else None,
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but don't fail the subscription
            print(f"Failed to send confirmation email: {e}")


class EmailSubscriptionConfirmView(APIView):
    """Confirm email subscription"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        token = request.GET.get('token')
        if not token:
            return Response({'error': 'Confirmation token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = EmailSubscription.objects.get(
                confirmation_token=token, 
                is_active=True
            )
            subscription.confirm_subscription()
            
            return Response({
                'message': 'Email subscription confirmed successfully!',
                'email': subscription.email
            }, status=status.HTTP_200_OK)
        
        except EmailSubscription.DoesNotExist:
            return Response({'error': 'Invalid or expired confirmation token'}, status=status.HTTP_400_BAD_REQUEST)


class EmailSubscriptionUnsubscribeView(APIView):
    """Unsubscribe from email notifications"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        token = request.data.get('token')  # Optional unsubscribe token for security
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = EmailSubscription.objects.get(email=email, is_active=True)
            subscription.unsubscribe()
            
            return Response({
                'message': 'Successfully unsubscribed from email notifications',
                'email': email
            }, status=status.HTTP_200_OK)
        
        except EmailSubscription.DoesNotExist:
            return Response({'error': 'Email subscription not found'}, status=status.HTTP_404_NOT_FOUND)


class EmailSubscriptionStatusView(APIView):
    """Check subscription status"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        email = request.GET.get('email')
        if not email:
            return Response({'error': 'Email parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = EmailSubscription.objects.get(email=email)
            serializer = EmailSubscriptionSerializer(subscription)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except EmailSubscription.DoesNotExist:
            return Response({'subscribed': False, 'email': email}, status=status.HTTP_200_OK)
