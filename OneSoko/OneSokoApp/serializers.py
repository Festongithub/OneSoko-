from rest_framework import serializers
from .models import (
    Product, Shop, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, Wishlist, Message, Notification,
    ShopReview, ShopReviewResponse, ShopRatingSummary, ReviewHelpfulVote
)
from django.contrib.auth.models import User

# ProductVariant serializer
class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'

# Review serializer
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Review
        fields = '__all__'

# Product serializer
class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

# Category serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# Tag serializer
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

# Shop serializer
class ShopSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    shopowner = serializers.StringRelatedField(read_only=True)
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Shop
        fields = '__all__'
    
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

# UserProfile serializer
class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = UserProfile
        fields = '__all__'

# OrderItem serializer
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = OrderItem
        fields = '__all__'

# Order serializer
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    shop = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Order
        fields = '__all__'

# Payment serializer
class PaymentSerializer(serializers.ModelSerializer):
    order = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Payment
        fields = '__all__'

# Wishlist serializer
class WishlistSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    class Meta:
        model = Wishlist
        fields = '__all__'

# Message serializer
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    recipient = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Message
        fields = '__all__'

# Notification serializer
class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    priority_icon = serializers.ReadOnlyField()
    type_icon = serializers.ReadOnlyField()
    time_ago = serializers.SerializerMethodField()
    formatted_timestamp = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'message', 'type', 'priority', 'is_read', 
            'timestamp', 'shop', 'shop_name', 'product', 'product_name',
            'order', 'order_id', 'priority_icon', 'type_icon', 
            'time_ago', 'formatted_timestamp'
        ]
    
    def get_time_ago(self, obj):
        """Calculate time ago in human-readable format."""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.timestamp
        
        if diff.days > 7:
            return obj.timestamp.strftime('%B %d, %Y')
        elif diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def get_formatted_timestamp(self, obj):
        """Get formatted timestamp for display."""
        return obj.timestamp.strftime('%B %d, %Y at %I:%M %p')

# User registration serializer (regular user)
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        # Create UserProfile with is_shopowner=False
        from .models import UserProfile
        UserProfile.objects.create(user=user, is_shopowner=False)
        return user

# Shopowner registration serializer
class ShopownerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        # Create UserProfile with is_shopowner=True
        from .models import UserProfile
        UserProfile.objects.create(user=user, is_shopowner=True)
        return user 

# Shop Review System Serializers

class ShopReviewSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField(read_only=True)
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    helpful_votes_count = serializers.SerializerMethodField()
    response = serializers.SerializerMethodField()
    
    class Meta:
        model = ShopReview
        fields = [
            'id', 'shop', 'shop_name', 'customer', 'rating', 'title', 'review_text',
            'is_verified_purchase', 'status', 'created_at', 'updated_at',
            'helpful_votes_count', 'response'
        ]
        read_only_fields = ['customer', 'is_verified_purchase', 'status', 'created_at', 'updated_at']
    
    def get_helpful_votes_count(self, obj):
        return obj.helpful_votes.count()
    
    def get_response(self, obj):
        response = ShopReviewResponse.objects.filter(review=obj).first()
        if response:
            return {
                'response_text': response.response_text,
                'created_at': response.created_at,
                'updated_at': response.updated_at
            }
        return None

class ShopReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopReview
        fields = ['shop', 'rating', 'title', 'review_text']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class ShopReviewResponseSerializer(serializers.ModelSerializer):
    shop_owner = serializers.StringRelatedField(read_only=True)
    review_title = serializers.CharField(source='review.title', read_only=True)
    
    class Meta:
        model = ShopReviewResponse
        fields = [
            'id', 'review', 'review_title', 'shop_owner', 'response_text',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['shop_owner', 'created_at', 'updated_at']

class ShopRatingSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopRatingSummary
        fields = [
            'id', 'shop', 'total_reviews', 'average_rating',
            'five_star_percentage', 'four_star_percentage', 'three_star_percentage',
            'two_star_percentage', 'one_star_percentage', 'last_updated'
        ]
        read_only_fields = ['last_updated']

class ReviewHelpfulVoteSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ReviewHelpfulVote
        fields = ['id', 'review', 'customer', 'is_helpful', 'created_at']
        read_only_fields = ['customer', 'created_at']

# Combined serializer for shop with review summary
class ShopWithReviewsSerializer(serializers.ModelSerializer):
    rating_summary = ShopRatingSummarySerializer(read_only=True)
    recent_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Shop
        fields = '__all__'
    
    def get_recent_reviews(self, obj):
        recent_reviews = ShopReview.objects.filter(
            shop=obj, 
            status='approved'
        ).order_by('-created_at')[:3]
        return ShopReviewSerializer(recent_reviews, many=True).data