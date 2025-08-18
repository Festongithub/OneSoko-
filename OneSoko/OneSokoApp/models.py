from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q, F, Max
import uuid
from django.core.serializers import serialize
from datetime import timedelta
import json

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
        return f"{self.name} - {self.shopowner.username}"

    @property
    def owner_full_name(self):
        """Get the full name of the shop owner."""
        return f"{self.shopowner.first_name} {self.shopowner.last_name}".strip()

    @property 
    def owner_contact_info(self):
        """Get comprehensive contact information for the shop owner."""
        return {
            'name': self.owner_full_name,
            'email': self.shopowner.email,
            'username': self.shopowner.username,
            'shop_email': self.email,
            'shop_phone': self.phone,
            'personal_phone': getattr(self.shopowner.userprofile, 'phone_number', '') if hasattr(self.shopowner, 'userprofile') else ''
        }

    @property
    def full_shop_info(self):
        """Get complete shop information including owner details."""
        return {
            'shop_id': str(self.shopId),
            'shop_name': self.name,
            'description': self.description,
            'location': self.location,
            'status': self.status,
            'created_at': self.created_at,
            'owner': self.owner_contact_info,
            'analytics': {
                'views': self.views,
                'total_sales': float(self.total_sales),
                'total_orders': self.total_orders
            }
        }

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
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

# Tag model for flexible product tagging
class Tag(models.Model):
    # Name of the tag
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# Review model for product reviews and ratings
class Review(models.Model):
    # Product being reviewed
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    # User who wrote the review
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    # Rating (1-5 stars)
    rating = models.PositiveSmallIntegerField()
    # Review comment
    comment = models.TextField(blank=True)
    # Date and time when the review was created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating} stars)"

# ProductVariant model for product variants (e.g., size, color)
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

    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"

# UserProfile model to extend the built-in User model
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

    def __str__(self):
        return self.user.username

# Order model for customer purchases
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

    def __str__(self):
        return f"Order #{self.id} by {self.user.username} at {self.shop.name}"

# OrderItem model for products and their quantities in an order
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

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

    def __str__(self):
        return f"Payment #{self.id} for Order #{self.order.id} ({self.status})"

# AuditLog model for tracking changes to Shop and Product
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

    def __str__(self):
        return f"{self.action} on {self.model_type} {self.object_id} by {self.user}"

# Wishlist model for users to favorite products
class Wishlist(models.Model):
    # User who owns the wishlist
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    # Products favorited by the user
    products = models.ManyToManyField(Product, related_name='wishlisted_by')

    def __str__(self):
        return f"{self.user.username}'s Wishlist"

# Message model for messaging between users and shopowners
class Message(models.Model):
    # User sending the message
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    # User receiving the message
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    # Message content
    content = models.TextField()
    # Timestamp of the message
    timestamp = models.DateTimeField(auto_now_add=True)
    # Optional: link to a shop or product for context
    shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')

    def __str__(self):
        return f"From {self.sender.username} to {self.recipient.username} at {self.timestamp}"

# Notification model for shopowners (e.g., new orders, low stock)
class Notification(models.Model):
    # Notification type choices
    TYPE_CHOICES = [
        ('shop_created', 'Shop Created'),
        ('new_order', 'New Order'),
        ('order_status_update', 'Order Status Update'),
        ('new_review', 'New Review'),
        ('low_stock', 'Low Stock Alert'),
        ('out_of_stock', 'Out of Stock'),
        ('milestone', 'Milestone Achievement'),
        ('system', 'System Notification'),
    ]
    
    # Priority levels
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # User to be notified (shopowner)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    # Notification message
    message = models.TextField()
    # Type of notification with predefined choices
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='system')
    # Priority level of the notification
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    # Has the notification been read?
    is_read = models.BooleanField(default=False)
    # Timestamp of the notification
    timestamp = models.DateTimeField(auto_now_add=True)
    # Optional: link to a shop, product, or order for context
    shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    
    class Meta:
        ordering = ['-timestamp']  # Most recent first
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:30]}..."
    
    @property
    def priority_icon(self):
        """Return an icon based on priority level."""
        icons = {
            'low': '💬',
            'medium': '📢',
            'high': '⚡',
            'urgent': '🚨'
        }
        return icons.get(self.priority, '📢')
    
    @property
    def type_icon(self):
        """Return an icon based on notification type."""
        icons = {
            'shop_created': '🎉',
            'new_order': '📦',
            'order_status_update': '📊',
            'new_review': '📝',
            'low_stock': '⚠️',
            'out_of_stock': '🚫',
            'milestone': '🏆',
            'system': '🔔'
        }
        return icons.get(self.type, '🔔')

