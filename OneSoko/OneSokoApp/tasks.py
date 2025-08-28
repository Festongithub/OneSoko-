"""
Celery Tasks for OneSoko Application

This module contains asynchronous tasks for the OneSoko application.
To use Celery in production, install it with:
    pip install celery redis django-celery-beat django-celery-results

For development without Celery, tasks will run synchronously.
"""

import importlib.util
import importlib

# Check if Celery is available and import dynamically
CELERY_AVAILABLE = importlib.util.find_spec("celery") is not None

if CELERY_AVAILABLE:
    celery_module = importlib.import_module("celery")
    shared_task = celery_module.shared_task
else:
    # Celery not installed - create a dummy decorator for development
    def shared_task(*args, **kwargs):
        def decorator(func):
            return func
        return decorator

from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from .models import Order, Product, UserProfile, EmailSubscription
import logging
import time
from PIL import Image
import io
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

@shared_task(bind=True, retry_backoff=True, max_retries=3)
def send_email_notification(self, subject, message, recipient_list, html_message=None):
    """
    Send email notifications asynchronously
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False
        )
        logger.info(f"Email sent successfully to {recipient_list}")
        return f"Email sent to {len(recipient_list)} recipients"
    except Exception as exc:
        logger.error(f"Email sending failed: {exc}")
        raise self.retry(exc=exc, countdown=60)

@shared_task(bind=True, retry_backoff=True, max_retries=3)
def process_order_payment(self, order_id):
    """
    Process payment for an order asynchronously
    """
    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(id=order_id)
            
            # Simulate payment processing
            time.sleep(2)  # Replace with actual payment gateway call
            
            # Update order status
            order.status = 'paid'
            order.save()
            
            # Update product inventory
            for item in order.orderitem_set.all():
                product = item.product
                if product.stock_quantity >= item.quantity:
                    product.stock_quantity -= item.quantity
                    product.save()
                else:
                    raise ValueError(f"Insufficient stock for {product.name}")
            
            # Send confirmation email
            send_email_notification.delay(
                subject='Order Confirmation',
                message=f'Your order #{order.id} has been confirmed.',
                recipient_list=[order.user.email]
            )
            
            logger.info(f"Order {order_id} processed successfully")
            return f"Order {order_id} processed"
            
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found")
        return f"Order {order_id} not found"
    except Exception as exc:
        logger.error(f"Payment processing failed for order {order_id}: {exc}")
        raise self.retry(exc=exc, countdown=120)

@shared_task
def optimize_product_images(product_id):
    """
    Optimize product images for better performance
    """
    try:
        product = Product.objects.get(id=product_id)
        
        if product.image:
            # Open and optimize image
            img = Image.open(product.image.path)
            
            # Resize if too large
            if img.width > 1200 or img.height > 1200:
                img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Save optimized image
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)
            
            # Update product image
            product.image.save(
                product.image.name,
                ContentFile(output.read()),
                save=True
            )
            
        logger.info(f"Images optimized for product {product_id}")
        return f"Product {product_id} images optimized"
        
    except Product.DoesNotExist:
        logger.error(f"Product {product_id} not found")
        return f"Product {product_id} not found"
    except Exception as exc:
        logger.error(f"Image optimization failed for product {product_id}: {exc}")
        return f"Image optimization failed: {exc}"

@shared_task
def generate_analytics_report():
    """
    Generate analytics reports periodically
    """
    try:
        from django.db.models import Count, Sum, Avg
        from datetime import datetime, timedelta
        
        # Calculate metrics for the last 7 days
        week_ago = datetime.now() - timedelta(days=7)
        
        metrics = {
            'total_orders': Order.objects.filter(created_at__gte=week_ago).count(),
            'total_revenue': Order.objects.filter(
                created_at__gte=week_ago,
                status='paid'
            ).aggregate(total=Sum('total_amount'))['total'] or 0,
            'avg_order_value': Order.objects.filter(
                created_at__gte=week_ago,
                status='paid'
            ).aggregate(avg=Avg('total_amount'))['avg'] or 0,
            'new_customers': UserProfile.objects.filter(
                user__date_joined__gte=week_ago
            ).count(),
        }
        
        # Send report to administrators
        report_message = f"""
        Weekly Analytics Report:
        - Total Orders: {metrics['total_orders']}
        - Total Revenue: ${metrics['total_revenue']:.2f}
        - Average Order Value: ${metrics['avg_order_value']:.2f}
        - New Customers: {metrics['new_customers']}
        """
        
        # Email to admin
        admin_emails = ['admin@onesoko.com']  # Replace with actual admin emails
        send_email_notification.delay(
            subject='Weekly Analytics Report',
            message=report_message,
            recipient_list=admin_emails
        )
        
        logger.info("Analytics report generated successfully")
        return "Analytics report generated"
        
    except Exception as exc:
        logger.error(f"Analytics report generation failed: {exc}")
        return f"Report generation failed: {exc}"

@shared_task
def send_promotional_emails():
    """
    Send promotional emails to subscribers
    """
    try:
        subscribers = EmailSubscription.objects.filter(is_active=True)
        
        for subscriber in subscribers.iterator(chunk_size=100):
            send_email_notification.delay(
                subject='New Products Available!',
                message='Check out our latest products and deals.',
                recipient_list=[subscriber.email],
                html_message='<h1>New Products Available!</h1><p>Check out our latest products and deals.</p>'
            )
            
        logger.info(f"Promotional emails sent to {subscribers.count()} subscribers")
        return f"Promotional emails sent to {subscribers.count()} subscribers"
        
    except Exception as exc:
        logger.error(f"Promotional email sending failed: {exc}")
        return f"Promotional email sending failed: {exc}"

@shared_task
def cleanup_expired_sessions():
    """
    Clean up expired sessions and temporary data
    """
    try:
        from django.core.management import call_command
        
        # Clean expired sessions
        call_command('clearsessions')
        
        # Clean up old notifications (older than 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        from .models import Notification
        deleted_count = Notification.objects.filter(
            created_at__lt=thirty_days_ago,
            is_read=True
        ).delete()[0]
        
        logger.info(f"Cleanup completed: {deleted_count} old notifications removed")
        return f"Cleanup completed: {deleted_count} items removed"
        
    except Exception as exc:
        logger.error(f"Cleanup task failed: {exc}")
        return f"Cleanup failed: {exc}"
