from django.db import models
from django.contrib.auth.models import User
import uuid
from django.core.serializers import serialize

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
    # User to be notified (shopowner)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    # Notification message
    message = models.TextField()
    # Type of notification (e.g., 'order', 'low_stock')
    type = models.CharField(max_length=50)
    # Has the notification been read?
    is_read = models.BooleanField(default=False)
    # Timestamp of the notification
    timestamp = models.DateTimeField(auto_now_add=True)
    # Optional: link to a shop, product, or order for context
    shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:30]}..."
