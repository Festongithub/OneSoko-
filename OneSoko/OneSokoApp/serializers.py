from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, BusinessCategory, Shop


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'phone_number', 'date_of_birth', 'avatar', 'bio', 'address',
            'city', 'country', 'postal_code', 'is_shopowner',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class BusinessCategorySerializer(serializers.ModelSerializer):
    """Serializer for BusinessCategory model"""
    class Meta:
        model = BusinessCategory
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ShopSerializer(serializers.ModelSerializer):
    """Serializer for Shop model"""
    shopowner = UserSerializer(read_only=True)
    
    class Meta:
        model = Shop
        fields = [
            'shopId', 'name', 'slug', 'description', 'location',
            'email', 'phone', 'social_link', 'street', 'city', 'country',
            'latitude', 'longitude', 'logo', 'status', 'is_active',
            'views', 'total_sales', 'total_orders', 'shopowner',
            'created_at', 'deleted_at'
        ]
        read_only_fields = ['shopId', 'created_at', 'views', 'total_sales', 'total_orders']


class QuickShopCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for ultra-fast shop creation - only required fields"""
    
    class Meta:
        model = Shop
        fields = ['name', 'description', 'location']
        
    def create(self, validated_data):
        """Create shop with minimal required data for speed"""
        from django.utils.text import slugify
        import uuid
        
        # Auto-generate slug if not provided
        if 'slug' not in validated_data:
            base_slug = slugify(validated_data['name'])
            # Add random suffix to ensure uniqueness
            validated_data['slug'] = f"{base_slug}-{str(uuid.uuid4())[:8]}"
        
        # Set owner to current user
        validated_data['shopowner'] = self.context['request'].user
        
        # Set default status to active for immediate searchability
        validated_data['status'] = 'active'
        validated_data['is_active'] = True
        
        return super().create(validated_data)


class ShopSearchSerializer(serializers.ModelSerializer):
    """Optimized serializer for search results - only essential fields for speed"""
    shopowner_name = serializers.CharField(source='shopowner.username', read_only=True)
    
    class Meta:
        model = Shop
        fields = [
            'shopId', 'name', 'slug', 'description', 'city', 'country',
            'logo', 'status', 'views', 'shopowner_name', 'created_at'
        ]
    
    def create(self, validated_data):
        # Set the shopowner to the current user
        validated_data['shopowner'] = self.context['request'].user
        
        # Update user profile to mark as shop owner
        user = self.context['request'].user
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        user_profile.is_shopowner = True
        user_profile.save()
        
        return super().create(validated_data)


class ShopListSerializer(serializers.ModelSerializer):
    """Simplified serializer for shop lists"""
    shopowner = UserSerializer(read_only=True)
    
    class Meta:
        model = Shop
        fields = [
            'shopId', 'name', 'slug', 'description', 'location',
            'city', 'country', 'logo', 'status', 'is_active',
            'views', 'total_sales', 'total_orders', 'shopowner',
            'created_at'
        ]


class UserShopsSerializer(serializers.ModelSerializer):
    """Serializer for user's shops"""
    owned_shops = ShopListSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'owned_shops']


class QuickShopCreateSerializer(serializers.ModelSerializer):
    """Fast shop creation with minimal required fields"""
    
    class Meta:
        model = Shop
        fields = ['name', 'description', 'location']
        
    def create(self, validated_data):
        # Auto-generate slug from name
        from django.utils.text import slugify
        import uuid
        
        base_slug = slugify(validated_data['name'])
        slug = base_slug
        counter = 1
        
        # Ensure unique slug
        while Shop.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
            
        validated_data['slug'] = slug
        validated_data['shopowner'] = self.context['request'].user
        
        return super().create(validated_data)


class ShopSearchSerializer(serializers.ModelSerializer):
    """Optimized serializer for shop search results"""
    shopowner_name = serializers.CharField(source='shopowner.username', read_only=True)
    
    class Meta:
        model = Shop
        fields = [
            'shopId', 'name', 'slug', 'description', 'city', 'country', 
            'logo', 'views', 'status', 'shopowner_name', 'created_at'
        ]


class ShopAutocompleteSerializer(serializers.ModelSerializer):
    """Ultra-light serializer for autocomplete/instant search"""
    
    class Meta:
        model = Shop
        fields = ['shopId', 'name', 'slug', 'city']
