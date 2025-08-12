# Database Migration Guide for Shop Identification System

## Overview
This document outlines the database schema changes required to support the comprehensive shop identification and business verification system.

## Required Database Changes

### 1. Shop Model Enhancements

#### New Fields to Add to Shop Model:

```python
# Add to models.py in OneSokoApp

class Shop(models.Model):
    # ... existing fields ...
    
    # Business Registration Fields
    business_type = models.CharField(
        max_length=50,
        choices=[
            ('sole_proprietorship', 'Sole Proprietorship'),
            ('partnership', 'Partnership'),
            ('corporation', 'Corporation'),
            ('llc', 'LLC'),
            ('other', 'Other'),
        ],
        blank=True,
        null=True
    )
    business_category = models.CharField(max_length=100, blank=True)
    business_registration_number = models.CharField(max_length=100, blank=True)
    tax_identification_number = models.CharField(max_length=100, blank=True)
    
    # Contact Enhancement
    website_url = models.URLField(blank=True)
    
    # Operating Hours (JSON field)
    operating_hours = models.JSONField(
        default=dict,
        help_text="Operating hours for each day of the week"
    )
    
    # Payment and Delivery Options
    payment_methods = models.JSONField(
        default=list,
        help_text="List of accepted payment methods"
    )
    delivery_options = models.JSONField(
        default=list,
        help_text="List of available delivery options"
    )
    
    # Social Media Links
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    
    # Verification System
    is_verified = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('not_started', 'Not Started'),
            ('pending', 'Pending'),
            ('under_review', 'Under Review'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='not_started'
    )
    verification_date = models.DateTimeField(blank=True, null=True)
    
    # Additional Business Information
    establishment_year = models.IntegerField(blank=True, null=True)
    employee_count = models.CharField(
        max_length=20,
        choices=[
            ('1-5', '1-5 employees'),
            ('6-10', '6-10 employees'),
            ('11-25', '11-25 employees'),
            ('26-50', '26-50 employees'),
            ('51-100', '51-100 employees'),
            ('100+', '100+ employees'),
        ],
        blank=True
    )
    annual_revenue_range = models.CharField(
        max_length=30,
        choices=[
            ('0-10k', '$0 - $10,000'),
            ('10k-50k', '$10,000 - $50,000'),
            ('50k-100k', '$50,000 - $100,000'),
            ('100k-500k', '$100,000 - $500,000'),
            ('500k+', '$500,000+'),
        ],
        blank=True
    )
    target_market = models.TextField(blank=True)
    
    # Performance Metrics
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)
    response_rate = models.PositiveIntegerField(default=0)  # Percentage
    response_time_hours = models.PositiveIntegerField(default=24)
    
    # SEO and Marketing
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    keywords = models.JSONField(default=list, help_text="SEO keywords")
    featured_image = models.ImageField(upload_to='shop_featured/', blank=True)
    gallery_images = models.JSONField(default=list, help_text="Gallery image URLs")
    
    # Compliance and Legal
    gdpr_compliant = models.BooleanField(default=False)
    terms_accepted = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.name} ({'Verified' if self.is_verified else 'Unverified'})"
```

### 2. New VerificationDocument Model

```python
class VerificationDocument(models.Model):
    DOCUMENT_TYPES = [
        ('business_license', 'Business License'),
        ('tax_certificate', 'Tax Certificate'),
        ('identity_document', 'Identity Document'),
        ('bank_statement', 'Bank Statement'),
        ('utility_bill', 'Utility Bill'),
        ('other', 'Other Document'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='verification_documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    name = models.CharField(max_length=200)
    file = models.FileField(upload_to='verification_docs/')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        'auth.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='reviewed_documents'
    )
    
    class Meta:
        unique_together = ['shop', 'document_type']
    
    def __str__(self):
        return f"{self.shop.name} - {self.get_document_type_display()}"
```

### 3. Migration Commands

```python
# Create migration file
python manage.py makemigrations OneSokoApp

# Apply migrations
python manage.py migrate OneSokoApp
```

### 4. Sample Migration Script

```python
# Generated migration file (example)
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('OneSokoApp', '0001_initial'),  # Replace with your latest migration
    ]

    operations = [
        # Add new fields to Shop model
        migrations.AddField(
            model_name='shop',
            name='business_type',
            field=models.CharField(blank=True, choices=[('sole_proprietorship', 'Sole Proprietorship'), ('partnership', 'Partnership'), ('corporation', 'Corporation'), ('llc', 'LLC'), ('other', 'Other')], max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='shop',
            name='business_category',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='shop',
            name='business_registration_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='shop',
            name='tax_identification_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='shop',
            name='website_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='shop',
            name='operating_hours',
            field=models.JSONField(default=dict, help_text='Operating hours for each day of the week'),
        ),
        migrations.AddField(
            model_name='shop',
            name='payment_methods',
            field=models.JSONField(default=list, help_text='List of accepted payment methods'),
        ),
        migrations.AddField(
            model_name='shop',
            name='delivery_options',
            field=models.JSONField(default=list, help_text='List of available delivery options'),
        ),
        migrations.AddField(
            model_name='shop',
            name='facebook_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='shop',
            name='twitter_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='shop',
            name='instagram_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='shop',
            name='linkedin_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='shop',
            name='is_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='shop',
            name='verification_status',
            field=models.CharField(choices=[('not_started', 'Not Started'), ('pending', 'Pending'), ('under_review', 'Under Review'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='not_started', max_length=20),
        ),
        migrations.AddField(
            model_name='shop',
            name='verification_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        # ... add all other fields ...
        
        # Create VerificationDocument model
        migrations.CreateModel(
            name='VerificationDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(choices=[('business_license', 'Business License'), ('tax_certificate', 'Tax Certificate'), ('identity_document', 'Identity Document'), ('bank_statement', 'Bank Statement'), ('utility_bill', 'Utility Bill'), ('other', 'Other Document')], max_length=20)),
                ('name', models.CharField(max_length=200)),
                ('file', models.FileField(upload_to='verification_docs/')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=10)),
                ('rejection_reason', models.TextField(blank=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_documents', to='auth.user')),
                ('shop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='verification_documents', to='OneSokoApp.shop')),
            ],
            options={
                'unique_together': {('shop', 'document_type')},
            },
        ),
    ]
```

