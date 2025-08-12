from django.db import models
from django.contrib.auth.models import User
import uuid
from django.core.serializers import serialize
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

# Product model represents an item that can be sold in a shop
class Product(models.Model):
    # Unique identifier for each product
    productId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    # Name of the product
    name = models.CharField(max_length=100)
    # Description of the product (optional)
    description = models.TextField(blank=True)
    # Price of the product
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Quantity available in stock
    quantity = models.IntegerField(default=0)
    # Optional image for the product
    image = models.ImageField(upload_to='products/images', blank=True)
    # Category of the product
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    # Tags for the product
    tags = models.ManyToManyField('Tag', blank=True, related_name='products')
    # Discount percentage for the product (0-100)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    # Promotional price (optional, can be used for sales)
    promotional_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # Soft delete: is the product active?
    is_active = models.BooleanField(default=True)
    # Soft delete: timestamp when the product was deleted
    deleted_at = models.DateTimeField(null=True, blank=True)

    # String representation of the product
    def __str__(self):
        return self.name

# Shop model represents a shop owned by a user (mini-account). Only the shopowner has exclusive access to manage this shop.
class Shop(models.Model):
    # Unique identifier for each shop
    shopId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    # Name of the shop
    name = models.CharField(max_length=100)
    # Products available in the shop (many-to-many relationship)
    products = models.ManyToManyField(Product, related_name='shops')
    # Owner of the shop (foreign key to User). Only this user can manage the shop.
    shopowner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shops')
    # Location of the shop (can be extended to use an API)
    location = models.CharField(max_length=255)  # Placeholder for API integration
    # Description of the shop
    description = models.TextField(blank=True)
    # Logo or banner image for the shop
    logo = models.ImageField(upload_to='shops/logos/', blank=True, null=True)
    # Date and time when the shop was created
    created_at = models.DateTimeField(auto_now_add=True)
    # Status of the shop (active, suspended, pending_approval)
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending Approval'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Soft delete: is the shop active?
    is_active = models.BooleanField(default=True)
    # Soft delete: timestamp when the shop was deleted
    deleted_at = models.DateTimeField(null=True, blank=True)
    # Contact phone number for the shop
    phone = models.CharField(max_length=20, blank=True)
    # Contact email for the shop
    email = models.EmailField(blank=True)
    # Social media link for the shop (optional)
    social_link = models.URLField(blank=True)
    # Slug for SEO-friendly URLs (auto-generated from name)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    # Analytics: number of times the shop has been viewed
    views = models.IntegerField(default=0)
    # Analytics: total sales amount for the shop
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    # Analytics: total number of orders for the shop
    total_orders = models.IntegerField(default=0)
    # Geolocation: latitude of the shop
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    # Geolocation: longitude of the shop
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    # Structured address fields
    street = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        # Auto-generate slug from name if not provided
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Shop.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    # String representation of the shop, including owner
    def __str__(self):
        return self.name + "" + self.shopowner.username

# ShopOwner class provides business logic for shop owners
# Only the shopowner (self.user) can manage their own shops and products
class ShopOwner:
    # Initialize with a Django User instance
    def __init__(self, user):
        self.user = user

    # Create a new shop for the owner (mini-account)
    def create_shop(self, name, location):
        shop = Shop.objects.create(name=name, shopowner=self.user, location=location)
        return shop

    # Add a new product to the shop (only if self.user is the shopowner)
    def add_product_to_shop(self, shop, product_data):
        if shop.shopowner != self.user:
            raise PermissionError('You do not have permission to add products to this shop.')
        product = Product.objects.create(**product_data)
        shop.products.add(product)
        return product

    # Delete a product from the shop by productId (only if self.user is the shopowner)
    def delete_product_from_shop(self, shop, product_id):
        if shop.shopowner != self.user:
            raise PermissionError('You do not have permission to delete products from this shop.')
        try:
            product = shop.products.get(productId=product_id)
            shop.products.remove(product)
            product.delete()
            return True
        except Product.DoesNotExist:
            return False

    # Get all products in the shop as JSON (only if self.user is the shopowner)
    def get_products_json(self, shop):
        if shop.shopowner != self.user:
            raise PermissionError('You do not have permission to view products in this shop.')
        products = shop.products.all()
        return serialize('json', products)

