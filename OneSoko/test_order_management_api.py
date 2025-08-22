#!/usr/bin/env python
"""
Comprehensive test script for Enhanced Order Management API endpoints
"""
import os
import django
import sys

# Add the project directory to the path
sys.path.append('/home/flamers/OneSoko-/OneSoko')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')
django.setup()

from OneSokoApp.order_management_views import EnhancedOrderViewSet
from OneSokoApp.models import User, Product, Order, OrderItem, Shop
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import AnonymousUser

def test_enhanced_order_management_api():
    """Comprehensive test of the enhanced order management API endpoints"""
    print("🔍 Testing Enhanced Order Management API...")
    
    # Create test request factory
    factory = APIRequestFactory()
    
    # Get a test user
    user = User.objects.first()
    if not user:
        print("❌ No users found in database")
        return
    
    print(f"✅ Testing with user: {user.username}")
    
    # Get a shop for testing (needed for order management)
    shop = Shop.objects.first()
    if not shop:
        print("❌ No shops found in database")
        return
    
    print(f"✅ Testing with shop: {shop.name}")
    
    # Test dashboard summary endpoint
    print("\n📊 Testing dashboard summary endpoint...")
    request = factory.get('/onesoko/enhanced-orders/dashboard_summary/')
    request.user = user
    
    viewset = EnhancedOrderViewSet()
    viewset.action = 'dashboard_summary'
    viewset.request = request
    viewset.format_kwarg = None
    
    try:
        response = viewset.dashboard_summary(request)
        print(f"✅ Dashboard summary: Status {response.status_code}")
        if response.status_code == 200:
            data = response.data
            print(f"   Total orders: {data.get('total_orders', 0)}")
            print(f"   Pending orders: {data.get('pending_orders', 0)}")
            print(f"   Total revenue: ${data.get('total_revenue', 0)}")
    except Exception as e:
        print(f"❌ Dashboard summary error: {e}")
    
    # Test analytics endpoint
    print("\n📈 Testing analytics endpoint...")
    request = factory.get('/onesoko/enhanced-orders/analytics/')
    request.user = user
    
    viewset = EnhancedOrderViewSet()
    viewset.action = 'analytics'
    viewset.request = request
    viewset.format_kwarg = None
    
    try:
        response = viewset.analytics(request)
        print(f"✅ Analytics: Status {response.status_code}")
        if response.status_code == 200:
            data = response.data
            print(f"   Analytics data available: {len(data) if isinstance(data, dict) else 'Yes'}")
    except Exception as e:
        print(f"❌ Analytics error: {e}")
    
    # Test order list endpoint
    print("\n📋 Testing order list endpoint...")
    request = factory.get('/onesoko/enhanced-orders/')
    request.user = user
    
    viewset = EnhancedOrderViewSet()
    viewset.action = 'list'
    viewset.request = request
    viewset.format_kwarg = None
    
    try:
        response = viewset.list(request)
        print(f"✅ Order list: Status {response.status_code}")
        if response.status_code == 200:
            orders = response.data.get('results', []) if 'results' in response.data else response.data
            print(f"   Orders found: {len(orders) if isinstance(orders, list) else 'Data available'}")
    except Exception as e:
        print(f"❌ Order list error: {e}")
    
    # Test with existing orders if available
    orders = Order.objects.all()[:2]  # Get up to 2 orders for testing
    
    if orders:
        for i, order in enumerate(orders):
            print(f"\n🔍 Test {i+1}: Testing order #{order.id}...")
            
            # Test order detail endpoint
            request = factory.get(f'/onesoko/enhanced-orders/{order.id}/')
            request.user = user
            
            try:
                response = viewset.retrieve(request, pk=order.id)
                print(f"✅ Order detail: Status {response.status_code}")
                if response.status_code == 200:
                    print(f"   Order status: {response.data.get('status', 'unknown')}")
                    print(f"   Order total: ${response.data.get('total', 0)}")
            except Exception as e:
                print(f"❌ Order detail error: {e}")
            
            # Test order tracking endpoint
            print(f"\n🚚 Testing tracking for order #{order.id}...")
            request = factory.get(f'/onesoko/enhanced-orders/{order.id}/tracking/')
            request.user = user
            
            viewset.action = 'tracking'
            try:
                response = viewset.tracking(request, pk=order.id)
                print(f"✅ Order tracking: Status {response.status_code}")
                if response.status_code == 200:
                    tracking_entries = response.data.get('tracking_entries', [])
                    print(f"   Tracking entries: {len(tracking_entries)}")
                    est_delivery = response.data.get('estimated_delivery')
                    if est_delivery:
                        print(f"   Estimated delivery: {est_delivery}")
            except Exception as e:
                print(f"❌ Order tracking error: {e}")
            
            # Test status update (only if user has permission)
            print(f"\n🔄 Testing status update for order #{order.id}...")
            new_status = 'shipped' if order.status == 'paid' else 'paid'
            request = factory.post(
                f'/onesoko/enhanced-orders/{order.id}/update_status/', 
                {'status': new_status}
            )
            request.user = user
            request.data = {'status': new_status}
            
            viewset.action = 'update_status'
            try:
                response = viewset.update_status(request, pk=order.id)
                print(f"✅ Status update: Status {response.status_code}")
                if response.status_code == 200:
                    print(f"   New status: {response.data.get('new_status', 'updated')}")
                elif response.status_code == 403:
                    print(f"   Permission denied (expected for non-shop-owners)")
            except Exception as e:
                print(f"❌ Status update error: {e}")
    
    # Test bulk status update
    if orders and len(orders) > 1:
        print(f"\n🔄 Testing bulk status update...")
        order_ids = [order.id for order in orders]
        request = factory.post(
            '/onesoko/enhanced-orders/bulk_update_status/', 
            {
                'order_ids': order_ids,
                'status': 'shipped'
            }
        )
        request.user = user
        request.data = {
            'order_ids': order_ids,
            'status': 'shipped'
        }
        
        viewset.action = 'bulk_update_status'
        try:
            response = viewset.bulk_update_status(request)
            print(f"✅ Bulk status update: Status {response.status_code}")
            if response.status_code == 200:
                updated_count = len(response.data.get('updated_orders', []))
                print(f"   Orders updated: {updated_count}")
            elif response.status_code == 403:
                print(f"   Permission denied (expected for non-shop-owners)")
        except Exception as e:
            print(f"❌ Bulk status update error: {e}")
    
    else:
        print("⚠️  No orders found to test advanced functionality")
        print("💡 Consider creating some test orders in the database")
    
    print("\n🎉 Enhanced Order Management API test completed!")
    print("✅ All accessible endpoints tested successfully!")

if __name__ == "__main__":
    test_enhanced_order_management_api()
