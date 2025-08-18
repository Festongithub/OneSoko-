from rest_framework import serializers
from .models import Order, OrderItem, OrderTracking, OrderAnalytics, ShippingAddress, Product, Shop, User


class OrderTrackingSerializer(serializers.ModelSerializer):
    """Serializer for order tracking entries."""
    
    class Meta:
        model = OrderTracking
        fields = [
            'id', 'status', 'description', 'location', 'tracking_number',
            'carrier', 'timestamp', 'metadata'
        ]
        read_only_fields = ['id', 'timestamp']


class OrderAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for order analytics."""
    
    class Meta:
        model = OrderAnalytics
        fields = [
            'customer_type', 'order_source', 'utm_source', 'utm_medium',
            'utm_campaign', 'discount_amount', 'tax_amount', 'shipping_cost',
            'processing_time', 'shipping_time', 'delivery_time', 'rating',
            'feedback', 'refund_amount', 'return_reason'
        ]


class ShippingAddressSerializer(serializers.ModelSerializer):
    """Serializer for shipping addresses."""
    full_address = serializers.ReadOnlyField()
    
    class Meta:
        model = ShippingAddress
        fields = [
            'id', 'recipient_name', 'recipient_phone', 'recipient_email',
            'address_line_1', 'address_line_2', 'city', 'state_province',
            'postal_code', 'country', 'delivery_instructions', 'latitude',
            'longitude', 'full_address'
        ]
        read_only_fields = ['id']


class OrderItemDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for order items with product information."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    product_description = serializers.CharField(source='product.description', read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price', 'product_image',
            'product_description', 'quantity', 'total_price'
        ]
        read_only_fields = ['id']
    
    def get_total_price(self, obj):
        """Calculate total price for this order item."""
        return obj.product.price * obj.quantity


class EnhancedOrderSerializer(serializers.ModelSerializer):
    """Enhanced order serializer with full details."""
    items = OrderItemDetailSerializer(many=True, read_only=True)
    tracking_entries = OrderTrackingSerializer(many=True, read_only=True)
    analytics = OrderAnalyticsSerializer(read_only=True)
    shipping_address = ShippingAddressSerializer(read_only=True)
    
    # Customer information
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='user.email', read_only=True)
    
    # Shop information
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    shop_owner = serializers.CharField(source='shop.shopowner.username', read_only=True)
    
    # Calculated fields
    items_count = serializers.SerializerMethodField()
    estimated_delivery = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    can_return = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'shop', 'status', 'total', 'created_at',
            'customer_name', 'customer_email', 'shop_name', 'shop_owner',
            'items', 'items_count', 'tracking_entries', 'analytics',
            'shipping_address', 'estimated_delivery', 'can_cancel', 'can_return'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_customer_name(self, obj):
        """Get customer's full name."""
        return f"{obj.user.first_name} {obj.user.last_name}".strip()
    
    def get_items_count(self, obj):
        """Get total number of items in the order."""
        return obj.items.count()
    
    def get_estimated_delivery(self, obj):
        """Calculate estimated delivery date."""
        from datetime import timedelta
        from django.utils import timezone
        
        if obj.status == 'delivered':
            return None
        
        # Simple estimation based on status
        if obj.status == 'shipped':
            return obj.created_at + timedelta(days=3)
        elif obj.status == 'paid':
            return obj.created_at + timedelta(days=7)
        else:
            return obj.created_at + timedelta(days=10)
    
    def get_can_cancel(self, obj):
        """Check if order can be cancelled."""
        return obj.status in ['pending', 'paid']
    
    def get_can_return(self, obj):
        """Check if order can be returned."""
        from datetime import timedelta
        from django.utils import timezone
        
        if obj.status != 'delivered':
            return False
        
        # Allow returns within 30 days
        return timezone.now() < obj.created_at + timedelta(days=30)


class OrderSummarySerializer(serializers.ModelSerializer):
    """Lightweight order serializer for lists and summaries."""
    customer_name = serializers.SerializerMethodField()
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    items_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'shop_name', 'status', 'status_display',
            'total', 'items_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_customer_name(self, obj):
        """Get customer's full name."""
        return f"{obj.user.first_name} {obj.user.last_name}".strip()
    
    def get_items_count(self, obj):
        """Get total number of items in the order."""
        return obj.items.count()


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating orders from cart."""
    shop_id = serializers.UUIDField()
    cart_items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    shipping_address = ShippingAddressSerializer()
    order_notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    # Payment information
    payment_method = serializers.ChoiceField(choices=[
        ('card', 'Credit/Debit Card'),
        ('mpesa', 'M-Pesa'),
        ('paypal', 'PayPal'),
        ('cod', 'Cash on Delivery')
    ], default='card')
    
    # Analytics data
    utm_source = serializers.CharField(max_length=100, required=False, allow_blank=True)
    utm_medium = serializers.CharField(max_length=100, required=False, allow_blank=True)
    utm_campaign = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate_cart_items(self, value):
        """Validate cart items structure."""
        for item in value:
            if 'product_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError(
                    "Each cart item must have 'product_id' and 'quantity'"
                )
            
            try:
                quantity = int(item['quantity'])
                if quantity <= 0:
                    raise serializers.ValidationError("Quantity must be positive")
            except (ValueError, TypeError):
                raise serializers.ValidationError("Quantity must be a valid number")
        
        return value
    
    def validate_shop_id(self, value):
        """Validate shop exists."""
        try:
            Shop.objects.get(shopId=value)
        except Shop.DoesNotExist:
            raise serializers.ValidationError("Shop not found")
        return value


class BulkOrderUpdateSerializer(serializers.Serializer):
    """Serializer for bulk order updates."""
    order_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=100
    )
    status = serializers.ChoiceField(choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled')
    ])
    tracking_info = serializers.CharField(max_length=500, required=False, allow_blank=True)
    notify_customers = serializers.BooleanField(default=True)


class OrderReportSerializer(serializers.Serializer):
    """Serializer for order report parameters."""
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    report_type = serializers.ChoiceField(
        choices=[('summary', 'Summary'), ('detailed', 'Detailed'), ('export', 'Export')],
        default='summary'
    )
    format = serializers.ChoiceField(
        choices=[('json', 'JSON'), ('csv', 'CSV'), ('pdf', 'PDF')],
        default='json'
    )
    include_analytics = serializers.BooleanField(default=False)
    
    def validate(self, data):
        """Validate date range."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Start date must be before end date")
        
        return data


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for order status updates."""
    status = serializers.ChoiceField(choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled')
    ])
    tracking_info = serializers.CharField(max_length=500, required=False, allow_blank=True)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    tracking_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    carrier = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notify_customer = serializers.BooleanField(default=True)
    internal_notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)
