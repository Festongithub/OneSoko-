# Advanced Search Views for OneSoko
from django.db.models import Q, Avg, Count, F
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from .models import Product, Shop, Category
from .serializers import ProductSerializer, ShopSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def advanced_search(request):
    """
    Advanced search with filters and sorting
    """
    try:
        # Get search parameters
        query = request.GET.get('q', '').strip()
        category = request.GET.get('category', 'all')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        min_rating = request.GET.get('min_rating')
        location = request.GET.get('location', '').strip()
        availability = request.GET.get('availability', 'all')
        sort_by = request.GET.get('sort_by', 'relevance')
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        
        # Start with all products
        products = Product.objects.filter(is_active=True)
        
        # Text search using PostgreSQL full-text search
        if query:
            search_vector = SearchVector('name', weight='A') + \
                           SearchVector('description', weight='B') + \
                           SearchVector('category__name', weight='C')
            search_query = SearchQuery(query)
            
            products = products.annotate(
                search=search_vector,
                rank=SearchRank(search_vector, search_query)
            ).filter(search=search_query)
        
        # Category filter
        if category and category != 'all':
            products = products.filter(category__name__icontains=category)
        
        # Price range filter
        if min_price:
            products = products.filter(price__gte=float(min_price))
        if max_price:
            products = products.filter(price__lte=float(max_price))
        
        # Rating filter
        if min_rating:
            products = products.annotate(
                avg_rating=Avg('reviews__rating')
            ).filter(avg_rating__gte=float(min_rating))
        
        # Location filter (search in shop location)
        if location:
            products = products.filter(
                Q(shops__location__icontains=location) |
                Q(shops__city__icontains=location) |
                Q(shops__country__icontains=location)
            )
        
        # Availability filter
        if availability == 'in-stock':
            products = products.filter(stock_quantity__gt=0)
        elif availability == 'out-of-stock':
            products = products.filter(stock_quantity=0)
        
        # Remove duplicates
        products = products.distinct()
        
        # Sorting
        if sort_by == 'price-low':
            products = products.order_by('price')
        elif sort_by == 'price-high':
            products = products.order_by('-price')
        elif sort_by == 'rating':
            products = products.annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by('-avg_rating')
        elif sort_by == 'newest':
            products = products.order_by('-created_at')
        elif sort_by == 'relevance' and query:
            products = products.order_by('-rank', '-created_at')
        else:
            products = products.order_by('-created_at')
        
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        total_count = products.count()
        paginated_products = products[start:end]
        
        # Serialize products
        serializer = ProductSerializer(paginated_products, many=True, context={'request': request})
        
        return Response({
            'results': serializer.data,
            'pagination': {
                'current_page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page,
                'has_next': end < total_count,
                'has_previous': page > 1
            },
            'filters_applied': {
                'query': query,
                'category': category,
                'price_range': [min_price, max_price],
                'min_rating': min_rating,
                'location': location,
                'availability': availability,
                'sort_by': sort_by
            }
        })
        
    except Exception as e:
        logger.error(f"Advanced search error: {str(e)}")
        return Response({
            'error': 'Search failed. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_suggestions(request):
    """
    Get search suggestions based on query
    """
    try:
        query = request.GET.get('q', '').strip()
        
        if len(query) < 2:
            return Response({'suggestions': []})
        
        # Get product name suggestions
        product_suggestions = Product.objects.filter(
            name__icontains=query,
            is_active=True
        ).values_list('name', flat=True)[:5]
        
        # Get category suggestions
        category_suggestions = Category.objects.filter(
            name__icontains=query
        ).values_list('name', flat=True)[:3]
        
        # Get shop suggestions
        shop_suggestions = Shop.objects.filter(
            name__icontains=query,
            is_active=True
        ).values_list('name', flat=True)[:3]
        
        # Combine and limit suggestions
        all_suggestions = list(product_suggestions) + \
                         list(category_suggestions) + \
                         list(shop_suggestions)
        
        # Remove duplicates and limit
        unique_suggestions = list(dict.fromkeys(all_suggestions))[:10]
        
        return Response({
            'suggestions': unique_suggestions,
            'query': query
        })
        
    except Exception as e:
        logger.error(f"Search suggestions error: {str(e)}")
        return Response({
            'suggestions': [],
            'error': 'Failed to get suggestions'
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def search_analytics(request):
    """
    Get search analytics data
    """
    try:
        # Popular search terms (you'd need to track this)
        popular_searches = [
            'smartphones', 'laptops', 'fashion', 'books', 'electronics'
        ]
        
        # Trending categories
        trending_categories = Category.objects.annotate(
            product_count=Count('products')
        ).order_by('-product_count')[:5]
        
        # Most searched products
        most_searched = Product.objects.filter(
            is_active=True
        ).order_by('-views_count')[:10]
        
        return Response({
            'popular_searches': popular_searches,
            'trending_categories': [cat.name for cat in trending_categories],
            'most_searched_products': ProductSerializer(
                most_searched, many=True, context={'request': request}
            ).data
        })
        
    except Exception as e:
        logger.error(f"Search analytics error: {str(e)}")
        return Response({
            'error': 'Failed to get search analytics'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_search(request):
    """
    Track search queries for analytics
    """
    try:
        query = request.data.get('query', '').strip()
        user_id = request.user.id if request.user.is_authenticated else None
        results_count = request.data.get('results_count', 0)
        
        # Here you would save to a SearchLog model
        # SearchLog.objects.create(
        #     query=query,
        #     user_id=user_id,
        #     results_count=results_count,
        #     timestamp=timezone.now()
        # )
        
        return Response({
            'message': 'Search tracked successfully'
        })
        
    except Exception as e:
        logger.error(f"Search tracking error: {str(e)}")
        return Response({
            'error': 'Failed to track search'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
