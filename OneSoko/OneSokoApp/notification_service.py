from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import datetime, timedelta
import logging
import requests
import json
from typing import Dict, List, Optional
from celery import shared_task

from .notification_models import (
    NotificationTemplate, RealTimeNotification, NotificationPreference,
    NotificationQueue, NotificationAnalytics
)
from .models import Shop, Order, CustomerLoyalty

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for creating and sending notifications"""
    
    @staticmethod
    def create_notification(
        recipient_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Dict = None,
        action_url: str = None,
        priority: str = 'medium',
        expires_at: datetime = None,
        delivery_methods: List[str] = None
    ) -> RealTimeNotification:
        """Create a new notification"""
        
        notification = RealTimeNotification.objects.create(
            recipient_id=recipient_id,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            data=data or {},
            action_url=action_url,
            expires_at=expires_at,
        )
        
        # Queue for delivery
        if delivery_methods:
            NotificationService.queue_for_delivery(notification, delivery_methods)
        else:
            # Use default delivery methods based on user preferences
            NotificationService.queue_for_delivery(notification, ['in_app'])
        
        return notification
    
    @staticmethod
    def queue_for_delivery(notification: RealTimeNotification, delivery_methods: List[str]):
        """Queue notification for delivery via specified methods"""
        
        # Get user preferences
        try:
            preferences = notification.recipient.notification_preferences
        except NotificationPreference.DoesNotExist:
            # Create default preferences
            preferences = NotificationPreference.objects.create(
                user=notification.recipient
            )
        
        for method in delivery_methods:
            # Check if user wants this type of notification via this method
            if preferences.should_receive_notification(notification.notification_type, method):
                
                # Determine scheduling based on preferences
                scheduled_for = timezone.now()
                batch_type = 'immediate'
                
                if method == 'email' and preferences.email_frequency != 'immediate':
                    batch_type = preferences.email_frequency
                    scheduled_for = NotificationService._calculate_batch_time(preferences.email_frequency)
                
                # Create queue entry
                NotificationQueue.objects.create(
                    notification=notification,
                    delivery_method=method,
                    batch_type=batch_type,
                    scheduled_for=scheduled_for,
                )
    
    @staticmethod
    def _calculate_batch_time(frequency: str) -> datetime:
        """Calculate when to send batched notifications"""
        now = timezone.now()
        
        if frequency == 'hourly':
            # Next hour
            return now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        elif frequency == 'daily':
            # Next day at 9 AM
            next_day = now.date() + timedelta(days=1)
            return timezone.make_aware(datetime.combine(next_day, datetime.min.time().replace(hour=9)))
        elif frequency == 'weekly':
            # Next Monday at 9 AM
            days_ahead = 7 - now.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            next_monday = now.date() + timedelta(days=days_ahead)
            return timezone.make_aware(datetime.combine(next_monday, datetime.min.time().replace(hour=9)))
        
        return now
    
    @staticmethod
    def send_in_app_notification(notification: RealTimeNotification) -> bool:
        """Send in-app notification (just mark as sent since it's already in DB)"""
        try:
            notification.status = 'sent'
            notification.delivery_methods_used.append('in_app')
            notification.save(update_fields=['status', 'delivery_methods_used', 'updated_at'])
            return True
        except Exception as e:
            logger.error(f"Failed to send in-app notification {notification.id}: {str(e)}")
            return False
    
    @staticmethod
    def send_email_notification(notification: RealTimeNotification) -> bool:
        """Send email notification"""
        try:
            recipient_email = notification.recipient.email
            if not recipient_email:
                logger.warning(f"No email address for user {notification.recipient.id}")
                return False
            
            # Render email content
            context = {
                'notification': notification,
                'user': notification.recipient,
                'action_url': notification.action_url,
                'data': notification.data,
            }
            
            html_content = render_to_string('notifications/email_notification.html', context)
            text_content = render_to_string('notifications/email_notification.txt', context)
            
            send_mail(
                subject=notification.title,
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                html_message=html_content,
                fail_silently=False,
            )
            
            notification.status = 'sent'
            notification.delivery_methods_used.append('email')
            notification.save(update_fields=['status', 'delivery_methods_used', 'updated_at'])
            
            logger.info(f"Email notification sent to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email notification {notification.id}: {str(e)}")
            return False
    
    @staticmethod
    def send_push_notification(notification: RealTimeNotification) -> bool:
        """Send push notification"""
        try:
            preferences = notification.recipient.notification_preferences
            if not preferences.push_token:
                logger.warning(f"No push token for user {notification.recipient.id}")
                return False
            
            # Implementation depends on your push service (FCM, APNS, etc.)
            # This is a placeholder for Firebase Cloud Messaging
            
            payload = {
                'to': preferences.push_token,
                'notification': {
                    'title': notification.title,
                    'body': notification.text,
                },
                'data': {
                    'notification_id': str(notification.id),
                    'action_url': notification.action_url or '',
                    'type': notification.notification_type,
                    **notification.data
                }
            }
            
            # Send to FCM (placeholder - replace with actual FCM key)
            # response = requests.post(
            #     'https://fcm.googleapis.com/fcm/send',
            #     headers={
            #         'Authorization': f'key={settings.FCM_SERVER_KEY}',
            #         'Content-Type': 'application/json',
            #     },
            #     json=payload
            # )
            
            notification.status = 'sent'
            notification.delivery_methods_used.append('push')
            notification.save(update_fields=['status', 'delivery_methods_used', 'updated_at'])
            
            logger.info(f"Push notification sent to user {notification.recipient.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send push notification {notification.id}: {str(e)}")
            return False


class NotificationTriggers:
    """Predefined notification triggers for common events"""
    
    @staticmethod
    def order_status_updated(order_id: int, old_status: str, new_status: str):
        """Trigger notification when order status changes"""
        try:
            from .models import Order
            order = Order.objects.get(id=order_id)
            
            # Create notification for customer
            title = f"Order #{order.id} Status Update"
            
            status_messages = {
                'processing': "Your order is being prepared",
                'shipped': "Your order has been shipped",
                'out_for_delivery': "Your order is out for delivery",
                'delivered': "Your order has been delivered",
                'cancelled': "Your order has been cancelled",
                'returned': "Your order has been returned",
            }
            
            message = status_messages.get(new_status, f"Your order status has been updated to {new_status}")
            
            NotificationService.create_notification(
                recipient_id=order.user.id,
                notification_type='order_status',
                title=title,
                message=message,
                data={
                    'order_id': order.id,
                    'old_status': old_status,
                    'new_status': new_status,
                    'order_total': str(order.total_amount),
                },
                action_url=f'/customer/orders/{order.id}/track',
                delivery_methods=['in_app', 'email', 'push']
            )
            
        except Exception as e:
            logger.error(f"Failed to trigger order status notification: {str(e)}")
    
    @staticmethod
    def loyalty_points_earned(customer_loyalty_id: int, points_earned: int, order_id: int = None):
        """Trigger notification when customer earns loyalty points"""
        try:
            loyalty = CustomerLoyalty.objects.get(id=customer_loyalty_id)
            
            title = f"You earned {points_earned} points!"
            message = f"Congratulations! You earned {points_earned} loyalty points from {loyalty.shop.name}"
            
            if order_id:
                message += f" for your recent purchase"
            
            NotificationService.create_notification(
                recipient_id=loyalty.customer.id,
                notification_type='loyalty_points',
                title=title,
                message=message,
                data={
                    'points_earned': points_earned,
                    'shop_id': loyalty.shop.id,
                    'shop_name': loyalty.shop.name,
                    'current_balance': loyalty.current_points_balance,
                    'order_id': order_id,
                },
                action_url=f'/loyalty?shop_id={loyalty.shop.id}',
                delivery_methods=['in_app', 'push']
            )
            
        except Exception as e:
            logger.error(f"Failed to trigger loyalty points notification: {str(e)}")
    
    @staticmethod
    def loyalty_tier_upgraded(customer_loyalty_id: int, old_tier: str, new_tier: str):
        """Trigger notification when customer's loyalty tier is upgraded"""
        try:
            loyalty = CustomerLoyalty.objects.get(id=customer_loyalty_id)
            
            title = f"🎉 Tier Upgrade - Welcome to {new_tier.title()}!"
            message = f"Congratulations! You've been upgraded to {new_tier.title()} tier at {loyalty.shop.name}. Enjoy your new benefits!"
            
            NotificationService.create_notification(
                recipient_id=loyalty.customer.id,
                notification_type='loyalty_tier',
                title=title,
                message=message,
                data={
                    'shop_id': loyalty.shop.id,
                    'shop_name': loyalty.shop.name,
                    'old_tier': old_tier,
                    'new_tier': new_tier,
                    'annual_spending': str(loyalty.annual_spending),
                },
                action_url=f'/loyalty?shop_id={loyalty.shop.id}',
                priority='high',
                delivery_methods=['in_app', 'email', 'push']
            )
            
        except Exception as e:
            logger.error(f"Failed to trigger tier upgrade notification: {str(e)}")
    
    @staticmethod
    def reward_redeemed(redemption_id: int):
        """Trigger notification when customer redeems a reward"""
        try:
            from .models import LoyaltyRedemption
            redemption = LoyaltyRedemption.objects.get(id=redemption_id)
            
            title = f"Reward Redeemed - {redemption.reward.name}"
            message = f"Your reward '{redemption.reward.name}' has been redeemed successfully!"
            
            NotificationService.create_notification(
                recipient_id=redemption.customer_loyalty.customer.id,
                notification_type='reward_redeemed',
                title=title,
                message=message,
                data={
                    'reward_name': redemption.reward.name,
                    'redemption_code': redemption.redemption_code,
                    'points_used': redemption.points_used,
                    'expires_at': redemption.expires_at.isoformat() if redemption.expires_at else None,
                    'shop_name': redemption.customer_loyalty.shop.name,
                },
                action_url=f'/loyalty?shop_id={redemption.customer_loyalty.shop.id}',
                delivery_methods=['in_app', 'email']
            )
            
        except Exception as e:
            logger.error(f"Failed to trigger reward redemption notification: {str(e)}")
    
    @staticmethod
    def low_stock_alert(product_id: int, current_stock: int, threshold: int):
        """Trigger notification for shop owners when product stock is low"""
        try:
            from .models import Product
            product = Product.objects.get(id=product_id)
            
            title = f"Low Stock Alert - {product.name}"
            message = f"Your product '{product.name}' is running low. Current stock: {current_stock} (threshold: {threshold})"
            
            NotificationService.create_notification(
                recipient_id=product.shop.owner.id,
                notification_type='low_stock',
                title=title,
                message=message,
                data={
                    'product_id': product.id,
                    'product_name': product.name,
                    'current_stock': current_stock,
                    'threshold': threshold,
                    'shop_id': product.shop.id,
                },
                action_url=f'/shop/products/{product.id}/edit',
                priority='high',
                delivery_methods=['in_app', 'email']
            )
            
        except Exception as e:
            logger.error(f"Failed to trigger low stock notification: {str(e)}")
    
    @staticmethod
    def new_review_received(review_id: int):
        """Trigger notification when shop receives a new review"""
        try:
            from .models import Review
            review = Review.objects.get(id=review_id)
            
            title = f"New Review - {review.rating}⭐"
            message = f"You received a new {review.rating}-star review for '{review.product.name}'"
            
            NotificationService.create_notification(
                recipient_id=review.product.shop.owner.id,
                notification_type='new_review',
                title=title,
                message=message,
                data={
                    'review_id': review.id,
                    'product_id': review.product.id,
                    'product_name': review.product.name,
                    'rating': review.rating,
                    'reviewer_name': review.user.get_full_name() or review.user.username,
                    'shop_id': review.product.shop.id,
                },
                action_url=f'/shop/products/{review.product.id}?tab=reviews',
                delivery_methods=['in_app', 'email']
            )
            
        except Exception as e:
            logger.error(f"Failed to trigger new review notification: {str(e)}")


# Celery tasks for background notification processing
@shared_task
def process_notification_queue():
    """Process pending notifications in the queue"""
    
    current_time = timezone.now()
    
    # Get pending notifications that are due
    pending_notifications = NotificationQueue.objects.filter(
        status='pending',
        scheduled_for__lte=current_time,
        attempts__lt=models.F('max_attempts')
    ).select_related('notification')
    
    for queue_item in pending_notifications:
        try:
            queue_item.status = 'processing'
            queue_item.attempts += 1
            queue_item.save()
            
            notification = queue_item.notification
            success = False
            
            # Send notification based on delivery method
            if queue_item.delivery_method == 'in_app':
                success = NotificationService.send_in_app_notification(notification)
            elif queue_item.delivery_method == 'email':
                success = NotificationService.send_email_notification(notification)
            elif queue_item.delivery_method == 'push':
                success = NotificationService.send_push_notification(notification)
            
            if success:
                queue_item.status = 'completed'
                queue_item.processed_at = current_time
                notification.status = 'delivered'
                notification.save(update_fields=['status', 'updated_at'])
            else:
                queue_item.status = 'failed' if queue_item.attempts >= queue_item.max_attempts else 'pending'
                queue_item.error_message = f"Delivery failed via {queue_item.delivery_method}"
            
            queue_item.save()
            
        except Exception as e:
            logger.error(f"Error processing notification queue item {queue_item.id}: {str(e)}")
            queue_item.status = 'failed'
            queue_item.error_message = str(e)
            queue_item.save()


@shared_task
def update_notification_analytics():
    """Update daily notification analytics"""
    
    today = timezone.now().date()
    
    # Get unique combinations of notification_type and delivery_method for today
    combinations = NotificationQueue.objects.filter(
        created_at__date=today
    ).values('notification__notification_type', 'delivery_method').distinct()
    
    for combo in combinations:
        notification_type = combo['notification__notification_type']
        delivery_method = combo['delivery_method']
        
        # Get or create analytics record
        analytics, created = NotificationAnalytics.objects.get_or_create(
            date=today,
            notification_type=notification_type,
            delivery_method=delivery_method,
        )
        
        # Calculate metrics
        queue_items = NotificationQueue.objects.filter(
            created_at__date=today,
            notification__notification_type=notification_type,
            delivery_method=delivery_method
        )
        
        analytics.total_sent = queue_items.filter(status__in=['completed', 'failed']).count()
        analytics.total_delivered = queue_items.filter(status='completed').count()
        analytics.total_failed = queue_items.filter(status='failed').count()
        
        # Count read notifications
        read_notifications = RealTimeNotification.objects.filter(
            created_at__date=today,
            notification_type=notification_type,
            is_read=True
        ).count()
        analytics.total_read = read_notifications
        
        # Calculate rates
        analytics.calculate_rates()
        analytics.save()
        
        logger.info(f"Updated analytics for {notification_type} via {delivery_method}")


@shared_task
def cleanup_old_notifications():
    """Clean up old notifications and queue items"""
    
    # Delete old read notifications (older than 90 days)
    ninety_days_ago = timezone.now() - timedelta(days=90)
    deleted_notifications, _ = RealTimeNotification.objects.filter(
        is_read=True,
        read_at__lt=ninety_days_ago
    ).delete()
    
    # Delete old queue items (older than 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    deleted_queue_items, _ = NotificationQueue.objects.filter(
        created_at__lt=thirty_days_ago
    ).delete()
    
    logger.info(f"Cleaned up {deleted_notifications} old notifications and {deleted_queue_items} queue items")