# Category model for organizing products
class Category(models.Model):
    # Name of the category
    name = models.CharField(max_length=100, unique=True)
    # Slug for SEO-friendly URLs
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-generate slug from name if not provided
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    # String representation of the category
    def __str__(self):
        return self.name

# Tag model for product tagging
class Tag(models.Model):
    # Name of the tag
    name = models.CharField(max_length=50, unique=True)

    # String representation of the tag
    def __str__(self):
        return self.name

# Review model for product and shop reviews
class Review(models.Model):
    # Review type (product or shop)
    REVIEW_TYPES = [
        ('product', 'Product Review'),
        ('shop', 'Shop Review'),
    ]
    review_type = models.CharField(max_length=10, choices=REVIEW_TYPES, default='product')
    
    # Product being reviewed (optional for shop reviews)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    # Shop being reviewed (optional for product reviews)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    
    # User who wrote the review
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    
    # Rating (1-5 stars)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Review comment
    comment = models.TextField(blank=True)
    
    # Helpful votes count
    helpful_count = models.PositiveIntegerField(default=0)
    
    # Review status for moderation
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='approved')
    
    # Date and time when the review was created
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # Ensure a user can only review a product/shop once
        unique_together = [
            ('user', 'product'),
            ('user', 'shop'),
        ]

    def clean(self):
        """Validate that either product or shop is set, but not both"""
        if not self.product and not self.shop:
            raise ValidationError("Either product or shop must be specified.")
        if self.product and self.shop:
            raise ValidationError("Cannot review both product and shop simultaneously.")
        
        # Set review type based on what's being reviewed
        if self.product:
            self.review_type = 'product'
        elif self.shop:
            self.review_type = 'shop'

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    # String representation of the review
    def __str__(self):
        if self.product:
            return f"{self.user.username} - {self.product.name} - {self.rating} stars"
        else:
            return f"{self.user.username} - {self.shop.name} - {self.rating} stars"

    @property
    def reviewed_item(self):
        """Get the item being reviewed (product or shop)"""
        return self.product or self.shop

    @property
    def reviewed_item_name(self):
        """Get the name of the item being reviewed"""
        if self.product:
            return self.product.name
        elif self.shop:
            return self.shop.name
        return "Unknown"

# ProductVariant model for product variations (size, color, etc.)
class ProductVariant(models.Model):
    # Product this variant belongs to
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    # Name of the variant (e.g., 'Size', 'Color')
    name = models.CharField(max_length=50)
    # Value of the variant (e.g., 'Large', 'Red')
    value = models.CharField(max_length=50)
    # Additional price adjustment for this variant (optional)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Quantity for this specific variant
    quantity = models.IntegerField(default=0)

    # String representation of the variant
    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"

# UserProfile model for additional user information
class UserProfile(models.Model):
    # Link to the built-in User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    # Short biography/about section
    bio = models.TextField(blank=True)
    # Avatar/profile picture
    avatar = models.ImageField(upload_to='users/avatars/', blank=True, null=True)
    # Address (can be expanded to structured fields)
    address = models.CharField(max_length=255, blank=True)
    # Is this user a shopowner?
    is_shopowner = models.BooleanField(default=False)

    # String representation of the user profile
    def __str__(self):
        return f"{self.user.username}'s profile"