# Shop Review model for customer reviews and ratings
class ShopReview(models.Model):
    RATING_CHOICES = [
        (1, '1 Star - Poor'),
        (2, '2 Stars - Fair'),
        (3, '3 Stars - Good'),
        (4, '4 Stars - Very Good'),
        (5, '5 Stars - Excellent'),
    ]
    
    # Unique identifier for each review
    reviewId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    
    # Customer who wrote the review
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shop_reviews')
    
    # Shop being reviewed
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='reviews')
    
    # Rating from 1 to 5 stars
    rating = models.IntegerField(choices=RATING_CHOICES)
    
    # Review title
    title = models.CharField(max_length=200, blank=True)
    
    # Review content
    review_text = models.TextField()
    
    # Optional: Order associated with this review (verified purchase)
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='shop_reviews')
    
    # Is this a verified purchase review?
    is_verified_purchase = models.BooleanField(default=False)
    
    # Review status
    STATUS_CHOICES = [
        ('pending', 'Pending Moderation'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('hidden', 'Hidden by Shop Owner'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Helpful votes from other customers
    helpful_votes = models.PositiveIntegerField(default=0)
    
    # Report count (for inappropriate reviews)
    report_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        # One review per customer per shop
        unique_together = ['customer', 'shop']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.first_name} - {self.shop.name} ({self.rating} stars)"
    
    @property
    def customer_name(self):
        """Get the customer's display name."""
        if self.customer.first_name and self.customer.last_name:
            return f"{self.customer.first_name} {self.customer.last_name}"
        return self.customer.username
    
    @property
    def is_recent(self):
        """Check if review is from the last 30 days."""
        from django.utils import timezone
        from datetime import timedelta
        return self.created_at >= timezone.now() - timedelta(days=30)

# Shop Review Response model for shop owner responses to reviews
class ShopReviewResponse(models.Model):
    # Unique identifier for each response
    responseId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    
    # Review being responded to
    review = models.OneToOneField(ShopReview, on_delete=models.CASCADE, related_name='response')
    
    # Shop owner (must be the owner of the shop being reviewed)
    shop_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_responses')
    
    # Response text
    response_text = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Response by {self.shop_owner.username} to {self.review.customer.username}'s review"
    
    def save(self, *args, **kwargs):
        # Ensure only the shop owner can respond
        if self.shop_owner != self.review.shop.shopowner:
            raise ValueError("Only the shop owner can respond to reviews of their shop")
        super().save(*args, **kwargs)

# Shop Rating Summary model for aggregated ratings
class ShopRatingSummary(models.Model):
    # Shop this summary belongs to
    shop = models.OneToOneField(Shop, on_delete=models.CASCADE, related_name='rating_summary')
    
    # Overall average rating
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Total number of reviews
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Rating distribution
    rating_5_count = models.PositiveIntegerField(default=0)
    rating_4_count = models.PositiveIntegerField(default=0)
    rating_3_count = models.PositiveIntegerField(default=0)
    rating_2_count = models.PositiveIntegerField(default=0)
    rating_1_count = models.PositiveIntegerField(default=0)
    
    # Last updated timestamp
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.shop.name} - {self.average_rating} stars ({self.total_reviews} reviews)"
    
    def update_rating_summary(self):
        """Update the rating summary based on approved reviews."""
        from django.db.models import Avg, Count, Q
        
        approved_reviews = self.shop.reviews.filter(status='approved')
        
        # Calculate average rating
        avg_rating = approved_reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        self.average_rating = round(avg_rating, 2)
        
        # Count total reviews
        self.total_reviews = approved_reviews.count()
        
        # Count rating distribution
        self.rating_5_count = approved_reviews.filter(rating=5).count()
        self.rating_4_count = approved_reviews.filter(rating=4).count()
        self.rating_3_count = approved_reviews.filter(rating=3).count()
        self.rating_2_count = approved_reviews.filter(rating=2).count()
        self.rating_1_count = approved_reviews.filter(rating=1).count()
        
        self.save()
    
    @property
    def rating_percentages(self):
        """Get rating distribution as percentages."""
        if self.total_reviews == 0:
            return {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        
        return {
            5: round((self.rating_5_count / self.total_reviews) * 100, 1),
            4: round((self.rating_4_count / self.total_reviews) * 100, 1),
            3: round((self.rating_3_count / self.total_reviews) * 100, 1),
            2: round((self.rating_2_count / self.total_reviews) * 100, 1),
            1: round((self.rating_1_count / self.total_reviews) * 100, 1),
        }

# Review Helpful Vote model for customers to mark reviews as helpful
class ReviewHelpfulVote(models.Model):
    # Customer who voted
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='helpful_votes')
    
    # Review being voted on
    review = models.ForeignKey(ShopReview, on_delete=models.CASCADE, related_name='helpful_vote_records')
    
    # Is this vote helpful (True) or not helpful (False)
    is_helpful = models.BooleanField(default=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # One vote per customer per review
        unique_together = ['customer', 'review']
    
    def __str__(self):
        return f"{self.customer.username} found {self.review.reviewId} helpful"


# Order Tracking model for detailed order status tracking
class OrderTracking(models.Model):
    TRACKING_STATUS_CHOICES = [
        ('order_placed', 'Order Placed'),
        ('payment_confirmed', 'Payment Confirmed'),
        ('processing', 'Processing'),
        ('packed', 'Packed'),
        ('shipped', 'Shipped'),
        ('in_transit', 'In Transit'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('returned', 'Returned'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Order being tracked
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='tracking_entries')
    
    # Tracking status
    status = models.CharField(max_length=50, choices=TRACKING_STATUS_CHOICES)
    
    # Description of the tracking update
    description = models.TextField(blank=True)
    
    # Location information
    location = models.CharField(max_length=255, blank=True)
    
    # Tracking number (for shipping)
    tracking_number = models.CharField(max_length=100, blank=True)
    
    # Carrier information (DHL, FedEx, UPS, etc.)
    carrier = models.CharField(max_length=100, blank=True)
    
    # Timestamp of the tracking update
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # User who created the tracking entry (optional)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Additional metadata (JSON field for flexibility)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['order', 'timestamp']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Order #{self.order.id} - {self.status} at {self.timestamp}"


# Enhanced Order model with additional fields
class OrderAnalytics(models.Model):
    """
    Analytics model for order insights and reporting.
    """
    # Order reference
    order = models.OneToOneField('Order', on_delete=models.CASCADE, related_name='analytics')
    
    # Customer analytics
    customer_type = models.CharField(max_length=50, choices=[
        ('new', 'New Customer'),
        ('returning', 'Returning Customer'),
        ('vip', 'VIP Customer')
    ], default='new')
    
    # Order source
    order_source = models.CharField(max_length=50, choices=[
        ('web', 'Website'),
        ('mobile', 'Mobile App'),
        ('api', 'API'),
        ('phone', 'Phone Order'),
        ('in_store', 'In Store')
    ], default='web')
    
    # Marketing attribution
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)
    
    # Financial metrics
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Fulfillment metrics
    processing_time = models.DurationField(null=True, blank=True)  # Time to process
    shipping_time = models.DurationField(null=True, blank=True)   # Time to ship
    delivery_time = models.DurationField(null=True, blank=True)   # Time to deliver
    
    # Customer satisfaction
    rating = models.PositiveSmallIntegerField(null=True, blank=True)  # 1-5 stars
    feedback = models.TextField(blank=True)
    
    # Additional metrics
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    return_reason = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for Order #{self.order.id}"


# Shipping Address model for detailed shipping information
class ShippingAddress(models.Model):
    # Order reference
    order = models.OneToOneField('Order', on_delete=models.CASCADE, related_name='shipping_address')
    
    # Recipient information
    recipient_name = models.CharField(max_length=100)
    recipient_phone = models.CharField(max_length=20, blank=True)
    recipient_email = models.EmailField(blank=True)
    
    # Address details
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='Kenya')
    
    # Delivery instructions
    delivery_instructions = models.TextField(blank=True)
    
    # Coordinates (for delivery optimization)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Shipping to {self.recipient_name} - Order #{self.order.id}"
    
    @property
    def full_address(self):
        """Get formatted full address."""
        address_parts = [
            self.address_line_1,
            self.address_line_2,
            self.city,
            self.state_province,
            self.postal_code,
            self.country
        ]
        return ', '.join(filter(None, address_parts))


# === ADVANCED ANALYTICS MODELS ===

class BusinessAnalytics(models.Model):
    """Store business analytics data for shops"""
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='business_analytics')
    date = models.DateField(default=timezone.now)
    
    # Revenue Metrics
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Order Metrics
    total_orders = models.IntegerField(default=0)
    completed_orders = models.IntegerField(default=0)
    cancelled_orders = models.IntegerField(default=0)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Customer Metrics
    new_customers = models.IntegerField(default=0)
    returning_customers = models.IntegerField(default=0)
    customer_lifetime_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Product Metrics
    products_sold = models.IntegerField(default=0)
    top_selling_product = models.ForeignKey('Product', on_delete=models.SET_NULL, null=True, blank=True)
    inventory_turnover = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Traffic Metrics
    page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['shop', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.shop.name} Analytics - {self.date}"


class CustomerBehaviorAnalytics(models.Model):
    """Store customer behavior analytics"""
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='behavior_analytics')
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='customer_behavior_analytics')
    
    # Purchase Behavior
    total_orders = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_order_date = models.DateTimeField(null=True, blank=True)
    
    # Engagement Metrics
    first_purchase_date = models.DateTimeField(null=True, blank=True)
    last_login_date = models.DateTimeField(null=True, blank=True)
    total_sessions = models.IntegerField(default=0)
    pages_viewed = models.IntegerField(default=0)
    
    # Segmentation
    customer_segment = models.CharField(max_length=50, choices=[
        ('new', 'New Customer'),
        ('regular', 'Regular Customer'),
        ('vip', 'VIP Customer'),
        ('at_risk', 'At Risk'),
        ('churned', 'Churned'),
    ], default='new')
    
    # Preferences
    preferred_categories = models.JSONField(default=list, blank=True)
    favorite_products = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['customer', 'shop']

    def __str__(self):
        return f"{self.customer.username} - {self.shop.name} Analytics"


