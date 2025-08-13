from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count
from django.utils.text import slugify
import json

from .models import UserProfile, BusinessCategory, Shop
from .serializers import (
    UserSerializer, UserProfileSerializer, BusinessCategorySerializer,
    ShopSerializer, ShopListSerializer, UserShopsSerializer,
    QuickShopCreateSerializer, ShopSearchSerializer
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom user data to the response
        user_profile, created = UserProfile.objects.get_or_create(user=self.user)
        
        # Get user's shops
        user_shops = []
        if user_profile.is_shopowner:
            shops = Shop.objects.filter(shopowner=self.user, is_active=True)
            
            for shop in shops:
                user_shops.append({
                    'id': str(shop.shopId),
                    'name': shop.name,
                    'slug': shop.slug,
                    'logo': shop.logo.url if shop.logo else None,
                    'status': shop.status,
                })
        
        data.update({
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'is_shopowner': user_profile.is_shopowner,
                'shops': user_shops,
            }
        })
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            data = request.data
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')

            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Username already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Email already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            return Response({
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update user fields
        user_data = {}
        if 'first_name' in request.data:
            user_data['first_name'] = request.data['first_name']
        if 'last_name' in request.data:
            user_data['last_name'] = request.data['last_name']
        if 'email' in request.data:
            user_data['email'] = request.data['email']
        
        user_serializer = UserSerializer(user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        
        # Update profile fields
        profile_serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
            return Response(profile_serializer.data)
        
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BusinessCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for business categories"""
    queryset = BusinessCategory.objects.filter(is_active=True)
    serializer_class = BusinessCategorySerializer
    permission_classes = [AllowAny]


class ShopViewSet(viewsets.ModelViewSet):
    """ViewSet for shop management"""
    queryset = Shop.objects.filter(is_active=True)
    permission_classes = [AllowAny]  # Allow read access to all, write requires auth
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ShopListSerializer
        elif self.action == 'create':
            return ShopSerializer
        return ShopSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = Shop.objects.filter(is_active=True)
        
        # Filter by business type
        business_type = self.request.query_params.get('business_type')
        if business_type:
            queryset = queryset.filter(business_type=business_type)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by verification status
        verified_only = self.request.query_params.get('verified_only')
        if verified_only and verified_only.lower() == 'true':
            queryset = queryset.filter(verification_status='verified')
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(city__icontains=search) |
                Q(tagline__icontains=search)
            )
        
        return queryset.select_related('shopowner')
    
    def perform_create(self, serializer):
        """Create shop and set current user as owner"""
        # Generate slug if not provided
        if not serializer.validated_data.get('slug'):
            serializer.validated_data['slug'] = slugify(serializer.validated_data['name'])
        
        serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        """Add a review to a shop"""
        shop = self.get_object()
        
        # Check if user already reviewed this shop
        if ShopReview.objects.filter(shop=shop, user=request.user).exists():
            return Response(
                {'error': 'You have already reviewed this shop'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ShopReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(shop=shop, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get all reviews for a shop"""
        shop = self.get_object()
        reviews = shop.reviews.all().order_by('-created_at')
        serializer = ShopReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_verification_document(self, request, pk=None):
        """Upload verification document for a shop"""
        shop = self.get_object()
        
        # Check if user is owner of the shop
        if not ShopOwnership.objects.filter(
            shop=shop, 
            user=request.user, 
            role__in=['owner', 'co_owner'],
            is_active=True
        ).exists():
            return Response(
                {'error': 'You are not authorized to upload documents for this shop'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ShopVerificationDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(shop=shop)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserShopsView(APIView):
    """Get shops owned by the current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserShopsSerializer(request.user)
        return Response(serializer.data)


class MyShopsViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user's own shops"""
    permission_classes = [IsAuthenticated]
    serializer_class = ShopSerializer
    
    def get_queryset(self):
        """Return only shops owned by the current user"""
        return Shop.objects.filter(
            ownerships__user=self.request.user,
            ownerships__is_active=True
        ).select_related('shopowner')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ShopSerializer
        return ShopSerializer
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get analytics for a shop"""
        shop = self.get_object()
        analytics = shop.analytics.all().order_by('-date')[:30]  # Last 30 days
        serializer = ShopAnalyticsSerializer(analytics, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def verification_documents(self, request, pk=None):
        """Get verification documents for a shop"""
        shop = self.get_object()
        documents = shop.verification_documents.all()
        serializer = ShopVerificationDocumentSerializer(documents, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'OK', 'message': 'OneSoko API is running'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def shop_stats(request):
    """Get general shop statistics"""
    try:
        # Use simpler queries that work with existing table structure
        total_shops = Shop.objects.filter(is_active=True).count() if hasattr(Shop.objects.model._meta.get_field('is_active'), 'name') else 0
        
        # Create basic stats that don't depend on fields that might not exist
        stats = {
            'total_shops': total_shops or 0,
            'verified_shops': 0,  # Will implement after migration
            'total_categories': BusinessCategory.objects.filter(is_active=True).count(),
            'total_reviews': 0,  # Will implement after migration 
            'average_rating': 0,  # Will implement after migration
            'message': 'Basic stats - full stats will be available after database migration'
        }
        return Response(stats)
    except Exception as e:
        # Fallback stats if there are any database issues
        stats = {
            'total_shops': 0,
            'verified_shops': 0,
            'total_categories': BusinessCategory.objects.count(),
            'total_reviews': 0,
            'average_rating': 0,
            'error': f'Database compatibility issue: {str(e)}'
        }
        return Response(stats)


# Additional API endpoints that the frontend expects
@api_view(['GET'])
@permission_classes([AllowAny])
def shop_public_list(request):
    """Optimized public list of shops for browsing with search capability"""
    try:
        # Get query parameters
        search = request.GET.get('search', '').strip()
        city = request.GET.get('city', '').strip()
        limit = min(int(request.GET.get('limit', 20)), 50)  # Max 50 for performance
        
        # Start with active shops, use select_related for efficiency
        shops = Shop.objects.filter(
            is_active=True, 
            status='active'
        ).select_related('shopowner')
        
        # Apply search filters if provided
        if search:
            shops = shops.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        
        if city:
            shops = shops.filter(city__icontains=city)
        
        # Limit results and order by newest first
        shops = shops.order_by('-created_at')[:limit]
        
        # Use optimized serializer for faster response
        serializer = ShopSearchSerializer(shops, many=True)
        
        return Response({
            'count': len(serializer.data),
            'has_search': bool(search or city),
            'shops': serializer.data
        })
        
    except Exception as e:
        return Response({
            'error': f'Database error: {str(e)}',
            'shops': []
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_me(request):
    """Get current user's profile"""
    try:
        profile, created = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'bio': '',
                'address': '',
                'is_shopowner': False
            }
        )
        
        return Response({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            },
            'profile': {
                'phone_number': profile.phone_number,
                'bio': profile.bio,
                'address': profile.address,
                'city': profile.city,
                'country': profile.country,
                'avatar': profile.avatar.url if profile.avatar else None,
                'is_shopowner': profile.is_shopowner,
                'created_at': profile.created_at.isoformat() if profile.created_at else None,
            }
        })
    except Exception as e:
        return Response({'error': f'Profile error: {str(e)}'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_item_count(request):
    """Get cart item count - placeholder"""
    return Response({'count': 0})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def messages_unread_count(request):
    """Get unread messages count - placeholder"""
    return Response({'count': 0})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def messages_conversations(request):
    """Get message conversations - placeholder"""
    return Response({'conversations': []})


@api_view(['GET'])
@permission_classes([AllowAny])
def categories_stats(request):
    """Get category statistics"""
    try:
        categories = BusinessCategory.objects.filter(is_active=True)
        stats = []
        
        for category in categories:
            stats.append({
                'category_id': category.id,
                'name': category.name,
                'product_count': 0,  # Placeholder - no products model yet
                'shop_count': 0,     # Placeholder - no category relation yet
            })
        
        return Response(stats)
    except Exception as e:
        return Response({'error': f'Stats error: {str(e)}'}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def category_products(request, category_id):
    """Get products in a category - placeholder"""
    try:
        category = BusinessCategory.objects.get(id=category_id, is_active=True)
        return Response({
            'category': {
                'id': category.id,
                'name': category.name,
                'description': category.description,
            },
            'products': []  # Placeholder - no products model yet
        })
    except BusinessCategory.DoesNotExist:
        return Response({'error': 'Category not found'}, status=404)
    except Exception as e:
        return Response({'error': f'Products error: {str(e)}'}, status=500)


# ===== OPTIMIZED SHOP CREATION & SEARCH =====

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_shop_create(request):
    """Ultra-fast shop creation with minimal required fields"""
    serializer = QuickShopCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        try:
            shop = serializer.save()
            
            # Return minimal response for speed
            return Response({
                'success': True,
                'shop': {
                    'shopId': str(shop.shopId),
                    'name': shop.name,
                    'slug': shop.slug,
                    'status': shop.status,
                    'created_at': shop.created_at.isoformat()
                }
            }, status=201)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Shop creation failed: {str(e)}'
            }, status=500)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def shop_search(request):
    """Ultra-fast shop search with optimized queries"""
    query = request.GET.get('q', '').strip()
    city = request.GET.get('city', '').strip()
    limit = min(int(request.GET.get('limit', 20)), 50)  # Max 50 results
    
    try:
        # Start with active shops only
        shops = Shop.objects.filter(
            is_active=True, 
            status='active'
        ).select_related('shopowner')
        
        # Apply search filters
        if query:
            shops = shops.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(location__icontains=query)
            )
        
        if city:
            shops = shops.filter(city__icontains=city)
        
        # Limit results for speed
        shops = shops[:limit]
        
        # Use optimized serializer
        serializer = ShopSearchSerializer(shops, many=True)
        
        return Response({
            'count': len(serializer.data),
            'query': query,
            'city_filter': city,
            'shops': serializer.data
        })
        
    except Exception as e:
        return Response({
            'error': f'Search failed: {str(e)}',
            'shops': []
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def shop_instant_search(request):
    """Lightning-fast search for autocomplete - minimal data"""
    query = request.GET.get('q', '').strip()
    
    if len(query) < 2:
        return Response({'suggestions': []})
    
    try:
        # Ultra-fast query with minimal fields
        shops = Shop.objects.filter(
            is_active=True,
            status='active',
            name__icontains=query
        ).values('shopId', 'name', 'city', 'slug')[:10]
        
        suggestions = []
        for shop in shops:
            suggestions.append({
                'shopId': str(shop['shopId']),
                'name': shop['name'],
                'city': shop['city'] or '',
                'slug': shop['slug']
            })
        
        return Response({
            'suggestions': suggestions,
            'query': query
        })
        
    except Exception as e:
        return Response({
            'suggestions': [],
            'error': str(e)
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shop_quick_update(request, shop_id):
    """Quick update for essential shop details"""
    try:
        shop = Shop.objects.get(shopId=shop_id, shopowner=request.user)
        
        # Only allow updating specific fields for speed
        allowed_fields = ['name', 'description', 'location', 'city', 'country', 'phone', 'email']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        # Update slug if name changed
        if 'name' in update_data and update_data['name'] != shop.name:
            from django.utils.text import slugify
            base_slug = slugify(update_data['name'])
            update_data['slug'] = f"{base_slug}-{str(shop.shopId)[:8]}"
        
        # Apply updates
        for field, value in update_data.items():
            setattr(shop, field, value)
        
        shop.save(update_fields=list(update_data.keys()))
        
        return Response({
            'success': True,
            'message': 'Shop updated successfully',
            'shop': {
                'shopId': str(shop.shopId),
                'name': shop.name,
                'slug': shop.slug,
                'description': shop.description,
                'location': shop.location,
                'city': shop.city,
                'country': shop.country
            }
        })
        
    except Shop.DoesNotExist:
        return Response({'error': 'Shop not found or access denied'}, status=404)
    except Exception as e:
        return Response({'error': f'Update failed: {str(e)}'}, status=500)


# ============================================================================
# OPTIMIZED SEARCH AND CREATION VIEWS FOR FRONTEND
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_create_shop(request):
    """Ultra-fast shop creation with minimal fields"""
    from .serializers import QuickShopCreateSerializer
    
    serializer = QuickShopCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        try:
            shop = serializer.save()
            return Response({
                'success': True,
                'message': 'Shop created successfully!',
                'shop': {
                    'shopId': str(shop.shopId),
                    'name': shop.name,
                    'slug': shop.slug,
                    'description': shop.description,
                    'location': shop.location,
                    'status': shop.status,
                    'created_at': shop.created_at.isoformat()
                }
            }, status=201)
        except Exception as e:
            return Response({'error': f'Creation failed: {str(e)}'}, status=500)
    
    return Response({'errors': serializer.errors}, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_shops(request):
    """Advanced shop search with multiple filters"""
    from .serializers import ShopSearchSerializer
    
    # Get search parameters
    query = request.GET.get('q', '').strip()
    city = request.GET.get('city', '').strip()
    country = request.GET.get('country', '').strip()
    status = request.GET.get('status', 'active')
    limit = min(int(request.GET.get('limit', 20)), 100)  # Max 100 results
    
    try:
        # Start with active shops for better performance
        shops = Shop.objects.filter(is_active=True, status=status).select_related('shopowner')
        
        # Apply search filters
        if query:
            shops = shops.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(location__icontains=query)
            )
        
        if city:
            shops = shops.filter(city__icontains=city)
            
        if country:
            shops = shops.filter(country__icontains=country)
        
        # Simple ordering for better performance
        shops = shops.order_by('-views', '-created_at')[:limit]
        
        serializer = ShopSearchSerializer(shops, many=True)
        
        return Response({
            'count': len(serializer.data),
            'query': query,
            'filters': {
                'city': city,
                'country': country,
                'status': status
            },
            'shops': serializer.data
        })
        
    except Exception as e:
        return Response({'error': f'Search failed: {str(e)}'}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def autocomplete_shops(request):
    """Lightning-fast autocomplete for shop names"""
    from .serializers import ShopAutocompleteSerializer
    
    query = request.GET.get('q', '').strip()
    limit = min(int(request.GET.get('limit', 10)), 20)  # Max 20 suggestions
    
    if len(query) < 2:
        return Response({'suggestions': []})
    
    try:
        # Super fast search using database indexes
        shops = Shop.objects.filter(
            name__icontains=query,
            is_active=True,
            status='active'
        ).only('shopId', 'name', 'slug', 'city')[:limit]
        
        serializer = ShopAutocompleteSerializer(shops, many=True)
        
        return Response({
            'query': query,
            'suggestions': serializer.data
        })
        
    except Exception as e:
        return Response({'error': f'Autocomplete failed: {str(e)}'}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def shops_by_location(request):
    """Get shops grouped by location for easy browsing"""
    from .serializers import ShopSearchSerializer
    
    try:
        # Get popular cities with shop counts
        from django.db.models import Count
        
        cities = Shop.objects.filter(
            is_active=True, 
            status='active',
            city__isnull=False
        ).exclude(city='').values('city', 'country').annotate(
            shop_count=Count('shopId')
        ).order_by('-shop_count')[:20]
        
        # Get recent shops for each popular city
        location_data = []
        for city_info in cities:
            city_shops = Shop.objects.filter(
                city=city_info['city'],
                is_active=True,
                status='active'
            ).select_related('shopowner').order_by('-created_at')[:5]
            
            if city_shops:
                serializer = ShopSearchSerializer(city_shops, many=True)
                location_data.append({
                    'city': city_info['city'],
                    'country': city_info['country'],
                    'shop_count': city_info['shop_count'],
                    'recent_shops': serializer.data
                })
        
        return Response({
            'locations': location_data
        })
        
    except Exception as e:
        return Response({'error': f'Location search failed: {str(e)}'}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def trending_shops(request):
    """Get trending shops based on views and recent activity"""
    from .serializers import ShopSearchSerializer
    
    limit = min(int(request.GET.get('limit', 10)), 50)
    
    try:
        # Get shops with highest views in the last 30 days (simulated with recent creation)
        from datetime import datetime, timedelta
        
        recent_date = datetime.now() - timedelta(days=30)
        
        trending = Shop.objects.filter(
            is_active=True,
            status='active',
            created_at__gte=recent_date
        ).select_related('shopowner').order_by('-views', '-created_at')[:limit]
        
        # If not enough recent shops, get popular ones
        if len(trending) < limit:
            popular = Shop.objects.filter(
                is_active=True,
                status='active'
            ).exclude(
                shopId__in=[shop.shopId for shop in trending]
            ).select_related('shopowner').order_by('-views')[:limit - len(trending)]
            
            trending = list(trending) + list(popular)
        
        serializer = ShopSearchSerializer(trending, many=True)
        
        return Response({
            'trending_shops': serializer.data
        })
        
    except Exception as e:
        return Response({'error': f'Trending search failed: {str(e)}'}, status=500)
