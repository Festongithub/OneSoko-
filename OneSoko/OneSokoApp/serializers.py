from rest_framework import serializers
from .models import (
    Product, Shop, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, Wishlist, Message, Notification,
    ShopReview, ShopReviewResponse, ShopRatingSummary, ReviewHelpfulVote, EmailSubscription,
    UserFollow, UserPost, PostLike, PostReply
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
    shops = serializers.SerializerMethodField()
    tag_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text="List of tag names to associate with the product"
    )
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_shops(self, obj):
        """Get the shops where this product is available"""
        shops = obj.shops.filter(is_active=True, status='active')
        return [{
            'shopId': str(shop.shopId),
            'name': shop.name,
            'location': shop.location,
            'city': shop.city,
            'country': shop.country,
            'logo_url': self.context.get('request').build_absolute_uri(shop.logo.url) if shop.logo and self.context.get('request') else None
        } for shop in shops]
    
    def create(self, validated_data):
        """Create product and handle tag_names"""
        tag_names = validated_data.pop('tag_names', [])
        product = super().create(validated_data)
        
        # Handle tags by name
        if tag_names:
            from .models import Tag
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                product.tags.add(tag)
        
        return product
    
    def update(self, instance, validated_data):
        """Update product and handle tag_names"""
        tag_names = validated_data.pop('tag_names', None)
        instance = super().update(instance, validated_data)
        
        # Handle tags by name if provided
        if tag_names is not None:
            from .models import Tag
            instance.tags.clear()
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)
        
        return instance

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
    avatar_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()
    display_name = serializers.ReadOnlyField()
    profile_completion_percentage = serializers.ReadOnlyField()
    verification_badge = serializers.SerializerMethodField()
    date_joined = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'bio', 'avatar', 'avatar_url', 'cover_photo', 'cover_photo_url',
            'address', 'phone_number', 'website', 'date_of_birth', 'location',
            'is_shopowner', 'is_public', 'is_email_verified', 'date_joined',
            'twitter_url', 'facebook_url', 'instagram_url', 'linkedin_url',
            'followers_count', 'following_count', 'is_verified', 'verification_type',
            'full_name', 'display_name', 'profile_completion_percentage', 'verification_badge'
        ]
        read_only_fields = ['followers_count', 'following_count']

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def get_cover_photo_url(self, obj):
        if obj.cover_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_photo.url)
            return obj.cover_photo.url
        return None

    def get_verification_badge(self, obj):
        return obj.get_verification_badge()
    
    def get_date_joined(self, obj):
        """Get user's date_joined from related User model"""
        return obj.user.date_joined if obj.user else None

# Enhanced User serializer for profile contexts
class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile']
        read_only_fields = ['date_joined']

# User Follow serializer
class UserFollowSerializer(serializers.ModelSerializer):
    follower = UserDetailSerializer(read_only=True)
    following = UserDetailSerializer(read_only=True)
    follower_id = serializers.IntegerField(write_only=True)
    following_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserFollow
        fields = ['id', 'follower', 'following', 'follower_id', 'following_id', 
                 'created_at', 'notifications_enabled']
        read_only_fields = ['created_at']

# User Post serializer
class UserPostSerializer(serializers.ModelSerializer):
    user = UserDetailSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    related_product = ProductSerializer(read_only=True)
    related_shop = ShopSerializer(read_only=True)
    
    class Meta:
        model = UserPost
        fields = [
            'id', 'user', 'content', 'image', 'image_url', 'post_type',
            'likes_count', 'reposts_count', 'replies_count', 'created_at', 'updated_at',
            'is_deleted', 'related_product', 'related_shop', 'is_liked', 'can_edit'
        ]
        read_only_fields = ['created_at', 'updated_at', 'likes_count', 'reposts_count', 'replies_count']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_is_liked(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return PostLike.objects.filter(user=user, post=obj).exists()
        return False

    def get_can_edit(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        return user == obj.user if user else False

# Post Like serializer
class PostLikeSerializer(serializers.ModelSerializer):
    user = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = PostLike
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['created_at']

# Post Reply serializer
class PostReplySerializer(serializers.ModelSerializer):
    user = UserDetailSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = PostReply
        fields = ['id', 'user', 'post', 'content', 'created_at', 'is_deleted', 'can_edit']
        read_only_fields = ['created_at']

    def get_can_edit(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        return user == obj.user if user else False

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
            'id', 'user', 'text', 'type', 'priority', 'is_read', 
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
            'reviewId', 'shop', 'shop_name', 'customer', 'rating', 'title', 'review_text',
            'is_verified_purchase', 'status', 'created_at', 'updated_at',
            'helpful_votes_count', 'response'
        ]
        read_only_fields = ['customer', 'is_verified_purchase', 'status', 'created_at', 'updated_at']
    
    def get_helpful_votes_count(self, obj):
        return obj.helpful_vote_records.filter(is_helpful=True).count()
    
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
    five_star_percentage = serializers.SerializerMethodField()
    four_star_percentage = serializers.SerializerMethodField()
    three_star_percentage = serializers.SerializerMethodField()
    two_star_percentage = serializers.SerializerMethodField()
    one_star_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ShopRatingSummary
        fields = [
            'id', 'shop', 'total_reviews', 'average_rating',
            'rating_5_count', 'rating_4_count', 'rating_3_count', 'rating_2_count', 'rating_1_count',
            'five_star_percentage', 'four_star_percentage', 'three_star_percentage',
            'two_star_percentage', 'one_star_percentage', 'last_updated'
        ]
        read_only_fields = ['last_updated']
    
    def get_five_star_percentage(self, obj):
        return obj.rating_percentages[5]
    
    def get_four_star_percentage(self, obj):
        return obj.rating_percentages[4]
    
    def get_three_star_percentage(self, obj):
        return obj.rating_percentages[3]
    
    def get_two_star_percentage(self, obj):
        return obj.rating_percentages[2]
    
    def get_one_star_percentage(self, obj):
        return obj.rating_percentages[1]

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


# Email Subscription serializer
class EmailSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailSubscription
        fields = [
            'subscriptionId', 'email', 'subscription_types', 'is_active',
            'created_at', 'updated_at', 'confirmed_at', 'is_confirmed'
        ]
        read_only_fields = ['subscriptionId', 'created_at', 'updated_at', 'confirmed_at']
    
    is_confirmed = serializers.SerializerMethodField()
    
    def get_is_confirmed(self, obj):
        return obj.is_confirmed()
    
    def validate_email(self, value):
        """Validate email format and check for existing subscriptions"""
        if EmailSubscription.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("This email is already subscribed to our newsletter.")
        return value
    
    def validate_subscription_types(self, value):
        """Validate subscription types"""
        valid_types = [choice[0] for choice in EmailSubscription.SUBSCRIPTION_TYPES]
        if not isinstance(value, list):
            raise serializers.ValidationError("Subscription types must be a list.")
        
        for subscription_type in value:
            if subscription_type not in valid_types:
                raise serializers.ValidationError(f"Invalid subscription type: {subscription_type}")
        
        return value