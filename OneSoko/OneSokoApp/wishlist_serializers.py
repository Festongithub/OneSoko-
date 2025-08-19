from rest_framework import serializers
from .models import Wishlist, Product
from .serializers import ProductSerializer

class EnhancedWishlistSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()
    available_items = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'products', 'total_items', 'total_value', 'available_items', 'created_at', 'updated_at']
    
    def get_total_items(self, obj):
        return obj.products.count()
    
    def get_total_value(self, obj):
        return sum(float(product.price) for product in obj.products.all() if product.price)
    
    def get_available_items(self, obj):
        return obj.products.filter(is_active=True, deleted_at__isnull=True).count()

class WishlistProductSerializer(serializers.ModelSerializer):
    """Serializer for products in wishlist with additional wishlist-specific fields"""
    in_wishlist = serializers.SerializerMethodField()
    added_to_wishlist_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['productId', 'name', 'description', 'price', 'promotional_price', 'image', 
                 'category', 'is_active', 'average_rating', 'in_wishlist', 'added_to_wishlist_at']
    
    def get_in_wishlist(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                wishlist = Wishlist.objects.get(user=request.user)
                return wishlist.products.filter(productId=obj.productId).exists()
            except Wishlist.DoesNotExist:
                return False
        return False
    
    def get_added_to_wishlist_at(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                wishlist = Wishlist.objects.get(user=request.user)
                # This would require a through model with timestamp
                # For now, we'll return None or wishlist creation date
                return None
            except Wishlist.DoesNotExist:
                return None
        return None
