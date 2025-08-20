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
    bio = models.TextField(blank=True, max_length=500)
    # Avatar/profile picture
    avatar = models.ImageField(upload_to='users/avatars/', blank=True, null=True)
    # Cover photo for profile (like X header image) - NEW
    cover_photo = models.ImageField(upload_to='users/covers/', blank=True, null=True)
    # Address (can be expanded to structured fields)
    address = models.CharField(max_length=255, blank=True)
    # Phone number - EXISTING
    phone_number = models.CharField(max_length=20, blank=True)
    # Website URL - NEW
    website = models.URLField(blank=True)
    # Date of birth - EXISTING
    date_of_birth = models.DateField(null=True, blank=True)
    # Location/City - NEW (different from existing city field)
    location = models.CharField(max_length=100, blank=True)
    # Is this user a shopowner?
    is_shopowner = models.BooleanField(default=False)
    # Profile visibility settings - NEW
    is_public = models.BooleanField(default=True)
    # Email verification status - NEW
    is_email_verified = models.BooleanField(default=False)
    # Social media links - NEW
    twitter_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    # Profile stats (computed fields) - NEW
    followers_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)
    # Verification badge (like X blue checkmark) - NEW
    is_verified = models.BooleanField(default=False)
    verification_type = models.CharField(
        max_length=20,
        choices=[
            ('none', 'None'),
            ('email', 'Email Verified'),
            ('phone', 'Phone Verified'),
            ('business', 'Business Verified'),
            ('premium', 'Premium Member'),
        ],
        default='none'
    )

    class Meta:
        db_table = 'OneSokoApp_userprofile'  # Keep existing table name
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} - {self.user.first_name} {self.user.last_name}"

    @property
    def full_name(self):
        """Get the user's full name"""
        if self.user.first_name and self.user.last_name:
            return f"{self.user.first_name} {self.user.last_name}"
        return self.user.username

    @property
    def display_name(self):
        """Get the display name for the profile"""
        if self.user.first_name:
            return self.user.first_name
        return self.user.username

    @property
    def avatar_url(self):
        """Get the avatar URL or return a default"""
        if self.avatar:
            return self.avatar.url
        return None

    @property
    def cover_photo_url(self):
        """Get the cover photo URL or return None"""
        if self.cover_photo:
            return self.cover_photo.url
        return None

    @property
    def profile_completion_percentage(self):
        """Calculate profile completion percentage"""
        fields_to_check = [
            self.bio, self.avatar, self.phone_number, 
            self.location, self.date_of_birth
        ]
        completed_fields = sum(1 for field in fields_to_check if field)
        return int((completed_fields / len(fields_to_check)) * 100)

    def get_verification_badge(self):
        """Get verification badge information"""
        if self.is_verified:
            return {
                'is_verified': True,
                'type': self.verification_type,
                'color': 'blue' if self.verification_type == 'premium' else 'green'
            }
        return {'is_verified': False}

# Follow/Following model for social connections (like X)
class UserFollow(models.Model):
    # User who is following
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    # User being followed
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    # When the follow relationship was created
    created_at = models.DateTimeField(auto_now_add=True)
    # Notification settings for this follow
    notifications_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_follow'
        unique_together = ('follower', 'following')
        verbose_name = 'User Follow'
        verbose_name_plural = 'User Follows'

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"

# User Posts/Activity model (like X tweets)
class UserPost(models.Model):
    # User who created the post
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    # Post content
    content = models.TextField(max_length=280)  # X-like character limit
    # Optional image
    image = models.ImageField(upload_to='posts/images/', blank=True, null=True)
    # Post type
    POST_TYPES = [
        ('post', 'Regular Post'),
        ('shop_update', 'Shop Update'),
        ('product_feature', 'Product Feature'),
        ('review', 'Review'),
    ]
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='post')
    # Engagement metrics
    likes_count = models.IntegerField(default=0)
    reposts_count = models.IntegerField(default=0)
    replies_count = models.IntegerField(default=0)
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    # Referenced product (if applicable)
    related_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    # Referenced shop (if applicable)
    related_shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'user_post'
        ordering = ['-created_at']
        verbose_name = 'User Post'
        verbose_name_plural = 'User Posts'

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."

