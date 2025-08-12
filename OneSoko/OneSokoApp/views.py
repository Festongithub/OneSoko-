from django.shortcuts import render
from rest_framework import viewsets
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import (
    Product, Shop, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, Wishlist, Message, Notification, Cart, CartItem, ProductInquiry
)
from .serializers import (
    ProductSerializer, ShopSerializer, CategorySerializer, TagSerializer, ReviewSerializer, 
    ProductVariantSerializer, UserProfileSerializer, PublicUserProfileSerializer, 
    UserProfileUpdateSerializer, UserProfileCreateSerializer, OrderSerializer, 
    CreateOrderSerializer, OrderItemSerializer, PaymentSerializer, CreatePaymentSerializer,
    WishlistSerializer, MessageSerializer, CreateMessageSerializer, ProductInquirySerializer,
    CreateProductInquirySerializer, ProductInquiryResponseSerializer, NotificationSerializer,
    CreateNotificationSerializer, UserRegistrationSerializer, ShopownerRegistrationSerializer,
    CartSerializer, AddToCartSerializer, UpdateCartItemSerializer, CreateReviewSerializer, UpdateReviewSerializer,
    UserDetailSerializer
)
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, ShopownerRegistrationSerializer
from rest_framework import permissions
from rest_framework import mixins
from .permissions import IsShopOwner, IsProfileOwner, IsOwnerOrReadOnly, IsShopOwnerForManagement
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .enhanced_shop_notifications import (
    notify_shop_owner_new_order, 
    get_shop_owner_daily_stats,
    create_daily_summary_for_shop_owner,
    ShopOwnerNotificationManager
)

# Create your views here.

