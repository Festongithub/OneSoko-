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

# Create your views here.

# Product ViewSet
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# Shop ViewSet
class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [IsShopOwner]

    def perform_create(self, serializer):
        # Automatically set the shopowner to the current user
        serializer.save(shopowner=self.request.user)

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        shop = self.get_object()
        products = shop.products.all()
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
