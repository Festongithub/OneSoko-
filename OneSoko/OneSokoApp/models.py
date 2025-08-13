from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, EmailValidator
from django.utils import timezone
import uuid


class UserProfile(models.Model):
    """Extended user profile with additional information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Enter a valid phone number.')],
        blank=True,
        null=True
    )
    date_of_birth = models.DateField(blank=True, null=True)
    avatar = models.ImageField(upload_to='users/', blank=True, null=True)
    bio = models.TextField(default='', blank=True)  # Match existing NOT NULL constraint
    address = models.CharField(max_length=255, default='', blank=True)  # Match existing NOT NULL constraint
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    is_shopowner = models.BooleanField(default=False)  # Match existing field name
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'OneSokoApp_userprofile'  # Explicitly set table name

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def __str__(self):
        return f"{self.user.username}'s Profile"


class BusinessCategory(models.Model):
    """Categories for different types of businesses"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)  # For storing icon class names
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Business Categories"
        db_table = 'OneSokoApp_businesscategory'  # Explicitly set table name

    def __str__(self):
        return self.name



class Shop(models.Model):
    """Main shop model with comprehensive business details"""
    BUSINESS_TYPE_CHOICES = [
        ('retail', 'Retail Store'),
        ('wholesale', 'Wholesale'),
        ('service', 'Service Provider'),
        ('restaurant', 'Restaurant/Food'),
        ('online', 'Online Only'),
        ('hybrid', 'Hybrid (Online + Physical)'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending Approval'),
    ]

    # Basic Information - matching existing schema
    shopId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField()
    location = models.CharField(max_length=255)  # Keep original location field
    
    # Contact Information - matching existing schema (make optional for faster creation)
    email = models.EmailField(validators=[EmailValidator()], blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)  # Make optional
    social_link = models.URLField(max_length=200, blank=True, null=True)
    
    # Address Information - using existing fields (make optional for faster creation)
    street = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)  # Make optional
    country = models.CharField(max_length=100, blank=True, null=True)  # Make optional
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Media
    logo = models.ImageField(upload_to='shops/logos/', blank=True, null=True)
    
    # Status and Performance - matching existing schema
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    views = models.IntegerField(default=0)
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    
    # Relationships - matching existing schema
    shopowner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_shops')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'OneSokoApp_shop'  # Explicitly set table name
        indexes = [
            models.Index(fields=['name']),  # For name search
            models.Index(fields=['slug']),  # For slug lookup
            models.Index(fields=['status', 'is_active']),  # For active shop filtering
            models.Index(fields=['city']),  # For location search
            models.Index(fields=['shopowner']),  # For owner lookup
            models.Index(fields=['created_at']),  # For sorting
            models.Index(fields=['name', 'city']),  # Combined search index
        ]

    def __str__(self):
        return self.name

    @property
    def full_address(self):
        parts = [self.street, self.city, self.country]
        return ", ".join([part for part in parts if part])

# Signal to create UserProfile when User is created
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