# Product ViewSet
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'availability', 'shops']
    search_fields = ['name', 'description', 'category__name', 'tags__name']
    ordering_fields = ['name', 'price', 'created_at', 'updated_at']
    ordering = ['name']

    def get_permissions(self):
        """
        Products can be viewed by anyone, but only shop owners can create/update/delete
        their own products.
        """
        if self.action in ['list', 'retrieve']:
            # Anyone can view products
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only shop owners can manage their products
            permission_classes = [IsShopOwnerForManagement]
        else:
            # Default to allowing read access
            permission_classes = [permissions.AllowAny]
        
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Ensure products are created with proper shop association"""
        # The product creation should be done through shops, not directly
        # This method can be overridden if needed for direct product creation
        product = serializer.save()
        return product

    def perform_update(self, serializer):
        """Ensure only shop owners can update their products"""
        instance = self.get_object()
        
        # Check if user owns any shop that contains this product
        user_shops = Shop.objects.filter(shopowner=self.request.user)
        if not user_shops.filter(products=instance).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to update this product.")
        
        serializer.save()

    def perform_destroy(self, serializer):
        """Ensure only shop owners can delete their products"""
        instance = self.get_object()
        
        # Check if user owns any shop that contains this product
        user_shops = Shop.objects.filter(shopowner=self.request.user)
        if not user_shops.filter(products=instance).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to delete this product.")
        
        instance.delete()

# Shop ViewSet
class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'city', 'country', 'is_active']
    search_fields = ['name', 'description', 'location', 'city', 'country', 'street', 'email']
    ordering_fields = ['name', 'created_at', 'views', 'total_sales', 'total_orders']
    ordering = ['name']

    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        Only shop owners can create, update, or delete shops.
        Only shop owners can access their own shops for management operations.
        Public can view shops via specific public endpoints.
        """
        if self.action == 'create':
            # Only authenticated shop owners can create shops
            permission_classes = [IsShopOwner]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only the shop owner can update/delete their own shop
            permission_classes = [IsShopOwner]
        elif self.action in ['my_shops', 'add_product', 'delete_product', 'products']:
            # Only shop owners can access these management endpoints
            permission_classes = [IsShopOwner]
        elif self.action in ['public_list', 'public_detail', 'search', 'by_category', 'nearby']:
            # Public endpoints for browsing shops
            permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'retrieve']:
            # Default list/retrieve - only for shop owners to see their own shops
            permission_classes = [IsShopOwner]
        else:
            # Default to shop owner permission for any other actions
            permission_classes = [IsShopOwner]
        
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Filter queryset based on user permissions and action.
        Shop owners can only see their own shops in management contexts.
        """
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            # For management operations, only show user's own shops
            if self.request.user.is_authenticated:
                return Shop.objects.filter(shopowner=self.request.user)
            else:
                return Shop.objects.none()
        elif self.action == 'my_shops':
            # Explicitly for user's own shops
            if self.request.user.is_authenticated:
                return Shop.objects.filter(shopowner=self.request.user)
            else:
                return Shop.objects.none()
        else:
            # For public endpoints, return all active shops
            return Shop.objects.all()

    def perform_create(self, serializer):
        # Automatically set the shopowner to the current user
        shop = serializer.save(shopowner=self.request.user)
        
        # Update user profile to mark them as a shop owner
        try:
            profile = self.request.user.profile
            if not profile.is_shopowner:
                profile.is_shopowner = True
                profile.save()
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            UserProfile.objects.create(
                user=self.request.user,
                is_shopowner=True
            )
        
        return shop

    @action(detail=False, methods=['get'], permission_classes=[IsShopOwnerForManagement])
    def my_shops(self, request):
        """Get shops owned by the current user (shop owner only)"""
        # Double-check that user is a shop owner
        if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
            return Response({
                'detail': 'Only shop owners can access this endpoint.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        shops = Shop.objects.filter(shopowner=request.user)
        serializer = ShopSerializer(shops, many=True)
        return Response(serializer.data)
    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def public_list(self, request):
        """Get all public shops with optional filtering (no authentication required)"""
        shops = Shop.objects.filter(status="active", is_active=True)
        
        # Add optional filters
        city = request.query_params.get("city", "")
        country = request.query_params.get("country", "")
        has_products = request.query_params.get("has_products", "")
        sort_by = request.query_params.get("sort_by", "name")
        order = request.query_params.get("order", "asc")
        
        if city:
            shops = shops.filter(city__icontains=city)
            
        if country:
            shops = shops.filter(country__icontains=country)
            
        if has_products and has_products.lower() == "true":
            shops = shops.filter(products__isnull=False).distinct()
        
        # Add sorting
        sort_field = sort_by
        if sort_by in ['name', 'views', 'total_sales', 'created_at', 'total_orders']:
            if order.lower() == 'desc':
                sort_field = f'-{sort_by}'
            shops = shops.order_by(sort_field)
        else:
            shops = shops.order_by('name')
            
        serializer = ShopSerializer(shops, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def public_detail(self, request, pk=None):
        """Get public shop details (no authentication required)"""
        try:
            shop = Shop.objects.get(shopId=pk, status="active")
            serializer = ShopSerializer(shop)
            return Response(serializer.data)
        except Shop.DoesNotExist:
            return Response({
                "detail": "Shop not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def search(self, request):
        """Enhanced search shops with multiple filters (no authentication required)"""
        query = request.query_params.get("q", "")
        location = request.query_params.get("location", "")
        city = request.query_params.get("city", "")
        country = request.query_params.get("country", "")
        min_rating = request.query_params.get("min_rating", "")
        sort_by = request.query_params.get("sort_by", "name")  # name, views, total_sales, created_at
        order = request.query_params.get("order", "asc")  # asc or desc
        
        shops = Shop.objects.filter(status="active", is_active=True)
        
        # General search query (searches across multiple fields)
        if query:
            shops = shops.filter(
                models.Q(name__icontains=query) |
                models.Q(description__icontains=query) |
                models.Q(location__icontains=query) |
                models.Q(email__icontains=query) |
                models.Q(street__icontains=query)
            )
        
        # Location-based filters
        if location:
            shops = shops.filter(
                models.Q(city__icontains=location) |
                models.Q(country__icontains=location) |
                models.Q(location__icontains=location) |
                models.Q(street__icontains=location)
            )
        
        if city:
            shops = shops.filter(city__icontains=city)
            
        if country:
            shops = shops.filter(country__icontains=country)
        
        # Add rating filter (based on average product ratings)
        if min_rating:
            try:
                min_rating_val = float(min_rating)
                shops = shops.annotate(
                    avg_rating=Avg('products__reviews__rating')
                ).filter(avg_rating__gte=min_rating_val)
            except ValueError:
                pass
        
        # Add sorting
        sort_field = sort_by
        if sort_by in ['name', 'views', 'total_sales', 'created_at', 'total_orders']:
            if order.lower() == 'desc':
                sort_field = f'-{sort_by}'
            shops = shops.order_by(sort_field)
        else:
            shops = shops.order_by('name')  # default sorting
        
        # Add pagination info in response
        page_size = request.query_params.get("page_size", 20)
        try:
            page_size = int(page_size)
            if page_size > 100:  # Limit max page size
                page_size = 100
        except ValueError:
            page_size = 20
            
        # Add shop count to response
        
        # Return direct array for consistency with other endpoints
        serializer = ShopSerializer(shops, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def by_category(self, request):
        """Get shops that have products in a specific category"""
        category_id = request.query_params.get("category_id", "")
        category_name = request.query_params.get("category_name", "")
        
        shops = Shop.objects.filter(status="active", is_active=True)
        
        if category_id:
            shops = shops.filter(products__category__id=category_id).distinct()
        elif category_name:
            shops = shops.filter(products__category__name__icontains=category_name).distinct()
        else:
            return Response({
                "detail": "Please provide either category_id or category_name parameter"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ShopSerializer(shops, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def nearby(self, request):
        """Get shops near a specific location (if latitude/longitude provided)"""
        lat = request.query_params.get("latitude", "")
        lng = request.query_params.get("longitude", "")
        radius = request.query_params.get("radius", "10")  # km
        
        if not lat or not lng:
            return Response({
                "detail": "Please provide both latitude and longitude parameters"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
        except ValueError:
            return Response({
                "detail": "Invalid coordinates or radius"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Simple distance calculation using Haversine formula approximation
        # For production, consider using PostGIS or similar
        shops = Shop.objects.filter(
            status="active", 
            is_active=True,
            latitude__isnull=False,
            longitude__isnull=False
        )
        
        # For now, return all shops with coordinates
        # In production, implement proper distance calculation
        serializer = ShopSerializer(shops, many=True)
        return Response({
            "message": f"Shops near coordinates ({lat}, {lng}) within {radius}km",
            "results": serializer.data
        })

    @action(detail=True, methods=['get'], permission_classes=[IsShopOwnerForManagement])
    def products(self, request, pk=None):
        """Get products for a specific shop (shop owner only)"""
        shop = self.get_object()
        
        # Additional security check
        if shop.shopowner != request.user:
            return Response({
                'detail': 'You do not have permission to view products for this shop.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        products = shop.products.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsShopOwnerForManagement])
    def add_product(self, request, pk=None):
        """Add a product to a shop (shop owner only)"""
        shop = self.get_object()
        
        # Additional security check
        if shop.shopowner != request.user:
            return Response({
                'detail': 'You do not have permission to add products to this shop.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Handle both JSON and form data
            if request.content_type.startswith('multipart/form-data'):
                # Handle file uploads
                serializer = ProductSerializer(data=request.data)
            else:
                # Handle JSON data
                serializer = ProductSerializer(data=request.data)
            
            if serializer.is_valid():
                # Create the product
                product = serializer.save()
                
                # Add the product to the shop
                shop.products.add(product)
                
                # Return the created product with full details
                response_serializer = ProductSerializer(product)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'detail': 'Invalid product data',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'detail': f'Error creating product: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'], url_path='products/(?P<product_id>[^/.]+)', permission_classes=[IsShopOwnerForManagement])
    def delete_product(self, request, pk=None, product_id=None):
        """Delete a product from a shop (shop owner only)"""
        shop = self.get_object()
        
        # Additional security check
        if shop.shopowner != request.user:
            return Response({
                'detail': 'You do not have permission to delete products from this shop.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get the product from the shop
            product = shop.products.get(productId=product_id)
            
            # Remove the product from the shop
            shop.products.remove(product)
            
            # Delete the product
            product.delete()
            
            return Response({
                'detail': 'Product deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
            
        except Product.DoesNotExist:
            return Response({
                'detail': 'Product not found in this shop'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'detail': f'Error deleting product: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['put'], url_path='products/(?P<product_id>[^/.]+)')
    def update_product(self, request, pk=None, product_id=None):
        shop = self.get_object()
        
        try:
            # Get the product from the shop
            product = shop.products.get(productId=product_id)
            
            # Handle both JSON and form data
            if request.content_type.startswith('multipart/form-data'):
                serializer = ProductSerializer(product, data=request.data, partial=True)
            else:
                serializer = ProductSerializer(product, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_product = serializer.save()
                response_serializer = ProductSerializer(updated_product)
                return Response(response_serializer.data)
            else:
                return Response({
                    'detail': 'Invalid product data',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Product.DoesNotExist:
            return Response({
                'detail': 'Product not found in this shop'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'detail': f'Error updating product: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Cart ViewSet
class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Users can only see their own cart"""
        return Cart.objects.filter(user=self.request.user)

    def get_object(self):
        """Get or create cart for the current user"""
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """Get the current user's cart"""
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add an item to the cart"""
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            cart = self.get_object()
            product = serializer.validated_data['product']
            shop = serializer.validated_data['shop']
            quantity = serializer.validated_data['quantity']

            # Check if item already exists in cart
            try:
                cart_item = CartItem.objects.get(cart=cart, product=product, shop=shop)
                # Update quantity
                cart_item.quantity += quantity
                cart_item.save()
                message = "Item quantity updated in cart"
                
                # Create notification for cart update
                Notification.objects.create(
                    user=request.user,
                    text=f"Updated quantity of {product.name} in your cart",
                    type='cart_updated',
                    product=product,
                    shop=shop,
                    data={
                        'product_name': product.name,
                        'quantity': cart_item.quantity,
                        'total_price': float(cart_item.total_price)
                    }
                )
            except CartItem.DoesNotExist:
                # Create new cart item
                cart_item = CartItem.objects.create(
                    cart=cart,
                    product=product,
                    shop=shop,
                    quantity=quantity
                )
                message = "Item added to cart"
                
                # Create notification for cart item added
                Notification.objects.create(
                    user=request.user,
                    text=f"Added {product.name} to your cart",
                    type='cart_item_added',
                    product=product,
                    shop=shop,
                    data={
                        'product_name': product.name,
                        'quantity': quantity,
                        'total_price': float(cart_item.total_price)
                    }
                )

            # Return updated cart
            cart_serializer = self.get_serializer(cart)
            return Response({
                'message': message,
                'cart': cart_serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put'], url_path='update_item/(?P<item_id>[^/.]+)')
    def update_item(self, request, item_id=None):
        """Update quantity of a cart item"""
        try:
            cart = self.get_object()
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            
            serializer = UpdateCartItemSerializer(
                data=request.data,
                context={'cart_item': cart_item}
            )
            
            if serializer.is_valid():
                quantity = serializer.validated_data['quantity']
                cart_item.quantity = quantity
                cart_item.save()
                
                # Return updated cart
                cart_serializer = self.get_serializer(cart)
                return Response({
                    'message': 'Item quantity updated',
                    'cart': cart_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except CartItem.DoesNotExist:
            return Response({
                'detail': 'Cart item not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'], url_path='remove_item/(?P<item_id>[^/.]+)')
    def remove_item(self, request, item_id=None):
        """Remove an item from the cart"""
        try:
            cart = self.get_object()
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            
            # Return updated cart
            cart_serializer = self.get_serializer(cart)
            return Response({
                'message': 'Item removed from cart',
                'cart': cart_serializer.data
            }, status=status.HTTP_200_OK)
            
        except CartItem.DoesNotExist:
            return Response({
                'detail': 'Cart item not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'])
    def clear_cart(self, request):
        """Clear all items from the cart"""
        cart = self.get_object()
        cart.items.all().delete()
        
        cart_serializer = self.get_serializer(cart)
        return Response({
            'message': 'Cart cleared',
            'cart': cart_serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def item_count(self, request):
        """Get the total number of items in the cart"""
        cart = self.get_object()
        return Response({
            'item_count': cart.total_items
        })

# Category ViewSet
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]  # Allow public access to categories
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search categories by name"""
        query = request.query_params.get('q', '')
        if query:
            categories = Category.objects.filter(name__icontains=query)
        else:
            categories = Category.objects.all()
        
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Get all products in a specific category"""
        try:
            category = self.get_object()
            products = Product.objects.filter(category=category, is_active=True)
            serializer = ProductSerializer(products, many=True)
            return Response({
                'category': CategorySerializer(category).data,
                'products': serializer.data,
                'count': products.count()
            })
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get category statistics"""
        categories = Category.objects.all()
        stats = []
        
        for category in categories:
            product_count = Product.objects.filter(category=category, is_active=True).count()
            stats.append({
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'product_count': product_count
            })
        
        return Response({
            'total_categories': categories.count(),
            'categories': stats
        })
    
    @action(detail=True, methods=['get'])
    def popular_products(self, request, pk=None):
        """Get popular products in a category (based on reviews/orders)"""
        try:
            category = self.get_object()
            # Get products with reviews, ordered by average rating
            products = Product.objects.filter(
                category=category, 
                is_active=True
            ).annotate(
                avg_rating=Avg('reviews__rating'),
                review_count=Count('reviews')
            ).filter(
                review_count__gt=0
            ).order_by('-avg_rating', '-review_count')[:10]
            
            serializer = ProductSerializer(products, many=True)
            return Response({
                'category': CategorySerializer(category).data,
                'popular_products': serializer.data
            })
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