# Cart model for shopping cart functionality
class Cart(models.Model):
    # User who owns the cart
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    # Date and time when the cart was created
    created_at = models.DateTimeField(auto_now_add=True)
    # Date and time when the cart was last updated
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s cart"

    @property
    def total_items(self):
        """Get the total number of items in the cart"""
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        """Calculate the total price of all items in the cart"""
        total = 0
        for item in self.items.all():
            # Use promotional price if available, otherwise use regular price
            price = item.product.promotional_price if item.product.promotional_price else item.product.price
            # Apply discount if any
            if item.product.discount > 0:
                price = price * (1 - item.product.discount / 100)
            total += price * item.quantity
        return total

# CartItem model for individual items in the cart
class CartItem(models.Model):
    # Cart this item belongs to
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    # Product in the cart
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    # Shop the product belongs to
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE)
    # Quantity of the product
    quantity = models.PositiveIntegerField(default=1)
    # Date and time when the item was added to cart
    added_at = models.DateTimeField(auto_now_add=True)
    # Date and time when the item was last updated
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure a product can only be added once per cart
        unique_together = ['cart', 'product', 'shop']

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.cart.user.username}'s cart"

    @property
    def total_price(self):
        """Calculate the total price for this item"""
        # Use promotional price if available, otherwise use regular price
        price = self.product.promotional_price if self.product.promotional_price else self.product.price
        # Apply discount if any
        if self.product.discount > 0:
            price = price * (1 - self.product.discount / 100)
        return price * self.quantity

# Order model for completed orders
class Order(models.Model):
    # User who placed the order
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    # Shop where the order was placed
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='orders')
    # Products in the order (with quantity)
    products = models.ManyToManyField(Product, through='OrderItem')
    # Order status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Total price of the order
    total = models.DecimalField(max_digits=15, decimal_places=2)
    # Date and time when the order was created
    created_at = models.DateTimeField(auto_now_add=True)

    # String representation of the order
    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

# OrderItem model for individual items in an order
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    # String representation of the order item
    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Order {self.order.id}"

# Payment model for order payments
class Payment(models.Model):
    # Order being paid for
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    # Payment amount
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    # Payment status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Date and time when the payment was made
    created_at = models.DateTimeField(auto_now_add=True)

    # String representation of the payment
    def __str__(self):
        return f"Payment {self.id} for Order {self.order.id}"

# AuditLog model for tracking changes
class AuditLog(models.Model):
    # User who performed the action
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    # Action performed (create, update, delete)
    action = models.CharField(max_length=20)
    # Model type (Shop or Product)
    model_type = models.CharField(max_length=50)
    # Object ID of the affected model
    object_id = models.CharField(max_length=100)
    # Description of the change
    description = models.TextField(blank=True)
    # Timestamp of the action
    timestamp = models.DateTimeField(auto_now_add=True)

    # String representation of the audit log
    def __str__(self):
        return f"{self.action} on {self.model_type} {self.object_id} by {self.user}"

# Wishlist model for user favorites
class Wishlist(models.Model):
    # User who owns the wishlist
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    # Products favorited by the user
    products = models.ManyToManyField(Product, related_name='wishlisted_by')

    # String representation of the wishlist
    def __str__(self):
        return f"{self.user.username}'s wishlist"

# Message model for user communication
class Message(models.Model):
    # User sending the message
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    # User receiving the message
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    # Message content
    content = models.TextField()
    # Has the message been read by the recipient?
    is_read = models.BooleanField(default=False)
    # Timestamp of the message
    timestamp = models.DateTimeField(auto_now_add=True)
    # Optional: link to a shop or product for context
    shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')

    # String representation of the message
    def __str__(self):
        return f"Message from {self.sender} to {self.recipient}"

# Product Inquiry model for customer inquiries about products
class ProductInquiry(models.Model):
    # Customer making the inquiry
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_inquiries')
    # Product being inquired about
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inquiries')
    # Shop owner who should respond
    shop_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_inquiries')
    # Inquiry message
    message = models.TextField()
    # Inquiry status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('responded', 'Responded'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Shop owner's response
    response = models.TextField(blank=True)
    # Response timestamp
    responded_at = models.DateTimeField(null=True, blank=True)
    # Timestamp of the inquiry
    created_at = models.DateTimeField(auto_now_add=True)
    # Updated timestamp
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Inquiry from {self.customer} about {self.product.name}"

