#!/usr/bin/env python
"""
Test script to verify product creation functionality
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/home/flamers/OneSoko-/OneSoko')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')
django.setup()

from OneSokoApp.models import Product, Shop, Category, User
from decimal import Decimal

def test_product_creation():
    """Test creating a product in the database"""
    try:
        # Get or create a test user
        user, created = User.objects.get_or_create(
            username='test_shopowner',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'ShopOwner'
            }
        )
        
        # Get or create a test shop
        shop, created = Shop.objects.get_or_create(
            name='Test Shop',
            defaults={
                'shopowner': user,
                'location': 'Test Location',
                'description': 'A test shop for product creation',
                'phone': '+1234567890',
                'email': 'shop@example.com'
            }
        )
        
        # Get or create a test category
        category, created = Category.objects.get_or_create(
            name='Electronics',
            defaults={'slug': 'electronics'}
        )
        
        # Create a test product
        product = Product.objects.create(
            name='Test Product',
            description='This is a test product for database verification',
            price=Decimal('29.99'),
            quantity=50,
            category=category,
            discount=Decimal('10.00'),
            promotional_price=Decimal('26.99'),
            is_active=True
        )
        
        # Add product to shop
        shop.products.add(product)
        
        print(f"✅ Successfully created product: {product.name}")
        print(f"   Product ID: {product.productId}")
        print(f"   Price: ${product.price}")
        print(f"   Quantity: {product.quantity}")
        print(f"   Shop: {shop.name}")
        print(f"   Category: {category.name}")
        
        # Verify the product is in the shop
        if product in shop.products.all():
            print("✅ Product successfully added to shop")
        else:
            print("❌ Product not found in shop")
            
        return True
        
    except Exception as e:
        print(f"❌ Error creating product: {str(e)}")
        return False

def list_products():
    """List all products in the database"""
    try:
        products = Product.objects.all()
        print(f"\n📋 Found {products.count()} products in database:")
        
        for product in products:
            print(f"   - {product.name} (ID: {product.productId}) - ${product.price}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error listing products: {str(e)}")
        return False

if __name__ == '__main__':
    print("🧪 Testing Product Creation...")
    
    # Test creating a product
    success = test_product_creation()
    
    if success:
        print("\n📊 Database Status:")
        list_products()
    else:
        print("\n❌ Product creation failed") 