class ProductPerformanceAnalytics(models.Model):
    """Store product performance analytics"""
    product = models.OneToOneField('Product', on_delete=models.CASCADE, related_name='performance_analytics')
    
    # Sales Metrics
    total_sold = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.IntegerField(default=0)
    
    # Inventory Metrics
    current_stock = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10)
    reorder_point = models.IntegerField(default=5)
    turnover_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Performance Metrics
    views_count = models.IntegerField(default=0)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cart_abandonment_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Trending
    weekly_trend = models.CharField(max_length=20, choices=[
        ('up', 'Trending Up'),
        ('down', 'Trending Down'),
        ('stable', 'Stable'),
    ], default='stable')
    
    last_sale_date = models.DateTimeField(null=True, blank=True)
    peak_sales_period = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} Performance Analytics"

    @property
    def is_low_stock(self):
        return self.current_stock <= self.low_stock_threshold

    @property
    def needs_reorder(self):
        return self.current_stock <= self.reorder_point


class SalesForecasting(models.Model):
    """Store sales forecasting data"""
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='sales_forecasts')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='sales_forecasts', null=True, blank=True)
    
    forecast_date = models.DateField()
    forecast_type = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
    ])
    
    # Forecasted Metrics
    predicted_revenue = models.DecimalField(max_digits=12, decimal_places=2)
    predicted_orders = models.IntegerField()
    predicted_units_sold = models.IntegerField(null=True, blank=True)
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Actual vs Predicted (filled after the period)
    actual_revenue = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_orders = models.IntegerField(null=True, blank=True)
    actual_units_sold = models.IntegerField(null=True, blank=True)
    accuracy_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['shop', 'product', 'forecast_date', 'forecast_type']
        ordering = ['-forecast_date']

    def __str__(self):
        product_name = self.product.name if self.product else "All Products"
        return f"{self.shop.name} - {product_name} Forecast ({self.forecast_date})"


class MarketingCampaignAnalytics(models.Model):
    """Track marketing campaigns and their performance"""
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='marketing_campaigns')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    campaign_type = models.CharField(max_length=50, choices=[
        ('email', 'Email Marketing'),
        ('social', 'Social Media'),
        ('sms', 'SMS Marketing'),
        ('discount', 'Discount Campaign'),
        ('seasonal', 'Seasonal Campaign'),
        ('product_launch', 'Product Launch'),
    ])
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Performance Metrics
    impressions = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)
    conversions = models.IntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_per_acquisition = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    return_on_investment = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='draft')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.shop.name} - {self.name}"

    @property
    def click_through_rate(self):
        if self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return 0

    @property
    def conversion_rate(self):
        if self.clicks > 0:
            return (self.conversions / self.clicks) * 100
        return 0