# Notification model for user notifications
class Notification(models.Model):
    # User to be notified
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    # Notification text content
    text = models.TextField(default='Notification')
    # Type of notification
    NOTIFICATION_TYPES = [
        # Order-related notifications
        ('order_created', 'Order Created'),
        ('order_status_updated', 'Order Status Updated'),
        ('order_delivered', 'Order Delivered'),
        ('order_cancelled', 'Order Cancelled'),
        
        # Cart-related notifications
        ('cart_item_added', 'Item Added to Cart'),
        ('cart_updated', 'Cart Updated'),
        ('cart_cleared', 'Cart Cleared'),
        
        # Product-related notifications
        ('product_inquiry', 'Product Inquiry'),
        ('product_inquiry_response', 'Product Inquiry Response'),
        ('product_low_stock', 'Product Low Stock'),
        ('product_out_of_stock', 'Product Out of Stock'),
        
        # Message-related notifications
        ('message_received', 'New Message Received'),
        ('message_reply', 'Message Reply'),
        
        # Shop-related notifications
        ('new_order_received', 'New Order Received'),
        ('order_completed', 'Order Completed'),
        ('product_ordered', 'Product Ordered'),
        ('daily_summary', 'Daily Summary'),
        ('weekly_summary', 'Weekly Summary'),
        ('stock_alert', 'Stock Alert'),
        
        # System notifications
        ('welcome', 'Welcome'),
        ('account_updated', 'Account Updated'),
        ('payment_successful', 'Payment Successful'),
        ('payment_failed', 'Payment Failed'),
    ]
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    # Has the notification been read?
    is_read = models.BooleanField(default=False)
    # Timestamp of the notification
    timestamp = models.DateTimeField(auto_now_add=True)
    # Optional: link to a shop, product, order, inquiry, or message for context
    shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    inquiry = models.ForeignKey(ProductInquiry, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    message = models.ForeignKey(Message, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    # Additional data for the notification (JSON field)
    data = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']

    # String representation of the notification
    def __str__(self):
        return f"Notification for {self.user}: {self.message}"

    @property
    def notification_icon(self):
        """Return appropriate icon class based on notification type"""
        icon_map = {
            'order_created': 'shopping-bag',
            'order_status_updated': 'truck',
            'order_delivered': 'check-circle',
            'order_cancelled': 'x-circle',
            'cart_item_added': 'plus-circle',
            'cart_updated': 'pencil',
            'cart_cleared': 'trash',
            'product_inquiry': 'question-mark-circle',
            'product_inquiry_response': 'chat-bubble-left-right',
            'product_low_stock': 'exclamation-triangle',
            'product_out_of_stock': 'x-circle',
            'message_received': 'chat-bubble-left',
            'message_reply': 'chat-bubble-left-right',
            'new_order_received': 'bell',
            'order_completed': 'check-circle',
            'welcome': 'star',
            'account_updated': 'user',
            'payment_successful': 'credit-card',
            'payment_failed': 'exclamation-circle',
        }
        return icon_map.get(self.type, 'bell')

    @property
    def notification_color(self):
        """Return appropriate color class based on notification type"""
        color_map = {
            'order_created': 'blue',
            'order_status_updated': 'yellow',
            'order_delivered': 'green',
            'order_cancelled': 'red',
            'cart_item_added': 'green',
            'cart_updated': 'blue',
            'cart_cleared': 'gray',
            'product_inquiry': 'purple',
            'product_inquiry_response': 'blue',
            'product_low_stock': 'yellow',
            'product_out_of_stock': 'red',
            'new_order_received': 'green',
            'order_completed': 'green',
            'welcome': 'purple',
            'account_updated': 'blue',
            'payment_successful': 'green',
            'payment_failed': 'red',
        }
        return color_map.get(self.type, 'gray')
