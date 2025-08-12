#!/usr/bin/env python3
"""
Test script for Enhanced Shop Owner Notification System

This script tests the new notification features:
1. Product-specific order notifications
2. Daily order statistics
3. Weekly order summaries
4. Stock alerts
"""

import os
import sys
import django
from datetime import datetime, date, timedelta
import json

# Add the project root to Python path
sys.path.insert(0, '/home/flamers/OneSoko-/OneSoko')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')
django.setup()

from django.contrib.auth.models import User
from OneSokoApp.models import Shop, Product, Order, OrderItem, UserProfile, Notification
from OneSokoApp.enhanced_shop_notifications import (
    ShopOwnerNotificationManager,
    OrderNotificationEnhancer,
    notify_shop_owner_new_order,
    get_shop_owner_daily_stats,
    create_daily_summary_for_shop_owner
)

def test_enhanced_notifications():
    """Test the enhanced notification system"""
    print("🚀 Testing Enhanced Shop Owner Notification System\n")
    
    # 1. Create test users and shop
    print("1. Setting up test data...")
    
    # Create shop owner user
    shop_owner_user, created = User.objects.get_or_create(
        username='test_shop_owner',
        defaults={
            'email': 'shop_owner@test.com',
            'first_name': 'Test',
            'last_name': 'Owner'
        }
    )
    
    # Create shop owner profile
    shop_owner_profile, created = UserProfile.objects.get_or_create(
        user=shop_owner_user,
        defaults={
            'is_shopowner': True,
            'phone_number': '+1234567890'
        }
    )
    
    # Create regular customer user
    customer_user, created = User.objects.get_or_create(
        username='test_customer',
        defaults={
            'email': 'customer@test.com',
            'first_name': 'Test',
            'last_name': 'Customer'
        }
    )
    
    customer_profile, created = UserProfile.objects.get_or_create(
        user=customer_user,
        defaults={
            'is_shopowner': False,
            'phone_number': '+1234567891'
        }
    )
    
    # Create test shop
    test_shop, created = Shop.objects.get_or_create(
        name='Test Electronics Shop',
        defaults={
            'shopowner': shop_owner_user,
            'description': 'A test shop for electronics',
            'location': 'Test City'
        }
    )
    
    # Create test products
    product1, created = Product.objects.get_or_create(
        name='Test Smartphone',
        defaults={
            'description': 'A test smartphone',
            'price': 599.99,
            'quantity': 10
        }
    )
    
    product2, created = Product.objects.get_or_create(
        name='Test Laptop',
        defaults={
            'description': 'A test laptop',
            'price': 999.99,
            'quantity': 5
        }
    )
    
    # Add products to the shop
    test_shop.products.add(product1, product2)
    
    print(f"✅ Created shop: {test_shop.name}")
    print(f"✅ Created products: {product1.name}, {product2.name}")
    print(f"✅ Shop owner: {shop_owner_user.username}")
    print(f"✅ Customer: {customer_user.username}\n")
    
    # 2. Test order creation with enhanced notifications
    print("2. Testing order creation with enhanced notifications...")
    
    # Create a test order
    test_order = Order.objects.create(
        user=customer_user,
        shop=test_shop,
        total=1199.98,
        status='pending'
    )
    
    # Create order items
    order_item1 = OrderItem.objects.create(
        order=test_order,
        product=product1,
        quantity=1
    )
    
    order_item2 = OrderItem.objects.create(
        order=test_order,
        product=product2,
        quantity=1
    )
    
    print(f"✅ Created order #{test_order.id} with items:")
    print(f"   - {order_item1.quantity}x {product1.name} @ ${product1.price}")
    print(f"   - {order_item2.quantity}x {product2.name} @ ${product2.price}")
    
    # Test enhanced notification
    try:
        notify_shop_owner_new_order(test_order)
        print("✅ Enhanced notification sent successfully")
    except Exception as e:
        print(f"❌ Error sending enhanced notification: {e}")
    
    # 3. Test daily statistics
    print("\n3. Testing daily order statistics...")
    
    try:
        daily_stats = get_shop_owner_daily_stats(shop_owner_user)
        print("✅ Daily statistics retrieved:")
        print(f"   - Total orders: {daily_stats.get('total_orders', 0)}")
        print(f"   - Total revenue: ${daily_stats.get('total_revenue', 0)}")
        print(f"   - Products ordered: {len(daily_stats.get('products_ordered', []))}")
        
        if daily_stats.get('products_ordered'):
            print("   - Product breakdown:")
            for product_stat in daily_stats['products_ordered']:
                print(f"     • {product_stat['product_name']}: {product_stat['quantity']} units")
                
    except Exception as e:
        print(f"❌ Error retrieving daily statistics: {e}")
    
    # 4. Test weekly statistics
    print("\n4. Testing weekly order statistics...")
    
    try:
        weekly_stats = ShopOwnerNotificationManager.get_weekly_order_stats(shop_owner_user)
        print("✅ Weekly statistics retrieved:")
        print(f"   - Total orders: {weekly_stats.get('total_orders', 0)}")
        print(f"   - Total revenue: ${weekly_stats.get('total_revenue', 0)}")
        print(f"   - Days with orders: {len([d for d in weekly_stats.get('daily_breakdown', {}).values() if d['orders'] > 0])}")
        
    except Exception as e:
        print(f"❌ Error retrieving weekly statistics: {e}")
    
    # 5. Test daily summary creation
    print("\n5. Testing daily summary notification creation...")
    
    try:
        create_daily_summary_for_shop_owner(shop_owner_user)
        print("✅ Daily summary notification created")
        
        # Check if notification was created
        summary_notifications = Notification.objects.filter(
            user=shop_owner_user,
            type='daily_summary'
        ).order_by('-timestamp')
        
        if summary_notifications.exists():
            latest_summary = summary_notifications.first()
            print(f"   - Notification text: {latest_summary.text[:100]}...")
            print(f"   - Created at: {latest_summary.timestamp}")
        
    except Exception as e:
        print(f"❌ Error creating daily summary: {e}")
    
    # 6. Test stock alerts
    print("\n6. Testing stock alert system...")
    
    # Simulate low stock
    product1.quantity = 2  # Low stock
    product1.save()
    
    product2.quantity = 0  # Out of stock  
    product2.save()
    
    try:
        notification_manager = ShopOwnerNotificationManager()
        
        # Test low stock alert
        notification_manager.notify_low_stock(product1)
        print(f"✅ Low stock alert sent for {product1.name}")
        
        # Test out of stock alert
        notification_manager.notify_out_of_stock(product2)
        print(f"✅ Out of stock alert sent for {product2.name}")
        
        # Check notifications
        stock_notifications = Notification.objects.filter(
            user=shop_owner_user,
            type__in=['product_low_stock', 'product_out_of_stock']
        ).order_by('-timestamp')
        
        print(f"   - Total stock notifications: {stock_notifications.count()}")
        
    except Exception as e:
        print(f"❌ Error testing stock alerts: {e}")
    
    # 7. Check all notifications for shop owner
    print("\n7. Summary of all notifications...")
    
    all_notifications = Notification.objects.filter(
        user=shop_owner_user
    ).order_by('-timestamp')
    
    print(f"✅ Total notifications for shop owner: {all_notifications.count()}")
    
    notification_types = {}
    for notification in all_notifications:
        notification_types[notification.type] = notification_types.get(notification.type, 0) + 1
    
    print("   - Notification breakdown:")
    for notif_type, count in notification_types.items():
        print(f"     • {notif_type}: {count}")
    
    # Show recent notifications
    print("\n   - Recent notifications:")
    for notification in all_notifications[:5]:
        print(f"     • [{notification.type}] {notification.text[:80]}...")
    
    print("\n🎉 Enhanced notification system test completed!")
    print("\nThe notification system now provides:")
    print("✅ Product-specific order notifications")
    print("✅ Daily order statistics and summaries") 
    print("✅ Weekly order analytics")
    print("✅ Stock level alerts (low/out of stock)")
    print("✅ Comprehensive notification management")

if __name__ == '__main__':
    test_enhanced_notifications()