# Tag ViewSet
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

# Review ViewSet
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return CreateReviewSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateReviewSerializer
        return ReviewSerializer

    def get_queryset(self):
        """Filter reviews based on user permissions and request parameters"""
        queryset = Review.objects.select_related('user', 'product', 'shop')
        
        # Filter by review type
        review_type = self.request.query_params.get('review_type')
        if review_type:
            queryset = queryset.filter(review_type=review_type)
        
        # Filter by product
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product__productId=product_id)
        
        # Filter by shop
        shop_id = self.request.query_params.get('shop_id')
        if shop_id:
            queryset = queryset.filter(shop__shopId=shop_id)
        
        # Filter by rating
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        else:
            # By default, only show approved reviews
            queryset = queryset.filter(status='approved')
        
        # Sort reviews
        sort_by = self.request.query_params.get('sort_by', 'created_at')
        sort_order = self.request.query_params.get('sort_order', 'desc')
        
        if sort_order == 'desc':
            sort_by = f'-{sort_by}'
        
        queryset = queryset.order_by(sort_by)
        
        return queryset

    def perform_create(self, serializer):
        """Create review and validate user permissions"""
        # Check if user has already reviewed this item
        product = serializer.validated_data.get('product')
        shop = serializer.validated_data.get('shop')
        
        if product:
            if Review.objects.filter(user=self.request.user, product=product).exists():
                raise PermissionError("You have already reviewed this product.")
        elif shop:
            if Review.objects.filter(user=self.request.user, shop=shop).exists():
                raise PermissionError("You have already reviewed this shop.")
        
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Update review and validate ownership"""
        review = self.get_object()
        if review.user != self.request.user:
            raise PermissionError("You can only edit your own reviews.")
        serializer.save()

    def perform_destroy(self, instance):
        """Delete review and validate ownership"""
        if instance.user != self.request.user:
            raise PermissionError("You can only delete your own reviews.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """Get current user's reviews"""
        reviews = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get reviews for a specific product"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reviews = self.get_queryset().filter(product__productId=product_id)
            serializer = self.get_serializer(reviews, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def by_shop(self, request):
        """Get reviews for a specific shop"""
        shop_id = request.query_params.get('shop_id')
        if not shop_id:
            return Response(
                {'error': 'shop_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reviews = self.get_queryset().filter(shop__shopId=shop_id)
            serializer = self.get_serializer(reviews, many=True)
            return Response(serializer.data)
        except Shop.DoesNotExist:
            return Response(
                {'error': 'Shop not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get review statistics"""
        product_id = request.query_params.get('product_id')
        shop_id = request.query_params.get('shop_id')
        
        if product_id:
            reviews = self.get_queryset().filter(product__productId=product_id)
        elif shop_id:
            reviews = self.get_queryset().filter(shop__shopId=shop_id)
        else:
            return Response(
                {'error': 'Either product_id or shop_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not reviews.exists():
            return Response({
                'total_reviews': 0,
                'average_rating': 0,
                'rating_distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
                'recent_reviews': [],
                'helpful_reviews': []
            })
        
        # Calculate statistics
        total_reviews = reviews.count()
        average_rating = reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        
        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[i] = reviews.filter(rating=i).count()
        
        # Recent reviews (last 5)
        recent_reviews = reviews.order_by('-created_at')[:5]
        
        # Most helpful reviews (top 5)
        helpful_reviews = reviews.order_by('-helpful_count')[:5]
        
        data = {
            'total_reviews': total_reviews,
            'average_rating': round(average_rating, 1),
            'rating_distribution': rating_distribution,
            'recent_reviews': ReviewSerializer(recent_reviews, many=True).data,
            'helpful_reviews': ReviewSerializer(helpful_reviews, many=True).data
        }
        
        return Response(data)

    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Mark a review as helpful"""
        review = self.get_object()
        
        # Check if user has already marked this review as helpful
        # (This could be enhanced with a separate model for tracking helpful votes)
        
        review.helpful_count += 1
        review.save()
        
        serializer = self.get_serializer(review)
        return Response({
            'message': 'Review marked as helpful',
            'review': serializer.data
        })

    @action(detail=False, methods=['get'])
    def pending_moderation(self, request):
        """Get reviews pending moderation (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        reviews = Review.objects.filter(status='pending').select_related('user', 'product', 'shop')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def moderate(self, request, pk=None):
        """Moderate a review (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        review = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['approved', 'rejected']:
            return Response(
                {'error': 'Invalid status. Must be "approved" or "rejected"'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        review.status = new_status
        review.save()
        
        serializer = self.get_serializer(review)
        return Response({
            'message': f'Review {new_status}',
            'review': serializer.data
        })

# ProductVariant ViewSet
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter variants based on user permissions"""
        if self.request.user.is_staff:
            return ProductVariant.objects.all()
        # Shop owners can see variants for their products
        return ProductVariant.objects.filter(product__shops__shopowner=self.request.user)

    def perform_create(self, serializer):
        """Create variant and validate shop ownership"""
        product = serializer.validated_data['product']
        # Check if user owns the shop that sells this product
        if not product.shops.filter(shopowner=self.request.user).exists():
            raise PermissionError("You can only create variants for products in your shops.")
        serializer.save()

    def perform_update(self, serializer):
        """Update variant and validate shop ownership"""
        product = serializer.instance.product
        # Check if user owns the shop that sells this product
        if not product.shops.filter(shopowner=self.request.user).exists():
            raise PermissionError("You can only update variants for products in your shops.")
        serializer.save()

    def perform_destroy(self, instance):
        """Delete variant and validate shop ownership"""
        product = instance.product
        # Check if user owns the shop that sells this product
        if not product.shops.filter(shopowner=self.request.user).exists():
            raise PermissionError("You can only delete variants for products in your shops.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get all variants for a specific product"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(productId=product_id)
            variants = ProductVariant.objects.filter(product=product)
            serializer = self.get_serializer(variants, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def my_product_variants(self, request):
        """Get all variants for products owned by the current user"""
        variants = ProductVariant.objects.filter(
            product__shops__shopowner=request.user
        ).select_related('product')
        serializer = self.get_serializer(variants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_quantity(self, request, pk=None):
        """Update variant quantity"""
        try:
            variant = self.get_object()
            quantity = request.data.get('quantity')
            
            if quantity is None:
                return Response(
                    {'error': 'quantity field is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if quantity < 0:
                return Response(
                    {'error': 'Quantity cannot be negative'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            variant.quantity = quantity
            variant.save()
            serializer = self.get_serializer(variant)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def update_price_adjustment(self, request, pk=None):
        """Update variant price adjustment"""
        try:
            variant = self.get_object()
            price_adjustment = request.data.get('price_adjustment')
            
            if price_adjustment is None:
                return Response(
                    {'error': 'price_adjustment field is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            variant.price_adjustment = price_adjustment
            variant.save()
            serializer = self.get_serializer(variant)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get variants with low stock (quantity <= 5)"""
        variants = ProductVariant.objects.filter(
            product__shops__shopowner=request.user,
            quantity__lte=5
        ).select_related('product')
        serializer = self.get_serializer(variants, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Get variants that are out of stock"""
        variants = ProductVariant.objects.filter(
            product__shops__shopowner=request.user,
            quantity=0
        ).select_related('product')
        serializer = self.get_serializer(variants, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get variant statistics for the user's products"""
        user_variants = ProductVariant.objects.filter(
            product__shops__shopowner=request.user
        )
        
        total_variants = user_variants.count()
        total_quantity = user_variants.aggregate(
            total=models.Sum('quantity')
        )['total'] or 0
        low_stock_count = user_variants.filter(quantity__lte=5).count()
        out_of_stock_count = user_variants.filter(quantity=0).count()
        
        # Get variants by name (e.g., Size, Color)
        variants_by_name = user_variants.values('name').annotate(
            count=models.Count('id')
        ).order_by('-count')
        
        return Response({
            'total_variants': total_variants,
            'total_quantity': total_quantity,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
            'variants_by_name': variants_by_name
        })

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple variants at once"""
        variants_data = request.data.get('variants', [])
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not variants_data:
            return Response(
                {'error': 'variants array is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(productId=product_id)
            # Check if user owns the shop that sells this product
            if not product.shops.filter(shopowner=request.user).exists():
                return Response(
                    {'error': 'You can only create variants for products in your shops'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            created_variants = []
            for variant_data in variants_data:
                variant_data['product'] = product.id
                serializer = self.get_serializer(data=variant_data)
                if serializer.is_valid():
                    variant = serializer.save()
                    created_variants.append(variant)
                else:
                    return Response(
                        {'error': f'Invalid variant data: {serializer.errors}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            result_serializer = self.get_serializer(created_variants, many=True)
            return Response(result_serializer.data, status=status.HTTP_201_CREATED)
            
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """Delete multiple variants at once"""
        variant_ids = request.data.get('variant_ids', [])
        
        if not variant_ids:
            return Response(
                {'error': 'variant_ids array is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get variants that belong to user's products
            variants = ProductVariant.objects.filter(
                id__in=variant_ids,
                product__shops__shopowner=request.user
            )
            
            deleted_count = variants.count()
            variants.delete()
            
            return Response({
                'message': f'Successfully deleted {deleted_count} variants',
                'deleted_count': deleted_count
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

# UserProfile ViewSet
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsProfileOwner]

    def perform_create(self, serializer):
        # Automatically assign the current user to the profile
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Check if user already has a profile
        if hasattr(request.user, 'profile'):
            return Response({
                'detail': 'User profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        # Users can only see their own profile
        return UserProfile.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        # For list endpoint, return only the current user's profile
        try:
            profile = request.user.profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Get or update current user's profile"""
        try:
            profile = request.user.profile
            
            if request.method == 'GET':
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
            elif request.method == 'PATCH':
                serializer = UserProfileUpdateSerializer(
                    profile,
                    data=request.data,
                    partial=True
                )
                
                if serializer.is_valid():
                    serializer.save()
                    return Response({
                        'message': 'Profile updated successfully',
                        'profile': serializer.data
                    })
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'])
    def update_bio(self, request):
        """Update user's bio"""
        try:
            profile = request.user.profile
            serializer = UserProfileUpdateSerializer(
                profile,
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Bio updated successfully',
                    'bio': serializer.validated_data.get('bio', profile.bio)
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'])
    def update_address(self, request):
        """Update user's address"""
        try:
            profile = request.user.profile
            serializer = UserProfileUpdateSerializer(
                profile,
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Address updated successfully',
                    'address': serializer.validated_data.get('address', profile.address)
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def upload_avatar(self, request):
        """Upload user avatar"""
        try:
            profile = request.user.profile
            
            if 'avatar' not in request.FILES:
                return Response({
                    'detail': 'No avatar file provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Delete old avatar if exists
            if profile.avatar:
                profile.avatar.delete(save=False)
            
            # Save new avatar
            profile.avatar = request.FILES['avatar']
            profile.save()
            
            return Response({
                'message': 'Avatar uploaded successfully',
                'avatar_url': profile.avatar.url if profile.avatar else None
            })
            
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'detail': f'Error uploading avatar: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['delete'])
    def remove_avatar(self, request):
        """Remove user avatar"""
        try:
            profile = request.user.profile
            
            if profile.avatar:
                profile.avatar.delete(save=False)
                profile.avatar = None
                profile.save()
                
                return Response({
                    'message': 'Avatar removed successfully'
                })
            else:
                return Response({
                    'detail': 'No avatar to remove'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def completion_status(self, request):
        """Get profile completion status"""
        try:
            profile = request.user.profile
            
            # Calculate completion percentage
            fields = ['bio', 'avatar', 'address']
            completed_fields = sum([
                1 for field in fields if getattr(profile, field)
            ])
            completion_percentage = (completed_fields / len(fields)) * 100
            
            return Response({
                'completion_percentage': completion_percentage,
                'completed_fields': completed_fields,
                'total_fields': len(fields),
                'missing_fields': [field for field in fields if not getattr(profile, field)]
            })
            
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'])
    def toggle_shopowner_status(self, request):
        """Toggle shopowner status (admin only)"""
        if not request.user.is_staff:
            return Response({
                'detail': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.profile
            profile.is_shopowner = not profile.is_shopowner
            profile.save()
            
            return Response({
                'message': f'Shopowner status {"enabled" if profile.is_shopowner else "disabled"}',
                'is_shopowner': profile.is_shopowner
            })
            
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search user profiles"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({
                'detail': 'Search query required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        profiles = UserProfile.objects.filter(
            models.Q(user__username__icontains=query) |
            models.Q(user__first_name__icontains=query) |
            models.Q(user__last_name__icontains=query) |
            models.Q(bio__icontains=query)
        )
        
        serializer = PublicUserProfileSerializer(profiles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user profile statistics"""
        if not request.user.is_staff:
            return Response({
                'detail': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        total_profiles = UserProfile.objects.count()
        shopowners = UserProfile.objects.filter(is_shopowner=True).count()
        profiles_with_avatar = UserProfile.objects.filter(avatar__isnull=False).count()
        profiles_with_bio = UserProfile.objects.filter(bio__isnull=False).exclude(bio='').count()
        
        return Response({
            'total_profiles': total_profiles,
            'shopowners': shopowners,
            'regular_users': total_profiles - shopowners,
            'profiles_with_avatar': profiles_with_avatar,
            'profiles_with_bio': profiles_with_bio,
            'completion_rate': {
                'avatar': (profiles_with_avatar / total_profiles * 100) if total_profiles > 0 else 0,
                'bio': (profiles_with_bio / total_profiles * 100) if total_profiles > 0 else 0
            }
        })

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def public(self, request, pk=None):
        """Get public profile information"""
        try:
            profile = self.get_object()
            serializer = PublicUserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

# Order ViewSet
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own orders
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        # Create order from cart or direct order
        if hasattr(serializer, 'validated_data'):
            # Direct order creation
            validated_data = serializer.validated_data
            shop = validated_data['shop']
            validated_items = validated_data['validated_items']
            total = validated_data['total']
            
            # Create order
            order = Order.objects.create(
                user=self.request.user,
                shop=shop,
                total=total,
                status='pending'
            )
            
            # Create order items and update stock
            for item_data in validated_items:
                product = item_data['product']
                quantity = item_data['quantity']
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity
                )
                
                # Update product stock
                product.quantity -= quantity
                product.save()
            
            # Update shop statistics
            shop.total_orders += 1
            shop.total_sales += total
            shop.save()
            
            # Create notification for customer
            Notification.objects.create(
                user=self.request.user,
                text=f"Order #{order.id} created successfully for {shop.name}",
                type='order_created',
                order=order,
                shop=shop,
                data={
                    'order_id': order.id,
                    'shop_name': shop.name,
                    'total': float(total),
                    'items_count': len(validated_items)
                }
            )
            
            # Create enhanced notifications for shop owner
            notify_shop_owner_new_order(order)
            
            return order
        else:
            # Cart-based order creation
            return serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get current user's orders"""
        orders = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status (shop owners only)"""
        order = self.get_object()
        
        # Check if user is the shop owner
        if order.shop.shopowner != request.user:
            return Response({
                'detail': 'Only shop owners can update order status'
            }, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({
                'detail': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Create notification for customer about status update
        status_messages = {
            'paid': 'Your order has been paid',
            'shipped': 'Your order has been shipped',
            'delivered': 'Your order has been delivered',
            'cancelled': 'Your order has been cancelled'
        }
        
        if new_status in status_messages:
            Notification.objects.create(
                user=order.user,
                text=f"Order #{order.id} status updated: {status_messages[new_status]}",
                type='order_status_updated',
                order=order,
                shop=order.shop,
                data={
                    'order_id': order.id,
                    'old_status': old_status,
                    'new_status': new_status,
                    'shop_name': order.shop.name
                }
            )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def order_details(self, request, pk=None):
        """Get detailed order information"""
        order = self.get_object()
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """Create order from user's cart"""
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({
                'detail': 'Cart not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not cart.items.exists():
            return Response({
                'detail': 'Cart is empty'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Group cart items by shop
        shop_orders = {}
        for item in cart.items.all():
            shop_id = str(item.shop.shopId)
            if shop_id not in shop_orders:
                shop_orders[shop_id] = {
                    'shop': item.shop,
                    'items': []
                }
            shop_orders[shop_id]['items'].append(item)
        
        created_orders = []
        
        # Create orders for each shop
        for shop_data in shop_orders.values():
            shop = shop_data['shop']
            items = shop_data['items']
            
            # Calculate total
            total = sum(item.total_price for item in items)
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                shop=shop,
                total=total,
                status='pending'
            )
            
            # Create order items and update stock
            for item in items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity
                )
                
                # Update product stock
                item.product.quantity -= item.quantity
                item.product.save()
            
            # Update shop statistics
            shop.total_orders += 1
            shop.total_sales += total
            shop.save()
            
            created_orders.append(order)
        
        # Clear the cart
        cart.items.all().delete()
        
        serializer = self.get_serializer(created_orders, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def shop_orders(self, request):
        """Get orders for shops owned by the current user (shop owner only)"""
        # Check if user is a shop owner
        try:
            user_profile = request.user.profile
            if not user_profile.is_shopowner:
                return Response({
                    'detail': 'Only shop owners can view shop orders'
                }, status=status.HTTP_403_FORBIDDEN)
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get shops owned by the user
        user_shops = Shop.objects.filter(shopowner=request.user)
        if not user_shops.exists():
            return Response({
                'detail': 'No shops found for this user'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get orders for all shops owned by the user
        orders = Order.objects.filter(shop__in=user_shops).order_by('-created_at')
        
        # Apply filters if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        shop_filter = request.query_params.get('shop_id')
        if shop_filter:
            orders = orders.filter(shop__shopId=shop_filter)
        
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def shop_order_stats(self, request):
        """Get order statistics for shops owned by the current user (shop owner only)"""
        # Check if user is a shop owner
        try:
            user_profile = request.user.profile
            if not user_profile.is_shopowner:
                return Response({
                    'detail': 'Only shop owners can view shop order statistics'
                }, status=status.HTTP_403_FORBIDDEN)
        except UserProfile.DoesNotExist:
            return Response({
                'detail': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get shops owned by the user
        user_shops = Shop.objects.filter(shopowner=request.user)
        if not user_shops.exists():
            return Response({
                'detail': 'No shops found for this user'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get orders for all shops owned by the user
        orders = Order.objects.filter(shop__in=user_shops)
        
        # Calculate statistics
        total_orders = orders.count()
        pending_orders = orders.filter(status='pending').count()
        completed_orders = orders.filter(status='delivered').count()
        total_revenue = orders.filter(status='delivered').aggregate(
            total=models.Sum('total')
        )['total'] or 0
        
        # Statistics by shop
        shop_stats = []
        for shop in user_shops:
            shop_orders = orders.filter(shop=shop)
            shop_stats.append({
                'shop_id': shop.shopId,
                'shop_name': shop.name,
                'total_orders': shop_orders.count(),
                'pending_orders': shop_orders.filter(status='pending').count(),
                'completed_orders': shop_orders.filter(status='delivered').count(),
                'total_revenue': shop_orders.filter(status='delivered').aggregate(
                    total=models.Sum('total')
                )['total'] or 0
            })
        
        return Response({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'total_revenue': total_revenue,
            'shop_stats': shop_stats
        })

    @action(detail=True, methods=['patch'])
    def complete_order(self, request, pk=None):
        """Mark an order as completed (shop owners only)"""
        order = self.get_object()
        
        # Check if user is the shop owner
        if order.shop.shopowner != request.user:
            return Response({
                'detail': 'Only shop owners can complete orders'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Update order status to delivered (completed)
        order.status = 'delivered'
        order.save()
        
        # Create notification for the customer
        Notification.objects.create(
            user=order.user,
            text=f'Your order #{order.id} from {order.shop.name} has been completed!',
            type='order_completed',
            order=order,
            shop=order.shop
        )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsShopOwnerForManagement])
    def daily_orders_count(self, request):
        """Get daily order count for shop owner"""
        date_str = request.query_params.get('date')  # Format: YYYY-MM-DD
        
        # Validate shop owner status
        if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
            return Response({
                'detail': 'Only shop owners can access daily order statistics'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            stats = get_shop_owner_daily_stats(request.user, date_str)
            return Response(stats)
        except Exception as e:
            return Response({
                'detail': f'Error retrieving daily statistics: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[IsShopOwnerForManagement])
    def weekly_orders_summary(self, request):
        """Get weekly order summary for shop owner"""
        date_str = request.query_params.get('date')  # Format: YYYY-MM-DD
        
        # Validate shop owner status
        if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
            return Response({
                'detail': 'Only shop owners can access weekly order statistics'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            target_date = None
            if date_str:
                from datetime import datetime
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            stats = ShopOwnerNotificationManager.get_weekly_order_stats(request.user, target_date)
            return Response(stats)
        except ValueError:
            return Response({
                'detail': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'detail': f'Error retrieving weekly statistics: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[IsShopOwnerForManagement])
    def create_daily_summary(self, request):
        """Create daily summary notification for shop owner"""
        date_str = request.data.get('date')  # Format: YYYY-MM-DD
        
        # Validate shop owner status
        if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
            return Response({
                'detail': 'Only shop owners can create daily summaries'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            create_daily_summary_for_shop_owner(request.user, date_str)
            return Response({
                'detail': 'Daily summary notification created successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'detail': f'Error creating daily summary: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[IsShopOwnerForManagement])
    def order_notifications(self, request):
        """Get order-related notifications for shop owner"""
        # Validate shop owner status
        if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
            return Response({
                'detail': 'Only shop owners can access order notifications'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get order-related notification types
        order_notification_types = [
            'new_order_received',
            'order_completed', 
            'order_status_updated',
            'product_ordered',
            'product_low_stock',
            'product_out_of_stock',
            'daily_summary',
            'weekly_summary'
        ]
        
        notifications = Notification.objects.filter(
            user=request.user,
            type__in=order_notification_types
        ).order_by('-timestamp')
        
        # Add pagination
        from django.core.paginator import Paginator
        page_size = request.query_params.get('page_size', 20)
        page_number = request.query_params.get('page', 1)
        
        try:
            page_size = int(page_size)
            page_number = int(page_number)
        except ValueError:
            page_size = 20
            page_number = 1
        
        paginator = Paginator(notifications, page_size)
        page_notifications = paginator.get_page(page_number)
        
        serialized_notifications = []
        for notification in page_notifications:
            serialized_notifications.append({
                'id': notification.id,
                'text': notification.text,
                'type': notification.type,
                'is_read': notification.is_read,
                'timestamp': notification.timestamp.isoformat(),
                'data': notification.data if hasattr(notification, 'data') else {},
                'shop_id': notification.shop.shopId if notification.shop else None,
                'shop_name': notification.shop.name if notification.shop else None,
                'order_id': notification.order.id if notification.order else None,
                'product_id': notification.product.productId if notification.product else None,
                'product_name': notification.product.name if notification.product else None
            })
        
        return Response({
            'notifications': serialized_notifications,
            'pagination': {
                'current_page': page_number,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_notifications.has_next(),
                'has_previous': page_notifications.has_previous()
            }
        })

# OrderItem ViewSet
class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

# Payment ViewSet
class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see payments for their own orders
        return Payment.objects.filter(order__user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return CreatePaymentSerializer
        return PaymentSerializer

    def perform_create(self, serializer):
        # Create payment and update order status
        payment = serializer.save()
        
        # Update order status to paid
        order = payment.order
        order.status = 'paid'
        order.save()
        
        return payment

    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Get current user's payments"""
        payments = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update payment status (admin/shop owner only)"""
        payment = self.get_object()
        
        # Check if user is the shop owner or admin
        if payment.order.shop.shopowner != request.user and not request.user.is_staff:
            return Response({
                'detail': 'Only shop owners or admins can update payment status'
            }, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in dict(Payment.STATUS_CHOICES):
            return Response({
                'detail': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = new_status
        payment.save()
        
        # Update order status based on payment status
        if new_status == 'completed':
            payment.order.status = 'paid'
            payment.order.save()
        elif new_status == 'failed':
            payment.order.status = 'pending'
            payment.order.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)

# Wishlist ViewSet
class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    
    def get_queryset(self):
        # Users can only see their own wishlists
        return Wishlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically assign the current user to the wishlist
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_product(self, request, pk=None):
        wishlist = self.get_object()
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response({
                'detail': 'Product ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(productId=product_id)
            
            if product in wishlist.products.all():
                return Response({
                    'detail': 'Product already in wishlist'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            wishlist.products.add(product)
            
            return Response({
                'message': 'Product added to wishlist'
            }, status=status.HTTP_200_OK)
            
        except Product.DoesNotExist:
            return Response({
                'detail': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['delete'], url_path='remove_product/(?P<product_id>[^/.]+)')
    def remove_product(self, request, pk=None, product_id=None):
        wishlist = self.get_object()
        
        try:
            product = Product.objects.get(productId=product_id)
            
            if product not in wishlist.products.all():
                return Response({
                    'detail': 'Product not in wishlist'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            wishlist.products.remove(product)
            
            return Response({
                'message': 'Product removed from wishlist'
            }, status=status.HTTP_200_OK)
            
        except Product.DoesNotExist:
            return Response({
                'detail': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def my_wishlist(self, request):
        """Get current user's wishlist"""
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
        except Wishlist.DoesNotExist:
            return Response({
                'detail': 'Wishlist not found'
            }, status=status.HTTP_404_NOT_FOUND)

# Message ViewSet
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateMessageSerializer
        return MessageSerializer
    
    def get_queryset(self):
        # Users can only see messages they sent or received
        return Message.objects.filter(
            models.Q(sender=self.request.user) | models.Q(recipient=self.request.user)
        ).order_by('-timestamp')
    
    def perform_create(self, serializer):
        # Automatically set the sender to the current user and create notification
        message_obj = serializer.save(sender=self.request.user)
        
        # Create notification for the recipient
        Notification.objects.create(
            user=message_obj.recipient,
            text=f"You have received a new message from {message_obj.sender.get_full_name() or message_obj.sender.username}",
            type='message_received',
            message=message_obj,
            data={
                'sender_id': message_obj.sender.id,
                'sender_name': message_obj.sender.get_full_name() or message_obj.sender.username,
                'message_preview': message_obj.content[:100] + '...' if len(message_obj.content) > 100 else message_obj.content,
                'shop_id': message_obj.shop.shopId if message_obj.shop else None,
                'shop_name': message_obj.shop.name if message_obj.shop else None,
            }
        )
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """Get messages sent by the current user"""
        messages = Message.objects.filter(sender=request.user).order_by('-timestamp')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def received(self, request):
        """Get messages received by the current user"""
        messages = Message.objects.filter(recipient=request.user).order_by('-timestamp')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread messages"""
        count = Message.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        
        # Only the recipient can mark a message as read
        if message.recipient != request.user:
            return Response({
                'detail': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        message.is_read = True
        message.save()
        
        return Response({
            'message': 'Message marked as read'
        })
    
    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        """Mark all messages as read"""
        Message.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': 'All messages marked as read'
        })
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get unique conversations"""
        # Get all users the current user has messaged with
        sent_to = Message.objects.filter(sender=request.user).values_list('recipient', flat=True).distinct()
        received_from = Message.objects.filter(recipient=request.user).values_list('sender', flat=True).distinct()
        
        # Combine and get unique users
        all_users = set(list(sent_to) + list(received_from))
        
        conversations = []
        for user_id in all_users:
            user = User.objects.get(id=user_id)
            
            # Get the latest message in this conversation
            latest_message = Message.objects.filter(
                models.Q(sender=request.user, recipient=user) |
                models.Q(sender=user, recipient=request.user)
            ).order_by('-timestamp').first()
            
            # Get unread count
            unread_count = Message.objects.filter(
                sender=user,
                recipient=request.user,
                is_read=False
            ).count()
            
            conversations.append({
                'user': {
                    'id': user.id,
                'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'latest_message': {
                    'content': latest_message.content,
                    'timestamp': latest_message.timestamp,
                    'is_from_me': latest_message.sender == request.user
                },
                'unread_count': unread_count
            })
        
        # Sort by latest message timestamp
        conversations.sort(key=lambda x: x['latest_message']['timestamp'], reverse=True)
        
        return Response(conversations)
    
    @action(detail=False, methods=['get'])
    def with_user(self, request):
        """Get conversation with a specific user"""
        other_user_id = request.query_params.get('user_id')
        if not other_user_id:
            return Response({
                'detail': 'User ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({
                'detail': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        messages = Message.objects.filter(
            models.Q(sender=request.user, recipient=other_user) |
            models.Q(sender=other_user, recipient=request.user)
        ).order_by('timestamp')
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, pk=None):
        """Delete a message (only sender or recipient can delete)"""
        message = self.get_object()
        
        # Only sender or recipient can delete the message
        if message.sender != request.user and message.recipient != request.user:
            return Response({
                'detail': 'Permission denied. You can only delete messages you sent or received.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        message.delete()
        return Response({
            'message': 'Message deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

# Product Inquiry ViewSet
class ProductInquiryViewSet(viewsets.ModelViewSet):
    serializer_class = ProductInquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can see inquiries they made or received
        return ProductInquiry.objects.filter(
            models.Q(customer=self.request.user) | models.Q(shop_owner=self.request.user)
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateProductInquirySerializer
        elif self.action == 'respond':
            return ProductInquiryResponseSerializer
        return ProductInquirySerializer

    def perform_create(self, serializer):
        # Automatically set the customer to the current user
        inquiry = serializer.save(customer=self.request.user)
        
        # Create notification for shop owner
        Notification.objects.create(
            user=inquiry.shop_owner,
            text=f"New inquiry about {inquiry.product.name} from {inquiry.customer.username}",
            type='product_inquiry',
            product=inquiry.product,
            inquiry=inquiry,
            data={
                'inquiry_id': inquiry.id,
                'product_name': inquiry.product.name,
                'customer_name': inquiry.customer.username
            }
        )
        
        return inquiry

    @action(detail=True, methods=['patch'])
    def respond(self, request, pk=None):
        """Respond to a product inquiry (shop owners only)"""
        inquiry = self.get_object()
        
        # Check if user is the shop owner
        if inquiry.shop_owner != request.user:
            return Response({
                'detail': 'Only shop owners can respond to inquiries'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if inquiry is still pending
        if inquiry.status != 'pending':
            return Response({
                'detail': 'Inquiry has already been responded to'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProductInquiryResponseSerializer(inquiry, data=request.data, partial=True)
        if serializer.is_valid():
            from django.utils import timezone
            
            inquiry.response = serializer.validated_data['response']
            inquiry.status = 'responded'
            inquiry.responded_at = timezone.now()
            inquiry.save()
            
            # Create notification for customer
            Notification.objects.create(
                user=inquiry.customer,
                text=f"Response received for your inquiry about {inquiry.product.name}",
                type='product_inquiry_response',
                product=inquiry.product,
                inquiry=inquiry,
                data={
                    'inquiry_id': inquiry.id,
                    'product_name': inquiry.product.name,
                    'shop_owner_name': inquiry.shop_owner.username
                }
            )
            
            return Response(ProductInquirySerializer(inquiry).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def mark_resolved(self, request, pk=None):
        """Mark inquiry as resolved"""
        inquiry = self.get_object()
        
        # Check if user is the shop owner
        if inquiry.shop_owner != request.user:
            return Response({
                'detail': 'Only shop owners can mark inquiries as resolved'
            }, status=status.HTTP_403_FORBIDDEN)
        
        inquiry.status = 'resolved'
        inquiry.save()
        
        return Response(ProductInquirySerializer(inquiry).data)

    @action(detail=False, methods=['get'])
    def my_inquiries(self, request):
        """Get inquiries made by the current user"""
        inquiries = ProductInquiry.objects.filter(customer=request.user)
        serializer = self.get_serializer(inquiries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def received_inquiries(self, request):
        """Get inquiries received by the current user (shop owners only)"""
        inquiries = ProductInquiry.objects.filter(shop_owner=request.user)
        serializer = self.get_serializer(inquiries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_inquiries(self, request):
        """Get pending inquiries for shop owners"""
        inquiries = ProductInquiry.objects.filter(
            shop_owner=request.user,
            status='pending'
        )
        serializer = self.get_serializer(inquiries, many=True)
        return Response(serializer.data)

# Notification ViewSet
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        # Users can only see their own notifications
        return Notification.objects.filter(user=self.request.user).order_by('-timestamp')
    
    def perform_create(self, serializer):
        # Automatically set the user to the current user
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).order_by('-timestamp')
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        
        # Only the user can mark their own notification as read
        if notification.user != request.user:
            return Response({
                'detail': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        notification.is_read = True
        notification.save()
        
        return Response({
            'message': 'Notification marked as read'
        })
    
    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': 'All notifications marked as read'
        })
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get notifications by type"""
        notification_type = request.query_params.get('type')
        if not notification_type:
            return Response({
                'detail': 'Notification type is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        notifications = Notification.objects.filter(
            user=request.user,
            type=notification_type
        ).order_by('-timestamp')
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear_old(self, request):
        """Clear old notifications (older than 30 days)"""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=30)
        deleted_count = Notification.objects.filter(
            user=request.user,
            timestamp__lt=cutoff_date
        ).delete()[0]
        
        return Response({
            'message': f'{deleted_count} old notifications cleared'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notification statistics"""
        total_notifications = Notification.objects.filter(user=request.user).count()
        unread_notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        # Get notifications by type
        notifications_by_type = {}
        for notification_type, _ in Notification.NOTIFICATION_TYPES:
            count = Notification.objects.filter(
                user=request.user,
                type=notification_type
            ).count()
            if count > 0:
                notifications_by_type[notification_type] = count
        
        return Response({
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'notifications_by_type': notifications_by_type
        })

    @action(detail=False, methods=['post'])
    def create_notification(self, request):
        """Create a notification (for internal use)"""
        serializer = CreateNotificationSerializer(data=request.data)
        if serializer.is_valid():
            notification = serializer.save(user=request.user)
            return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def order_notifications(self, request):
        """Get order-related notifications"""
        order_types = ['order_created', 'order_status_updated', 'order_delivered', 'order_cancelled']
        notifications = Notification.objects.filter(
            user=request.user,
            type__in=order_types
        ).order_by('-timestamp')
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def cart_notifications(self, request):
        """Get cart-related notifications"""
        cart_types = ['cart_item_added', 'cart_updated', 'cart_cleared']
        notifications = Notification.objects.filter(
            user=request.user,
            type__in=cart_types
        ).order_by('-timestamp')
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def product_notifications(self, request):
        """Get product-related notifications"""
        product_types = ['product_inquiry', 'product_inquiry_response', 'product_low_stock', 'product_out_of_stock']
        notifications = Notification.objects.filter(
            user=request.user,
            type__in=product_types
        ).order_by('-timestamp')
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

# User registration ViewSet
class UserRegistrationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

# Shopowner registration ViewSet
class ShopownerRegistrationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = ShopownerRegistrationSerializer
    permission_classes = [permissions.AllowAny]

# User detail ViewSet
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own data unless they are staff
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's details"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        """Update current user's details"""
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'User details updated successfully',
                'user': serializer.data
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
