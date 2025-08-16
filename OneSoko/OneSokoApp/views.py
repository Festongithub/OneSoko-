from django.shortcuts import render
from rest_framework import viewsets
from .models import (
    Product, Shop, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, Wishlist, Message, Notification
)
from .serializers import (
    ProductSerializer, ShopSerializer, CategorySerializer, TagSerializer, ReviewSerializer, ProductVariantSerializer, UserProfileSerializer, OrderSerializer, OrderItemSerializer, PaymentSerializer, WishlistSerializer, MessageSerializer, NotificationSerializer
)
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, ShopownerRegistrationSerializer
from rest_framework import permissions
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
    is_verified = django_filters.BooleanFilter()
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Shop
        fields = ['name', 'description', 'location', 'city', 'country', 'is_verified', 'search']

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

# Product ViewSet
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

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
            queryset = queryset.filter(is_verified=True)
        
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
        queryset = self.get_queryset().filter(is_verified=True).order_by('-views', '-products_count')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured shops (verified shops with most products)
        """
        queryset = self.get_queryset().filter(is_verified=True).order_by('-products_count', '-views')[:6]
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
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

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