# Post Likes model
class PostLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(UserPost, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'post_like'
        unique_together = ('user', 'post')

# Post Replies model (like X replies)
class PostReply(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(UserPost, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'post_reply'
        ordering = ['created_at']

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
    products = models.ManyToManyField(Product, related_name='wishlisted_by', through='WishlistItem')
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Ensure one wishlist per user
        unique_together = ['user']
    
    def __str__(self):
        return f"{self.user.username}'s Wishlist"
    
    @property
    def total_items(self):
        return self.products.count()
    
    @property
    def total_value(self):
        return sum(float(product.price) for product in self.products.all() if product.price)
    
    @property
    def available_items_count(self):
        return self.products.filter(is_active=True, deleted_at__isnull=True).count()

# Through model for Wishlist products to add timestamps
class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['wishlist', 'product']
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.username}'s wishlist"

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
    text = models.TextField()
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


# === CUSTOMER LOYALTY & REWARDS SYSTEM ===

class LoyaltyProgram(models.Model):
    """Shop-specific loyalty program configuration"""
    shop = models.OneToOneField('Shop', on_delete=models.CASCADE, related_name='loyalty_program')
    name = models.CharField(max_length=100, default="Loyalty Rewards")
    description = models.TextField(blank=True)
    
    # Program Settings
    is_active = models.BooleanField(default=True)
    points_per_dollar = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    minimum_spend_for_points = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    points_expiry_days = models.IntegerField(default=365)  # Points expire after 1 year
    
    # Tier System
    TIER_CHOICES = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'), 
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    
    # Tier Thresholds (annual spending)
    bronze_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    silver_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    gold_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=1500)
    platinum_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=5000)
    
    # Tier Multipliers
    bronze_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.00)
    silver_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.25)
    gold_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.50)
    platinum_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=2.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.shop.name} - {self.name}"
    
    def get_tier_for_spending(self, annual_spending):
        """Determine customer tier based on annual spending"""
        if annual_spending >= self.platinum_threshold:
            return 'platinum'
        elif annual_spending >= self.gold_threshold:
            return 'gold'
        elif annual_spending >= self.silver_threshold:
            return 'silver'
        else:
            return 'bronze'
    
    def get_tier_multiplier(self, tier):
        """Get points multiplier for a tier"""
        multipliers = {
            'bronze': self.bronze_multiplier,
            'silver': self.silver_multiplier,
            'gold': self.gold_multiplier,
            'platinum': self.platinum_multiplier,
        }
        return multipliers.get(tier, self.bronze_multiplier)


class CustomerLoyalty(models.Model):
    """Customer loyalty account for a specific shop"""
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loyalty_accounts')
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='loyalty_customers')
    
    # Points Balance
    total_points_earned = models.IntegerField(default=0)
    total_points_redeemed = models.IntegerField(default=0)
    current_points_balance = models.IntegerField(default=0)
    
    # Tier Information
    current_tier = models.CharField(max_length=20, choices=LoyaltyProgram.TIER_CHOICES, default='bronze')
    annual_spending = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tier_progress = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Percentage to next tier
    
    # Activity Tracking
    last_activity_date = models.DateTimeField(auto_now=True)
    total_orders = models.IntegerField(default=0)
    first_purchase_date = models.DateTimeField(null=True, blank=True)
    
    # Birthday Rewards
    birthday_date = models.DateField(null=True, blank=True)
    birthday_reward_claimed_year = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['customer', 'shop']
        verbose_name_plural = "Customer Loyalty Accounts"
    
    def __str__(self):
        return f"{self.customer.username} - {self.shop.name} ({self.current_tier.title()})"