## API Views Updates

### Required View Enhancements:

```python
# Add to views.py or create new verification views

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class ShopViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    @action(detail=True, methods=['post'])
    def verification_upload(self, request, pk=None):
        """Upload verification document"""
        shop = self.get_object()
        # Handle file upload logic
        return Response({'message': 'Document uploaded successfully'})
    
    @action(detail=True, methods=['post'])
    def verification_submit(self, request, pk=None):
        """Submit shop for verification"""
        shop = self.get_object()
        shop.verification_status = 'pending'
        shop.save()
        return Response({'message': 'Submitted for verification'})
    
    @action(detail=True, methods=['get'])
    def verification_status(self, request, pk=None):
        """Get verification status"""
        shop = self.get_object()
        return Response({
            'status': shop.verification_status,
            'is_verified': shop.is_verified,
            'verification_date': shop.verification_date
        })
```

## Serializer Updates

```python
# Update serializers.py

class ShopSerializer(serializers.ModelSerializer):
    verification_documents = serializers.SerializerMethodField()
    
    class Meta:
        model = Shop
        fields = '__all__'  # Include all new fields
    
    def get_verification_documents(self, obj):
        return VerificationDocumentSerializer(
            obj.verification_documents.all(), 
            many=True
        ).data

class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = '__all__'
```

## Admin Interface Updates

```python
# Update admin.py

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'business_category', 'verification_status', 
        'is_verified', 'created_at'
    ]
    list_filter = [
        'verification_status', 'is_verified', 'business_type',
        'business_category'
    ]
    search_fields = ['name', 'business_registration_number']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'slug', 'logo')
        }),
        ('Contact & Location', {
            'fields': ('email', 'phone', 'website_url', 'street', 'city', 'country')
        }),
        ('Business Registration', {
            'fields': ('business_type', 'business_category', 
                      'business_registration_number', 'tax_identification_number')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_status', 'verification_date')
        }),
        # ... other fieldsets
    )

@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = ['shop', 'document_type', 'status', 'uploaded_at']
    list_filter = ['status', 'document_type']
    search_fields = ['shop__name', 'name']
```

## Data Migration Script

```python
# Create a data migration to populate default values
# python manage.py makemigrations --empty OneSokoApp

from django.db import migrations

def populate_default_operating_hours(apps, schema_editor):
    Shop = apps.get_model('OneSokoApp', 'Shop')
    default_hours = {
        'monday': {'open': '09:00', 'close': '17:00', 'closed': False},
        'tuesday': {'open': '09:00', 'close': '17:00', 'closed': False},
        'wednesday': {'open': '09:00', 'close': '17:00', 'closed': False},
        'thursday': {'open': '09:00', 'close': '17:00', 'closed': False},
        'friday': {'open': '09:00', 'close': '17:00', 'closed': False},
        'saturday': {'open': '09:00', 'close': '15:00', 'closed': False},
        'sunday': {'open': '00:00', 'close': '00:00', 'closed': True},
    }
    
    for shop in Shop.objects.all():
        if not shop.operating_hours:
            shop.operating_hours = default_hours
            shop.save()

class Migration(migrations.Migration):
    dependencies = [
        ('OneSokoApp', '0002_shop_enhancements'),  # Previous migration
    ]

    operations = [
        migrations.RunPython(populate_default_operating_hours),
    ]
```

## Testing Recommendations

```python
# Create test cases for new functionality
# tests.py

from django.test import TestCase
from django.contrib.auth.models import User
from .models import Shop, VerificationDocument

class ShopVerificationTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('testuser', 'test@example.com', 'pass')
        self.shop = Shop.objects.create(
            name='Test Shop',
            shopowner=self.user,
            verification_status='not_started'
        )
    
    def test_verification_status_update(self):
        self.shop.verification_status = 'pending'
        self.shop.save()
        self.assertEqual(self.shop.verification_status, 'pending')
    
    def test_verification_document_upload(self):
        doc = VerificationDocument.objects.create(
            shop=self.shop,
            document_type='business_license',
            name='Business License.pdf'
        )
        self.assertEqual(doc.status, 'pending')
```

## Deployment Notes

1. **Backup Database**: Always backup before running migrations
2. **Run in Staging**: Test all migrations in staging environment first
3. **Monitor Performance**: Large datasets may require batched migrations
4. **File Storage**: Ensure proper file storage configuration for document uploads
5. **Security**: Configure proper file upload validation and virus scanning

## Next Steps

1. Run the migrations in development environment
2. Test all CRUD operations for shops and verification documents
3. Implement the API endpoints for verification workflow
4. Add proper file validation and security measures
5. Create admin interface for verification management
6. Set up email notifications for verification status changes

This migration guide provides the foundation for implementing the comprehensive shop identification and business verification system in the OneSoko platform.
