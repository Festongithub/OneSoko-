from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Wishlist, Product
from .serializers import WishlistSerializer, ProductSerializer
from django.db.models import Q

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return wishlist items for the authenticated user"""
        if hasattr(self.request.user, 'wishlists'):
            return self.request.user.wishlists.all()
        return Wishlist.objects.none()
    
    def list(self, request):
        """Get user's wishlist with all products"""
        try:
            # Get or create user's wishlist
            wishlist, created = Wishlist.objects.get_or_create(user=request.user)
            serializer = self.get_serializer(wishlist)
            return Response({
                'wishlist': serializer.data,
                'total_items': wishlist.products.count(),
                'created': created
            })
        except Exception as e:
            return Response(
                {'error': 'Failed to retrieve wishlist', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def add_product(self, request):
        """Add a product to user's wishlist"""
        try:
            product_id = request.data.get('product_id')
            if not product_id:
                return Response(
                    {'error': 'Product ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product = get_object_or_404(Product, productId=product_id)
            wishlist, created = Wishlist.objects.get_or_create(user=request.user)
            
            if wishlist.products.filter(productId=product_id).exists():
                return Response(
                    {'message': 'Product already in wishlist', 'in_wishlist': True},
                    status=status.HTTP_200_OK
                )
            
            wishlist.products.add(product)
            return Response({
                'message': 'Product added to wishlist successfully',
                'in_wishlist': True,
                'total_items': wishlist.products.count()
            }, status=status.HTTP_201_CREATED)
            
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to add product to wishlist', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['delete'])
    def remove_product(self, request):
        """Remove a product from user's wishlist"""
        try:
            product_id = request.data.get('product_id')
            if not product_id:
                return Response(
                    {'error': 'Product ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product = get_object_or_404(Product, productId=product_id)
            
            try:
                wishlist = Wishlist.objects.get(user=request.user)
            except Wishlist.DoesNotExist:
                return Response(
                    {'message': 'Product not in wishlist', 'in_wishlist': False},
                    status=status.HTTP_200_OK
                )
            
            if not wishlist.products.filter(productId=product_id).exists():
                return Response(
                    {'message': 'Product not in wishlist', 'in_wishlist': False},
                    status=status.HTTP_200_OK
                )
            
            wishlist.products.remove(product)
            return Response({
                'message': 'Product removed from wishlist successfully',
                'in_wishlist': False,
                'total_items': wishlist.products.count()
            }, status=status.HTTP_200_OK)
            
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to remove product from wishlist', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def toggle_product(self, request):
        """Toggle product in/out of wishlist"""
        try:
            product_id = request.data.get('product_id')
            if not product_id:
                return Response(
                    {'error': 'Product ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product = get_object_or_404(Product, productId=product_id)
            wishlist, created = Wishlist.objects.get_or_create(user=request.user)
            
            if wishlist.products.filter(productId=product_id).exists():
                wishlist.products.remove(product)
                in_wishlist = False
                message = 'Product removed from wishlist'
            else:
                wishlist.products.add(product)
                in_wishlist = True
                message = 'Product added to wishlist'
            
            return Response({
                'message': message,
                'in_wishlist': in_wishlist,
                'total_items': wishlist.products.count()
            }, status=status.HTTP_200_OK)
            
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to toggle product in wishlist', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def check_product(self, request):
        """Check if a product is in user's wishlist"""
        try:
            product_id = request.query_params.get('product_id')
            if not product_id:
                return Response(
                    {'error': 'Product ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                wishlist = Wishlist.objects.get(user=request.user)
                in_wishlist = wishlist.products.filter(productId=product_id).exists()
            except Wishlist.DoesNotExist:
                in_wishlist = False
            
            return Response({
                'in_wishlist': in_wishlist,
                'product_id': product_id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': 'Failed to check product status', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['delete'])
    def clear_wishlist(self, request):
        """Clear all products from user's wishlist"""
        try:
            try:
                wishlist = Wishlist.objects.get(user=request.user)
                wishlist.products.clear()
                return Response({
                    'message': 'Wishlist cleared successfully',
                    'total_items': 0
                }, status=status.HTTP_200_OK)
            except Wishlist.DoesNotExist:
                return Response({
                    'message': 'No wishlist found to clear',
                    'total_items': 0
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {'error': 'Failed to clear wishlist', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get wishlist statistics"""
        try:
            try:
                wishlist = Wishlist.objects.get(user=request.user)
                products = wishlist.products.all()
                
                # Calculate stats
                total_items = products.count()
                total_value = sum(float(product.price) for product in products if product.price)
                available_items = products.filter(is_active=True, deleted_at__isnull=True).count()
                categories = products.values_list('category__name', flat=True).distinct()
                
                return Response({
                    'total_items': total_items,
                    'total_value': total_value,
                    'available_items': available_items,
                    'unavailable_items': total_items - available_items,
                    'categories': list(categories),
                    'categories_count': len(categories)
                }, status=status.HTTP_200_OK)
                
            except Wishlist.DoesNotExist:
                return Response({
                    'total_items': 0,
                    'total_value': 0,
                    'available_items': 0,
                    'unavailable_items': 0,
                    'categories': [],
                    'categories_count': 0
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {'error': 'Failed to get wishlist stats', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def products_by_category(self, request):
        """Get wishlist products grouped by category"""
        try:
            try:
                wishlist = Wishlist.objects.get(user=request.user)
                products = wishlist.products.all()
                
                # Group by category
                categories = {}
                for product in products:
                    category_name = product.category.name if product.category else 'Uncategorized'
                    if category_name not in categories:
                        categories[category_name] = []
                    categories[category_name].append(ProductSerializer(product).data)
                
                return Response({
                    'categories': categories,
                    'total_categories': len(categories)
                }, status=status.HTTP_200_OK)
                
            except Wishlist.DoesNotExist:
                return Response({
                    'categories': {},
                    'total_categories': 0
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {'error': 'Failed to get products by category', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
