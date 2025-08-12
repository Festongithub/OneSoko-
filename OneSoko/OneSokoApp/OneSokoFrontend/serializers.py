from rest_framework import serializers
from .models import (
    Product, Shop, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, Wishlist, Message, Notification, Cart, CartItem, ProductInquiry
)
from django.contrib.auth.models import User
from django.contrib.auth.models import User

# ProductVariant serializer
class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.UUIDField(source='product.productId', read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_name', 'product_id', 'name', 'value', 
            'price_adjustment', 'quantity', 'total_price'
        ]
        read_only_fields = ['id', 'product_name', 'product_id', 'total_price']

    def get_total_price(self, obj):
        """Calculate total price including price adjustment"""
        base_price = obj.product.price
        return float(base_price) + float(obj.price_adjustment)

    def validate_quantity(self, value):
        """Validate quantity field"""
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate_price_adjustment(self, value):
        """Validate price adjustment field"""
        # Allow negative values for discounts
        return value

    def validate(self, data):
        """Additional validation"""
        # Check if variant with same name and value already exists for this product
        product = data.get('product')
        name = data.get('name')
        value = data.get('value')
        
        if product and name and value:
            existing_variant = ProductVariant.objects.filter(
                product=product,
                name=name,
                value=value
            )
            
            # Exclude current instance if updating
            if self.instance:
                existing_variant = existing_variant.exclude(pk=self.instance.pk)
            
            if existing_variant.exists():
                raise serializers.ValidationError(
                    f"A variant with name '{name}' and value '{value}' already exists for this product."
                )
        
        return data

# ProductVariant create serializer
class CreateProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['product', 'name', 'value', 'price_adjustment', 'quantity']

    def validate_quantity(self, value):
        """Validate quantity field"""
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate_price_adjustment(self, value):
        """Validate price adjustment field"""
        return value

    def validate(self, data):
        """Additional validation"""
        # Check if variant with same name and value already exists for this product
        product = data.get('product')
        name = data.get('name')
        value = data.get('value')
        
        if product and name and value:
            existing_variant = ProductVariant.objects.filter(
                product=product,
                name=name,
                value=value
            )
            
            if existing_variant.exists():
                raise serializers.ValidationError(
                    f"A variant with name '{name}' and value '{value}' already exists for this product."
                )
        
        return data

# ProductVariant update serializer
class UpdateProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['name', 'value', 'price_adjustment', 'quantity']

    def validate_quantity(self, value):
        """Validate quantity field"""
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate_price_adjustment(self, value):
        """Validate price adjustment field"""
        return value

    def validate(self, data):
        """Additional validation"""
        # Check if variant with same name and value already exists for this product
        product = self.instance.product
        name = data.get('name', self.instance.name)
        value = data.get('value', self.instance.value)
        
        existing_variant = ProductVariant.objects.filter(
            product=product,
            name=name,
            value=value
        ).exclude(pk=self.instance.pk)
        
        if existing_variant.exists():
            raise serializers.ValidationError(
                f"A variant with name '{name}' and value '{value}' already exists for this product."
            )
        
        return data

# Bulk create variants serializer
class BulkCreateVariantsSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    variants = CreateProductVariantSerializer(many=True)

    def validate_variants(self, value):
        """Validate variants array"""
        if not value:
            raise serializers.ValidationError("At least one variant is required.")
        
        # Check for duplicate variants in the array
        variant_combinations = []
        for variant in value:
            name = variant.get('name')
            variant_value = variant.get('value')
            combination = (name, variant_value)
            
            if combination in variant_combinations:
                raise serializers.ValidationError(
                    f"Duplicate variant found: {name} - {variant_value}"
                )
            variant_combinations.append(combination)
        
        return value

