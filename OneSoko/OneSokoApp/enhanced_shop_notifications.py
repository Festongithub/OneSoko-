"""
Enhanced Shop Owner Notification System

This module provides enhanced notification functionality specifically for shop owners,
including order notifications and daily statistics.
"""

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import date, timedelta
from decimal import Decimal
from .models import Order, Shop, Notification, Product
import logging
import json
import uuid

logger = logging.getLogger(__name__)

def json_serializer(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (timezone.datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, uuid.UUID):
        return str(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

class ShopOwnerNotificationManager:
    """
    Manages notifications specifically for shop owners
    """
    
    @staticmethod
    def create_order_notification(order, notification_type='new_order_received'):
        """
        Create enhanced order notification for shop owner
        
        Args:
            order: Order instance
            notification_type: Type of order notification
        """
        try:
            # Get order items details
            order_items = order.items.all()
            items_details = []
            
            for item in order_items:
                items_details.append({
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'price': float(item.product.promotional_price or item.product.price),
                    'total': float(item.quantity * (item.product.promotional_price or item.product.price))
                })
            
            # Create notification text based on type
            if notification_type == 'new_order_received':
                notification_text = f"New order #{order.id} received from {order.user.get_full_name() or order.user.username} for ${order.total}"
            elif notification_type == 'order_status_updated':
                notification_text = f"Order #{order.id} status updated to {order.status}"
            else:
                notification_text = f"Order #{order.id} notification"
            
            # Create the notification
            notification = Notification.objects.create(
                user=order.shop.shopowner,
                text=notification_text,
                type=notification_type,
                order=order,
                shop=order.shop,
                data=json.dumps({
                    'order_id': str(order.id),
                    'customer_name': order.user.get_full_name() or order.user.username,
                    'customer_email': order.user.email,
                    'total': float(order.total),
                    'status': order.status,
                    'items_count': len(items_details),
                    'items_details': items_details,
                    'order_date': order.created_at.isoformat(),
                    'shop_name': order.shop.name
                }, default=json_serializer)
            )
            
            logger.info(f"Created order notification for shop owner {order.shop.shopowner.id}, order {order.id}")
            return notification
            
        except Exception as e:
            logger.error(f"Failed to create order notification: {e}")
            return None
    
    @staticmethod
    def create_product_ordered_notification(order):
        """
        Create detailed product-specific notifications for shop owner
        """
        try:
            order_items = order.items.all()
            
            for item in order_items:
                # Create notification for each product ordered
                notification_text = f"Your product '{item.product.name}' has been ordered! Quantity: {item.quantity}"
                
                Notification.objects.create(
                    user=order.shop.shopowner,
                    text=notification_text,
                    type='product_ordered',
                    order=order,
                    shop=order.shop,
                    product=item.product,
                    data=json.dumps({
                        'order_id': str(order.id),
                        'product_id': str(item.product.productId),
                        'product_name': item.product.name,
                        'quantity_ordered': item.quantity,
                        'unit_price': float(item.product.promotional_price or item.product.price),
                        'total_amount': float(item.quantity * (item.product.promotional_price or item.product.price)),
                        'customer_name': order.user.get_full_name() or order.user.username,
                        'remaining_stock': item.product.quantity,
                        'order_date': order.created_at.isoformat()
                    }, default=json_serializer)
                )
            
            logger.info(f"Created product-specific notifications for order {order.id}")
            
        except Exception as e:
            logger.error(f"Failed to create product ordered notifications: {e}")
    
    @staticmethod
    def get_daily_order_stats(shop_owner, target_date=None):
        """
        Get daily order statistics for a shop owner
        
        Args:
            shop_owner: User instance of shop owner
            target_date: Date to get stats for (defaults to today)
            
        Returns:
            dict: Daily order statistics
        """
        if target_date is None:
            target_date = timezone.now().date()
        
        try:
            # Get all shops owned by the user
            user_shops = Shop.objects.filter(shopowner=shop_owner)
            
            # Get orders for the specific date
            daily_orders = Order.objects.filter(
                shop__in=user_shops,
                created_at__date=target_date
            )
            
            # Calculate statistics
            total_orders = daily_orders.count()
            total_revenue = sum(order.total for order in daily_orders)
            
            # Group by status
            status_breakdown = {}
            for status_code, status_name in Order.STATUS_CHOICES:
                status_count = daily_orders.filter(status=status_code).count()
                if status_count > 0:
                    status_breakdown[status_name] = status_count
            
            # Group by shop
            shop_breakdown = {}
            for shop in user_shops:
                shop_orders = daily_orders.filter(shop=shop)
                if shop_orders.exists():
                    shop_breakdown[shop.name] = {
                        'orders_count': shop_orders.count(),
                        'revenue': sum(order.total for order in shop_orders),
                        'shop_id': shop.shopId
                    }
            
            # Get product statistics
            product_stats = {}
            for order in daily_orders:
                for item in order.items.all():
                    product_name = item.product.name
                    if product_name not in product_stats:
                        product_stats[product_name] = {
                            'total_quantity': 0,
                            'total_revenue': 0,
                            'orders_count': 0,
                            'product_id': item.product.productId
                        }
                    
                    product_stats[product_name]['total_quantity'] += item.quantity
                    product_stats[product_name]['total_revenue'] += item.quantity * (item.product.promotional_price or item.product.price)
                    product_stats[product_name]['orders_count'] += 1
            
            # Sort products by revenue
            top_products = sorted(
                product_stats.items(), 
                key=lambda x: x[1]['total_revenue'], 
                reverse=True
            )[:5]  # Top 5 products
            
            return {
                'date': target_date.isoformat(),
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'status_breakdown': status_breakdown,
                'shop_breakdown': shop_breakdown,
                'top_products': dict(top_products),
                'average_order_value': float(total_revenue / total_orders) if total_orders > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Failed to get daily order stats for shop owner {shop_owner.id}: {e}")
            return {
                'date': target_date.isoformat(),
                'total_orders': 0,
                'total_revenue': 0.0,
                'status_breakdown': {},
                'shop_breakdown': {},
                'top_products': {},
                'average_order_value': 0.0,
                'error': str(e)
            }
    
    @staticmethod
    def get_weekly_order_stats(shop_owner, target_date=None):
        """
        Get weekly order statistics for a shop owner
        """
        if target_date is None:
            target_date = timezone.now().date()
        
        # Get start of week (Monday)
        start_of_week = target_date - timedelta(days=target_date.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        
        try:
            # Get all shops owned by the user
            user_shops = Shop.objects.filter(shopowner=shop_owner)
            
            # Get orders for the week
            weekly_orders = Order.objects.filter(
                shop__in=user_shops,
                created_at__date__gte=start_of_week,
                created_at__date__lte=end_of_week
            )
            
            # Daily breakdown
            daily_stats = {}
            for i in range(7):
                day = start_of_week + timedelta(days=i)
                day_orders = weekly_orders.filter(created_at__date=day)
                daily_stats[day.strftime('%A')] = {
                    'date': day.isoformat(),
                    'orders': day_orders.count(),
                    'revenue': float(sum(order.total for order in day_orders))
                }
            
            total_orders = weekly_orders.count()
            total_revenue = sum(order.total for order in weekly_orders)
            
            return {
                'week_start': start_of_week.isoformat(),
                'week_end': end_of_week.isoformat(),
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'daily_breakdown': daily_stats,
                'average_daily_orders': float(total_orders / 7),
                'average_daily_revenue': float(total_revenue / 7)
            }
            
        except Exception as e:
            logger.error(f"Failed to get weekly order stats: {e}")
            return {}
    
    @staticmethod
    def create_daily_summary_notification(shop_owner, target_date=None):
        """
        Create a daily summary notification for shop owner
        """
        if target_date is None:
            target_date = timezone.now().date()
        
        try:
            stats = ShopOwnerNotificationManager.get_daily_order_stats(shop_owner, target_date)
            
            if stats['total_orders'] > 0:
                notification_text = f"Daily Summary for {target_date.strftime('%B %d, %Y')}: {stats['total_orders']} orders, ${stats['total_revenue']:.2f} revenue"
                
                Notification.objects.create(
                    user=shop_owner,
                    text=notification_text,
                    type='daily_summary',
                    data=json.dumps(stats, default=json_serializer)
                )
                
                logger.info(f"Created daily summary notification for shop owner {shop_owner.id}")
            
        except Exception as e:
            logger.error(f"Failed to create daily summary notification: {e}")

    def notify_low_stock(self, product, threshold=5):
        """
        Create notification for low stock product
        """
        try:
            if product.quantity <= threshold:
                # Get shop owners for this product
                shops = product.shops.all()
                
                for shop in shops:
                    notification_text = f"Low Stock Alert: {product.name} has only {product.quantity} units remaining"
                    
                    Notification.objects.create(
                        user=shop.shopowner,
                        text=notification_text,
                        type='product_low_stock',
                        product=product,
                        shop=shop,
                        data=json.dumps({
                            'product_id': str(product.productId),
                            'product_name': product.name,
                            'current_stock': product.quantity,
                            'threshold': threshold,
                            'shop_id': str(shop.shopId),
                            'shop_name': shop.name
                        }, default=json_serializer)
                    )
                    
                    logger.info(f"Created low stock notification for product {product.productId} in shop {shop.shopId}")
                    
        except Exception as e:
            logger.error(f"Failed to create low stock notification: {e}")

    def notify_out_of_stock(self, product):
        """
        Create notification for out of stock product
        """
        try:
            if product.quantity == 0:
                # Get shop owners for this product
                shops = product.shops.all()
                
                for shop in shops:
                    notification_text = f"Out of Stock Alert: {product.name} is now out of stock"
                    
                    Notification.objects.create(
                        user=shop.shopowner,
                        text=notification_text,
                        type='product_out_of_stock',
                        product=product,
                        shop=shop,
                        data=json.dumps({
                            'product_id': str(product.productId),
                            'product_name': product.name,
                            'current_stock': product.quantity,
                            'shop_id': str(shop.shopId),
                            'shop_name': shop.name
                        }, default=json_serializer)
                    )
                    
                    logger.info(f"Created out of stock notification for product {product.productId} in shop {shop.shopId}")
                    
        except Exception as e:
            logger.error(f"Failed to create out of stock notification: {e}")

class OrderNotificationEnhancer:
    """
    Enhances order-related notifications with more detailed information
    """
    
    @staticmethod
    def enhance_order_creation_notification(order):
        """
        Create comprehensive notification when order is created
        """
        # Create main order notification
        ShopOwnerNotificationManager.create_order_notification(order, 'new_order_received')
        
        # Create product-specific notifications
        ShopOwnerNotificationManager.create_product_ordered_notification(order)
        
        # Check for low stock and create alerts
        OrderNotificationEnhancer.check_and_create_stock_alerts(order)
    
    @staticmethod
    def check_and_create_stock_alerts(order):
        """
        Check if any ordered products are now low in stock and create alerts
        """
        try:
            for item in order.items.all():
                product = item.product
                
                # Check if product is now out of stock
                if product.quantity <= 0:
                    Notification.objects.create(
                        user=order.shop.shopowner,
                        text=f"Product '{product.name}' is now OUT OF STOCK after order #{order.id}",
                        type='product_out_of_stock',
                        product=product,
                        shop=order.shop,
                        order=order,
                        data=json.dumps({
                            'product_id': str(product.productId),
                            'product_name': product.name,
                            'remaining_quantity': product.quantity,
                            'order_id': str(order.id)
                        }, default=json_serializer)
                    )
                
                # Check if product is low in stock (less than 10)
                elif product.quantity <= 10:
                    Notification.objects.create(
                        user=order.shop.shopowner,
                        text=f"Product '{product.name}' is LOW IN STOCK: {product.quantity} remaining",
                        type='product_low_stock',
                        product=product,
                        shop=order.shop,
                        order=order,
                        data=json.dumps({
                            'product_id': str(product.productId),
                            'product_name': product.name,
                            'remaining_quantity': product.quantity,
                            'order_id': str(order.id),
                            'threshold': 10
                        }, default=json_serializer)
                    )
            
        except Exception as e:
            logger.error(f"Failed to create stock alerts for order {order.id}: {e}")

# Utility functions for easy integration
def notify_shop_owner_new_order(order):
    """
    Convenience function to create all notifications for a new order
    """
    OrderNotificationEnhancer.enhance_order_creation_notification(order)

def get_shop_owner_daily_stats(shop_owner, date_str=None):
    """
    Convenience function to get daily statistics
    """
    target_date = None
    if date_str:
        try:
            from datetime import datetime
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            pass
    
    return ShopOwnerNotificationManager.get_daily_order_stats(shop_owner, target_date)

def create_daily_summary_for_shop_owner(shop_owner, date_str=None):
    """
    Convenience function to create daily summary notification
    """
    target_date = None
    if date_str:
        try:
            from datetime import datetime
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            pass
    
    ShopOwnerNotificationManager.create_daily_summary_notification(shop_owner, target_date)
