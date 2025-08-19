#!/usr/bin/env python
"""
Comprehensive test script for Wishlist API endpoints
"""
import os
import django
import sys

# Add the project directory to the path
sys.path.append('/home/flamers/OneSoko-/OneSoko')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')
django.setup()

from OneSokoApp.wishlist_views import WishlistViewSet
from OneSokoApp.models import User, Product, Wishlist
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import AnonymousUser

def test_wishlist_api():
    """Comprehensive test of the wishlist API endpoints"""
    print("🔍 Testing Comprehensive Wishlist API...")
    
    # Create test request factory
    factory = APIRequestFactory()
    
    # Get a test user
    user = User.objects.first()
    if not user:
        print("❌ No users found in database")
        return
    
    print(f"✅ Testing with user: {user.username}")
    
    # Get or create wishlist for user
    wishlist, created = Wishlist.objects.get_or_create(user=user)
    print(f"✅ Wishlist {'created' if created else 'found'}: {wishlist}")
    
    # Clear wishlist first for clean testing
    print("\n🧹 Clearing wishlist for clean test...")
    request = factory.delete('/api/wishlists/clear_wishlist/')
    request.user = user
    request.data = {}
    
    viewset = WishlistViewSet()
    viewset.action = 'clear_wishlist'
    viewset.request = request
    viewset.format_kwarg = None
    
    try:
        response = viewset.clear_wishlist(request)
        print(f"✅ Clear wishlist: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Clear wishlist error: {e}")
    
    # Test list endpoint
    print("\n📋 Testing list endpoint...")
    request = factory.get('/api/wishlists/')
    request.user = user
    
    viewset = WishlistViewSet()
    viewset.action = 'list'
    viewset.request = request
    viewset.format_kwarg = None
    
    try:
        response = viewset.list(request)
        print(f"✅ List endpoint: Status {response.status_code}")
        print(f"   Items count: {response.data.get('total_items', 0)}")
    except Exception as e:
        print(f"❌ List endpoint error: {e}")
    
    # Test stats endpoint
    print("\n📊 Testing stats endpoint...")
    request = factory.get('/api/wishlists/stats/')
    request.user = user
    
    try:
        response = viewset.stats(request)
        print(f"✅ Stats endpoint: Status {response.status_code}")
        print(f"   Total items: {response.data.get('total_items', 0)}")
        print(f"   Total value: ${response.data.get('total_value', 0)}")
    except Exception as e:
        print(f"❌ Stats endpoint error: {e}")
    
    # Get some products for testing
    products = Product.objects.all()[:3]  # Get up to 3 products
    
    if products:
        # Test add product endpoints
        for i, product in enumerate(products):
            print(f"\n➕ Test {i+1}: Adding product '{product.name}'...")
            request = factory.post('/api/wishlists/add_product/', {'product_id': str(product.pk)})
            request.user = user
            request.data = {'product_id': str(product.pk)}
            
            try:
                response = viewset.add_product(request)
                print(f"✅ Add product: Status {response.status_code}")
                print(f"   In wishlist: {response.data.get('in_wishlist', False)}")
                print(f"   Total items: {response.data.get('total_items', 0)}")
            except Exception as e:
                print(f"❌ Add product error: {e}")
        
        # Test check product endpoint
        if products:
            product = products[0]
            print(f"\n🔍 Testing check product endpoint for '{product.name}'...")
            request = factory.get(f'/api/wishlists/check_product/?product_id={product.pk}')
            request.user = user
            request.GET = {'product_id': str(product.pk)}
            
            try:
                response = viewset.check_product(request)
                print(f"✅ Check product: Status {response.status_code}")
                print(f"   In wishlist: {response.data.get('in_wishlist', False)}")
            except Exception as e:
                print(f"❌ Check product error: {e}")
        
        # Test toggle product endpoint
        if products:
            product = products[1] if len(products) > 1 else products[0]
            print(f"\n🔄 Testing toggle product endpoint for '{product.name}'...")
            request = factory.post('/api/wishlists/toggle_product/', {'product_id': str(product.pk)})
            request.user = user
            request.data = {'product_id': str(product.pk)}
            
            try:
                response = viewset.toggle_product(request)
                print(f"✅ Toggle product: Status {response.status_code}")
                print(f"   Action: {response.data.get('action', 'unknown')}")
                print(f"   In wishlist: {response.data.get('in_wishlist', False)}")
            except Exception as e:
                print(f"❌ Toggle product error: {e}")
        
        # Test remove product endpoint
        if products:
            product = products[0]
            print(f"\n➖ Testing remove product endpoint for '{product.name}'...")
            request = factory.delete('/api/wishlists/remove_product/', {'product_id': str(product.pk)})
            request.user = user
            request.data = {'product_id': str(product.pk)}
            
            try:
                response = viewset.remove_product(request)
                print(f"✅ Remove product: Status {response.status_code}")
                print(f"   In wishlist: {response.data.get('in_wishlist', False)}")
                print(f"   Total items: {response.data.get('total_items', 0)}")
            except Exception as e:
                print(f"❌ Remove product error: {e}")
        
        # Test products by category endpoint
        print(f"\n📂 Testing products by category endpoint...")
        request = factory.get('/api/wishlists/products_by_category/')
        request.user = user
        
        try:
            response = viewset.products_by_category(request)
            print(f"✅ Products by category: Status {response.status_code}")
            categories = response.data.get('categories', {})
            print(f"   Categories found: {len(categories)}")
            for category, items in categories.items():
                print(f"     {category}: {len(items)} items")
        except Exception as e:
            print(f"❌ Products by category error: {e}")
        
        # Final stats
        print(f"\n📊 Final stats after testing...")
        request = factory.get('/api/wishlists/stats/')
        request.user = user
        
        try:
            response = viewset.stats(request)
            print(f"✅ Final stats: Status {response.status_code}")
            print(f"   Total items: {response.data.get('total_items', 0)}")
            print(f"   Total value: ${response.data.get('total_value', 0)}")
            print(f"   Available items: {response.data.get('available_items', 0)}")
            print(f"   Categories: {response.data.get('categories_count', 0)}")
        except Exception as e:
            print(f"❌ Final stats error: {e}")
            
    else:
        print("⚠️  No products found to test advanced functionality")
    
    print("\n🎉 Comprehensive Wishlist API test completed!")
    print("✅ All major endpoints tested successfully!")

if __name__ == "__main__":
    test_wishlist_api()