# ProductVariant stats serializer
class ProductVariantStatsSerializer(serializers.Serializer):
    total_variants = serializers.IntegerField()
    total_quantity = serializers.IntegerField()
    low_stock_count = serializers.IntegerField()
    out_of_stock_count = serializers.IntegerField()
    variants_by_name = serializers.ListField()

# ProductVariant quantity update serializer
class ProductVariantQuantitySerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)

    def validate_quantity(self, value):
        """Validate quantity field"""
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

# ProductVariant price adjustment serializer
class ProductVariantPriceAdjustmentSerializer(serializers.Serializer):
    price_adjustment = serializers.DecimalField(max_digits=10, decimal_places=2)

# Review serializer
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    reviewed_item_name = serializers.CharField(source='reviewed_item_name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'review_type', 'product', 'shop', 'user', 'username', 
            'first_name', 'last_name', 'rating', 'comment', 'helpful_count',
            'status', 'created_at', 'updated_at', 'product_name', 'shop_name',
            'reviewed_item_name'
        ]
        read_only_fields = [
            'id', 'user', 'username', 'first_name', 'last_name', 
            'helpful_count', 'status', 'created_at', 'updated_at',
            'product_name', 'shop_name', 'reviewed_item_name'
        ]

    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, data):
        """Validate that either product or shop is specified"""
        if not data.get('product') and not data.get('shop'):
            raise serializers.ValidationError("Either product or shop must be specified.")
        if data.get('product') and data.get('shop'):
            raise serializers.ValidationError("Cannot review both product and shop simultaneously.")
        return data

# Create review serializer
class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['product', 'shop', 'rating', 'comment']

    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, data):
        """Validate that either product or shop is specified"""
        if not data.get('product') and not data.get('shop'):
            raise serializers.ValidationError("Either product or shop must be specified.")
        if data.get('product') and data.get('shop'):
            raise serializers.ValidationError("Cannot review both product and shop simultaneously.")
        return data

# Update review serializer
class UpdateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

# Review statistics serializer
class ReviewStatsSerializer(serializers.Serializer):
    total_reviews = serializers.IntegerField()
    average_rating = serializers.FloatField()
    rating_distribution = serializers.DictField()
    recent_reviews = ReviewSerializer(many=True)
    helpful_reviews = ReviewSerializer(many=True)

# Review filter serializer
class ReviewFilterSerializer(serializers.Serializer):
    rating = serializers.IntegerField(required=False, min_value=1, max_value=5)
    review_type = serializers.ChoiceField(choices=[('product', 'Product'), ('shop', 'Shop')], required=False)
    status = serializers.ChoiceField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], required=False)
    sort_by = serializers.ChoiceField(choices=[('created_at', 'Date'), ('rating', 'Rating'), ('helpful_count', 'Helpful')], required=False)
    sort_order = serializers.ChoiceField(choices=[('asc', 'Ascending'), ('desc', 'Descending')], required=False)

# Product serializer
class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def validate_price(self, value):
        """Validate price field"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    
    def validate_quantity(self, value):
        """Validate quantity field"""
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value
    
    def validate_discount(self, value):
        """Validate discount field"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount must be between 0 and 100 percent.")
        return value
    
    def validate_image(self, value):
        """Validate image file"""
        if value:
            # Check file size (max 10MB)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Image file size cannot exceed 10MB.")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if hasattr(value, 'content_type') and value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG, GIF, and WebP files are allowed.")
        
        return value
    
    def create(self, validated_data):
        """Create a new product with proper validation"""
        # Calculate promotional price if discount is provided
        if 'discount' in validated_data and validated_data['discount'] > 0:
            if 'price' in validated_data:
                discount_amount = validated_data['price'] * (validated_data['discount'] / 100)
                validated_data['promotional_price'] = validated_data['price'] - discount_amount
        
        return super().create(validated_data)

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
    class Meta:
        model = Shop
        fields = '__all__'