class LoyaltyTransaction(models.Model):
    """Record of all loyalty points transactions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_loyalty = models.ForeignKey(CustomerLoyalty, on_delete=models.CASCADE, related_name='transactions')
    
    TRANSACTION_TYPES = [
        ('earned_purchase', 'Points Earned from Purchase'),
        ('earned_signup', 'Welcome Bonus'),
        ('earned_referral', 'Referral Bonus'),
        ('earned_review', 'Review Bonus'),
        ('earned_birthday', 'Birthday Bonus'),
        ('earned_bonus', 'Special Bonus'),
        ('redeemed_discount', 'Redeemed for Discount'),
        ('redeemed_product', 'Redeemed for Product'),
        ('expired', 'Points Expired'),
        ('adjustment', 'Manual Adjustment'),
    ]
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    points_change = models.IntegerField()  # Positive for earning, negative for spending
    points_balance_after = models.IntegerField()
    
    # Optional references
    reference_id = models.CharField(max_length=100, blank=True)  # Order ID, etc.
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        action = "earned" if self.points_change > 0 else "redeemed"
        return f"{self.customer_loyalty.customer.username} {action} {abs(self.points_change)} points"


class LoyaltyReward(models.Model):
    """Available rewards that customers can redeem"""
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='loyalty_rewards')
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    REWARD_TYPES = [
        ('discount_percentage', 'Percentage Discount'),
        ('discount_fixed', 'Fixed Amount Discount'),
        ('free_shipping', 'Free Shipping'),
        ('free_product', 'Free Product'),
        ('bonus_points', 'Bonus Points'),
    ]
    
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPES)
    points_cost = models.IntegerField()
    
    # Reward Value
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    free_product = models.ForeignKey('Product', on_delete=models.CASCADE, null=True, blank=True)
    bonus_points_amount = models.IntegerField(null=True, blank=True)
    
    # Availability
    is_active = models.BooleanField(default=True)
    max_redemptions_per_customer = models.IntegerField(default=1)
    total_available = models.IntegerField(null=True, blank=True)  # None = unlimited
    total_redeemed = models.IntegerField(default=0)
    
    # Validity
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    minimum_tier_required = models.CharField(max_length=20, choices=LoyaltyProgram.TIER_CHOICES, default='bronze')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.shop.name} - {self.name} ({self.points_cost} points)"


class LoyaltyRedemption(models.Model):
    """Record of reward redemptions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_loyalty = models.ForeignKey(CustomerLoyalty, on_delete=models.CASCADE, related_name='redemptions')
    reward = models.ForeignKey(LoyaltyReward, on_delete=models.CASCADE, related_name='redemptions')
    
    points_used = models.IntegerField()
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('redeemed', 'Redeemed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Generated coupon/code if applicable
    redemption_code = models.CharField(max_length=50, unique=True, blank=True)
    
    # Usage tracking
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.redemption_code:
            self.redemption_code = self.generate_redemption_code()
        super().save(*args, **kwargs)
    
    def generate_redemption_code(self):
        """Generate unique redemption code"""
        import random
        import string
        while True:
            code = 'REWARD' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not LoyaltyRedemption.objects.filter(redemption_code=code).exists():
                return code
    
    def __str__(self):
        return f"{self.customer_loyalty.customer.username} - {self.reward.name} - {self.redemption_code}"


class ReferralProgram(models.Model):
    """Referral program for customer acquisition"""
    shop = models.OneToOneField('Shop', on_delete=models.CASCADE, related_name='referral_program')
    
    is_active = models.BooleanField(default=True)
    referrer_reward_points = models.IntegerField(default=100)
    referee_reward_points = models.IntegerField(default=50)
    minimum_purchase_amount = models.DecimalField(max_digits=8, decimal_places=2, default=25.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.shop.name} Referral Program"


class CustomerReferral(models.Model):
    """Track customer referrals"""
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_received')
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='referrals')
    
    referral_code = models.CharField(max_length=20, unique=True)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    first_purchase_order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = self.generate_referral_code()
        super().save(*args, **kwargs)
    
    def generate_referral_code(self):
        """Generate unique referral code"""
        import random
        import string
        while True:
            code = self.referrer.username[:4].upper() + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not CustomerReferral.objects.filter(referral_code=code).exists():
                return code
    
    def __str__(self):
        return f"{self.referrer.username} referred {self.referee.username} - {self.referral_code}"


# Email Subscription model for newsletter signups
class EmailSubscription(models.Model):
    SUBSCRIPTION_TYPES = [
        ('newsletter', 'Newsletter'),
        ('promotions', 'Promotions'),
        ('updates', 'Product Updates'),
        ('shop_news', 'Shop News'),
    ]
    
    subscriptionId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    email = models.EmailField(unique=True)
    subscription_types = models.JSONField(default=list)  # List of subscription types
    is_active = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='email_subscriptions')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    # Tracking
    confirmation_token = models.CharField(max_length=255, null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    last_email_sent = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'email_subscriptions'
        verbose_name = 'Email Subscription'
        verbose_name_plural = 'Email Subscriptions'
    
    def generate_confirmation_token(self):
        """Generate a unique confirmation token"""
        import secrets
        self.confirmation_token = secrets.token_urlsafe(32)
        return self.confirmation_token
    
    def is_confirmed(self):
        """Check if subscription is confirmed"""
        return self.confirmed_at is not None
    
    def confirm_subscription(self):
        """Confirm the subscription"""
        self.confirmed_at = timezone.now()
        self.confirmation_token = None
        self.save()
    
    def unsubscribe(self):
        """Unsubscribe from emails"""
        self.is_active = False
        self.unsubscribed_at = timezone.now()
        self.save()
    
    def __str__(self):
        status = "Confirmed" if self.is_confirmed() else "Pending"
        return f"{self.email} - {status}"
