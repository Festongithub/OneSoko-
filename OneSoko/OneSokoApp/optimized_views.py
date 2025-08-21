from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Prefetch, Q, F, Count, Avg
from .models import Product, Shop, Category, Review
from .serializers import ProductSerializer, ShopSerializer
from .throttling import CustomUserRateThrottle, CustomAnonRateThrottle
import hashlib
import json

class CachedViewSetMixin:
    """
    Mixin to add caching capabilities to ViewSets
    """
    cache_timeout = 300  # 5 minutes default
    cache_key_prefix = 'api'
    
    def get_cache_key(self, request, *args, **kwargs):
        """
        Generate cache key based on request parameters
        """
        # Include query parameters, user, and method in cache key
        params = dict(request.GET.items())
        user_id = request.user.id if request.user.is_authenticated else 'anon'
        
        cache_data = {
            'view': self.__class__.__name__,
            'action': self.action,
            'params': params,
            'user': user_id,
            'args': args,
            'kwargs': kwargs
        }
        
        cache_string = json.dumps(cache_data, sort_keys=True)
        cache_hash = hashlib.md5(cache_string.encode()).hexdigest()
        
        return f"{self.cache_key_prefix}:{cache_hash}"
    
    def get_cached_response(self, request, *args, **kwargs):
        """
        Get cached response if available
        """
        cache_key = self.get_cache_key(request, *args, **kwargs)
        return cache.get(cache_key)
    
    def set_cached_response(self, request, response, *args, **kwargs):
        """
        Cache the response
        """
        cache_key = self.get_cache_key(request, *args, **kwargs)
        cache.set(cache_key, response.data, self.cache_timeout)
    
    def dispatch(self, request, *args, **kwargs):
        """
        Override dispatch to implement caching
        """
        # Only cache GET requests
        if request.method == 'GET':
            cached_response = self.get_cached_response(request, *args, **kwargs)
            if cached_response is not None:
                return Response(cached_response)
        
        response = super().dispatch(request, *args, **kwargs)
        
        # Cache successful GET responses
        if request.method == 'GET' and response.status_code == 200:
            self.set_cached_response(request, response, *args, **kwargs)
        
        return response

class OptimizedProductViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    """
    Optimized Product ViewSet with caching and efficient queries
    """
    serializer_class = ProductSerializer
    throttle_classes = [CustomUserRateThrottle, CustomAnonRateThrottle]
    cache_timeout = 600  # 10 minutes for product data
    
    def get_queryset(self):
        """
        Optimized queryset with prefetching and select_related
        """
        return Product.objects.select_related(
            'shop', 'category'
        ).prefetch_related(
            'tags',
            'variants',
            Prefetch(
                'reviews',
                queryset=Review.objects.select_related('user').order_by('-created_at')[:5]
            )
        ).annotate(
            review_count=Count('reviews'),
            avg_rating=Avg('reviews__rating')
        )
    
    def list(self, request, *args, **kwargs):
        """
        Optimized list with pagination and filtering
        """
        # Check cache first
        cached_response = self.get_cached_response(request, *args, **kwargs)
        if cached_response:
            return Response(cached_response)
        
        queryset = self.filter_queryset(self.get_queryset())
        
        # Efficient pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            self.set_cached_response(request, paginated_response, *args, **kwargs)
            return paginated_response
        
        serializer = self.get_serializer(queryset, many=True)
        response = Response(serializer.data)
        self.set_cached_response(request, response, *args, **kwargs)
        return response
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured products with aggressive caching
        """
        cache_key = 'featured_products'
        featured_products = cache.get(cache_key)
        
        if not featured_products:
            # Get top-rated products
            queryset = self.get_queryset().filter(
                is_active=True,
                avg_rating__gte=4.0
            ).order_by('-avg_rating', '-review_count')[:20]
            
            serializer = self.get_serializer(queryset, many=True)
            featured_products = serializer.data
            
            # Cache for 1 hour
            cache.set(cache_key, featured_products, 3600)
        
        return Response(featured_products)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """
        Get trending products based on recent activity
        """
        cache_key = 'trending_products'
        trending_products = cache.get(cache_key)
        
        if not trending_products:
            from datetime import datetime, timedelta
            week_ago = datetime.now() - timedelta(days=7)
            
            # Products with recent reviews and high ratings
            queryset = self.get_queryset().filter(
                is_active=True,
                reviews__created_at__gte=week_ago
            ).annotate(
                recent_reviews=Count('reviews', filter=Q(reviews__created_at__gte=week_ago))
            ).order_by('-recent_reviews', '-avg_rating')[:15]
            
            serializer = self.get_serializer(queryset, many=True)
            trending_products = serializer.data
            
            # Cache for 30 minutes
            cache.set(cache_key, trending_products, 1800)
        
        return Response(trending_products)
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """
        Increment product view count (async)
        """
        from .tasks import increment_product_views
        increment_product_views.delay(pk)
        return Response({'status': 'view recorded'})

class OptimizedShopViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    """
    Optimized Shop ViewSet with intelligent caching
    """
    serializer_class = ShopSerializer
    throttle_classes = [CustomUserRateThrottle, CustomAnonRateThrottle]
    cache_timeout = 900  # 15 minutes for shop data
    
    def get_queryset(self):
        """
        Optimized shop queryset
        """
        return Shop.objects.select_related('owner').prefetch_related(
            Prefetch(
                'products',
                queryset=Product.objects.filter(is_active=True).order_by('-created_at')[:10]
            ),
            Prefetch(
                'reviews',
                queryset=Review.objects.select_related('user').order_by('-created_at')[:10]
            )
        ).annotate(
            product_count=Count('products', filter=Q(products__is_active=True)),
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        )
    
    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        """
        Get top-rated shops
        """
        cache_key = 'top_rated_shops'
        top_shops = cache.get(cache_key)
        
        if not top_shops:
            queryset = self.get_queryset().filter(
                avg_rating__gte=4.0,
                review_count__gte=10
            ).order_by('-avg_rating', '-review_count')[:20]
            
            serializer = self.get_serializer(queryset, many=True)
            top_shops = serializer.data
            
            # Cache for 2 hours
            cache.set(cache_key, top_shops, 7200)
        
        return Response(top_shops)

# Database query optimization utilities
class QueryOptimizer:
    """
    Utility class for database query optimization
    """
    
    @staticmethod
    def bulk_create_with_batch_size(model, objects, batch_size=1000):
        """
        Efficiently create multiple objects in batches
        """
        for i in range(0, len(objects), batch_size):
            batch = objects[i:i + batch_size]
            model.objects.bulk_create(batch, ignore_conflicts=True)
    
    @staticmethod
    def bulk_update_with_batch_size(objects, fields, batch_size=1000):
        """
        Efficiently update multiple objects in batches
        """
        model = objects[0].__class__
        for i in range(0, len(objects), batch_size):
            batch = objects[i:i + batch_size]
            model.objects.bulk_update(batch, fields)
    
    @staticmethod
    def efficient_exists_check(queryset):
        """
        Memory-efficient exists check for large querysets
        """
        return queryset.only('id').exists()

# Search optimization
class SearchOptimizer:
    """
    Optimized search functionality
    """
    
    @staticmethod
    def search_products(query, limit=50):
        """
        Optimized product search with relevance scoring
        """
        cache_key = f'search_products_{hashlib.md5(query.encode()).hexdigest()}'
        cached_results = cache.get(cache_key)
        
        if cached_results:
            return cached_results
        
        # Full-text search with relevance scoring
        from django.contrib.postgres.search import SearchVector, SearchRank
        
        search_vector = SearchVector('name', weight='A') + SearchVector('description', weight='B')
        
        results = Product.objects.annotate(
            search=search_vector,
            rank=SearchRank(search_vector, query)
        ).filter(
            search=query,
            is_active=True
        ).order_by('-rank', '-created_at')[:limit]
        
        # Cache search results for 5 minutes
        cache.set(cache_key, list(results), 300)
        
        return results