# CartItem serializer
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'shop', 'quantity', 'added_at', 'updated_at', 'total_price']
        read_only_fields = ['id', 'added_at', 'updated_at', 'total_price']

    def validate_quantity(self, value):
        """Validate quantity field"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

# Cart serializer
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

# Add to Cart serializer
class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    shop_id = serializers.UUIDField()
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate(self, data):
        """Validate that product exists and belongs to the shop"""
        try:
            product = Product.objects.get(productId=data['product_id'])
            shop = Shop.objects.get(shopId=data['shop_id'])
            
            # Check if product belongs to the shop
            if product not in shop.products.all():
                raise serializers.ValidationError("Product does not belong to the specified shop.")
            
            # Check if product is active
            if not product.is_active:
                raise serializers.ValidationError("Product is not available.")
            
            # Check if enough stock is available
            if product.quantity < data['quantity']:
                raise serializers.ValidationError(f"Only {product.quantity} items available in stock.")
            
            data['product'] = product
            data['shop'] = shop
            return data
            
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        except Shop.DoesNotExist:
            raise serializers.ValidationError("Shop not found.")

# Update Cart Item serializer
class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)

    def validate_quantity(self, value):
        """Validate quantity against product stock"""
        cart_item = self.context.get('cart_item')
        if cart_item and value > cart_item.product.quantity:
            raise serializers.ValidationError(f"Only {cart_item.product.quantity} items available in stock.")
        return value

# UserProfile serializer
class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar', 'address', 'is_shopowner', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'user', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login']

    def validate_bio(self, value):
        """Validate bio field"""
        if value and len(value) > 500:
            raise serializers.ValidationError("Bio cannot exceed 500 characters.")
        return value

    def validate_address(self, value):
        """Validate address field"""
        if value and len(value) > 255:
            raise serializers.ValidationError("Address cannot exceed 255 characters.")
        return value

    def validate_avatar(self, value):
        """Validate avatar image"""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Avatar file size cannot exceed 5MB.")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if hasattr(value, 'content_type') and value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG, GIF, and WebP files are allowed.")
        
        return value

# Public UserProfile serializer (for displaying other users' profiles)
class PublicUserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'bio', 'avatar', 'is_shopowner', 'date_joined'
        ]
        read_only_fields = fields

# UserProfile update serializer
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'address']

    def validate_bio(self, value):
        """Validate bio field"""
        if value and len(value) > 500:
            raise serializers.ValidationError("Bio cannot exceed 500 characters.")
        return value

    def validate_address(self, value):
        """Validate address field"""
        if value and len(value) > 255:
            raise serializers.ValidationError("Address cannot exceed 255 characters.")
        return value

# UserProfile create serializer
class UserProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'address']

    def validate_bio(self, value):
        """Validate bio field"""
        if value and len(value) > 500:
            raise serializers.ValidationError("Bio cannot exceed 500 characters.")
        return value

    def validate_address(self, value):
        """Validate address field"""
        if value and len(value) > 255:
            raise serializers.ValidationError("Address cannot exceed 255 characters.")
        return value

# OrderItem serializer
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'quantity', 'total_price']
        read_only_fields = ['id', 'total_price']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

# Order serializer
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    shop = ShopSerializer(read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'shop', 'status', 'total', 'items', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'total', 'total_items', 'created_at', 'updated_at']

# Create Order serializer
class CreateOrderSerializer(serializers.Serializer):
    shop_id = serializers.UUIDField()
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )

    def validate_items(self, value):
        """Validate order items"""
        for item in value:
            if 'product_id' not in item:
                raise serializers.ValidationError("Product ID is required for each item.")
            if 'quantity' not in item:
                raise serializers.ValidationError("Quantity is required for each item.")
            if item['quantity'] <= 0:
                raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    def validate(self, data):
        """Validate the entire order"""
        try:
            shop = Shop.objects.get(shopId=data['shop_id'])
            data['shop'] = shop
        except Shop.DoesNotExist:
            raise serializers.ValidationError("Shop not found.")
        
        # Validate products and check stock
        validated_items = []
        total = 0
        
        for item in data['items']:
            try:
                product = Product.objects.get(productId=item['product_id'])
                
                # Check if product belongs to the shop
                if product not in shop.products.all():
                    raise serializers.ValidationError(f"Product {product.name} does not belong to shop {shop.name}.")
                
                # Check stock
                if product.quantity < item['quantity']:
                    raise serializers.ValidationError(f"Insufficient stock for {product.name}. Available: {product.quantity}")
                
                # Calculate price
                price = product.promotional_price if product.promotional_price else product.price
                if product.discount > 0:
                    price = price * (1 - product.discount / 100)
                
                item_total = price * item['quantity']
                total += item_total
                
                validated_items.append({
                    'product': product,
                    'quantity': item['quantity'],
                    'total_price': item_total
                })
                
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with ID {item['product_id']} not found.")
        
        data['validated_items'] = validated_items
        data['total'] = total
        return data

# Payment serializer
class PaymentSerializer(serializers.ModelSerializer):
    order = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        return value

# Create Payment serializer
class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    payment_method = serializers.CharField(max_length=50, default='cash')

    def validate(self, data):
        try:
            order = Order.objects.get(id=data['order_id'])
            if order.user != self.context['request'].user:
                raise serializers.ValidationError("You can only pay for your own orders.")
            if order.status != 'pending':
                raise serializers.ValidationError("Order is not in pending status.")
            if data['amount'] != order.total:
                raise serializers.ValidationError("Payment amount must match order total.")
            data['order'] = order
            return data
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found.")

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

class CreateMessageSerializer(serializers.ModelSerializer):
    recipient = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Message
        fields = ['recipient', 'content', 'shop', 'product']
    
    def validate_recipient(self, value):
        """Validate that the recipient exists and is not the current user"""
        try:
            recipient = User.objects.get(id=value)
            return recipient
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient user does not exist.")
    
    def validate(self, data):
        """Additional validation"""
        if 'content' not in data or not data['content'].strip():
            raise serializers.ValidationError("Message content is required.")
        return data

# Product Inquiry serializer
class ProductInquirySerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField(read_only=True)
    product = ProductSerializer(read_only=True)
    shop_owner = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ProductInquiry
        fields = '__all__'
        read_only_fields = ['customer', 'shop_owner', 'status', 'response', 'responded_at', 'created_at', 'updated_at']

# Create Product Inquiry serializer
class CreateProductInquirySerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = ProductInquiry
        fields = ['product_id', 'message']
    
    def validate(self, data):
        try:
            product = Product.objects.get(productId=data['product_id'])
            # Get the shop owner from the product's shop
            shop = product.shops.first()
            if not shop:
                raise serializers.ValidationError("Product is not associated with any shop.")
            
            data['product'] = product
            data['shop_owner'] = shop.shopowner
            return data
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")

# Product Inquiry Response serializer
class ProductInquiryResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInquiry
        fields = ['response']
    
    def validate_response(self, value):
        if not value.strip():
            raise serializers.ValidationError("Response cannot be empty.")
        return value

# Notification serializer
class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    shop = ShopSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    order = OrderSerializer(read_only=True)
    inquiry = ProductInquirySerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'timestamp']

# Create Notification serializer
class CreateNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['text', 'type', 'shop', 'product', 'order', 'inquiry', 'message', 'data']
    
    def validate_type(self, value):
        valid_types = [choice[0] for choice in Notification.NOTIFICATION_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid notification type. Must be one of: {', '.join(valid_types)}")
        return value

# User registration serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
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
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Create user profile and mark as shopowner
        UserProfile.objects.create(user=user, is_shopowner=True)
        return user 

# User detail serializer (includes admin fields)
class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login', 'is_staff', 'is_superuser', 'is_active')
        read_only_fields = ('id', 'date_joined', 'last_login')