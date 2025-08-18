from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Shop, Order, Review, Notification, OrderItem


@receiver(post_save, sender=Shop)
def create_shop_notification(sender, instance, created, **kwargs):
    """
    Create a notification when a new shop is created.
    """
    if created:
        Notification.objects.create(
            user=instance.shopowner,
            message=f"🎉 Congratulations! Your shop '{instance.name}' has been successfully created and is now live.",
            type='shop_created',
            priority='high',
            shop=instance
        )


@receiver(post_save, sender=Order)
def create_order_notification(sender, instance, created, **kwargs):
    """
    Create a notification when a new order is placed for a shop.
    """
    if created:
        # Create notification for the shop owner
        Notification.objects.create(
            user=instance.shop.shopowner,
            message=f"📦 New order #{instance.id} received from {instance.user.get_full_name() or instance.user.username} for ${instance.total}",
            type='new_order',
            priority='high',
            shop=instance.shop,
            order=instance
        )


@receiver(post_save, sender=Order)
def create_order_status_notification(sender, instance, created, **kwargs):
    """
    Create a notification when an order status changes.
    """
    if not created:  # Only for updates, not new orders
        status_messages = {
            'paid': f"💰 Order #{instance.id} has been paid by {instance.user.get_full_name() or instance.user.username}",
            'shipped': f"🚚 Order #{instance.id} has been marked as shipped",
            'delivered': f"✅ Order #{instance.id} has been delivered successfully",
            'cancelled': f"❌ Order #{instance.id} has been cancelled"
        }
        
        priority_map = {
            'paid': 'high',
            'shipped': 'medium',
            'delivered': 'medium',
            'cancelled': 'high'
        }
        
        if instance.status in status_messages:
            Notification.objects.create(
                user=instance.shop.shopowner,
                message=status_messages[instance.status],
                type='order_status_update',
                priority=priority_map.get(instance.status, 'medium'),
                shop=instance.shop,
                order=instance
            )


@receiver(post_save, sender=Review)
def create_review_notification(sender, instance, created, **kwargs):
    """
    Create a notification when a new review is posted for a product.
    """
    if created:
        # Get the shop owner for the product
        product_shops = instance.product.shops.all()
        
        # Determine priority based on rating
        priority = 'high' if instance.rating <= 2 else 'medium' if instance.rating == 3 else 'low'
        
        for shop in product_shops:
            rating_emoji = "⭐" * instance.rating
            Notification.objects.create(
                user=shop.shopowner,
                message=f"📝 New {instance.rating}-star review for '{instance.product.name}' from {instance.user.get_full_name() or instance.user.username}: {rating_emoji}",
                type='new_review',
                priority=priority,
                shop=shop,
                product=instance.product
            )


@receiver(post_save, sender=OrderItem)
def create_low_stock_notification(sender, instance, created, **kwargs):
    """
    Create a notification when a product is running low on stock after an order.
    """
    if created:
        product = instance.product
        # Check if product quantity is low (less than 5 items)
        if product.quantity <= 5 and product.quantity > 0:
            # Get all shops selling this product
            product_shops = product.shops.all()
            
            for shop in product_shops:
                # Check if notification for this product already exists (to avoid spam)
                existing_notification = Notification.objects.filter(
                    user=shop.shopowner,
                    type='low_stock',
                    product=product,
                    is_read=False
                ).first()
                
                if not existing_notification:
                    Notification.objects.create(
                        user=shop.shopowner,
                        message=f"⚠️ Low stock alert: '{product.name}' has only {product.quantity} items left",
                        type='low_stock',
                        priority='high',
                        shop=shop,
                        product=product
                    )
        
        # Check if product is out of stock
        elif product.quantity == 0:
            product_shops = product.shops.all()
            
            for shop in product_shops:
                # Check if notification for this product already exists
                existing_notification = Notification.objects.filter(
                    user=shop.shopowner,
                    type='out_of_stock',
                    product=product,
                    is_read=False
                ).first()
                
                if not existing_notification:
                    Notification.objects.create(
                        user=shop.shopowner,
                        message=f"🚫 Out of stock: '{product.name}' is now out of stock",
                        type='out_of_stock',
                        priority='urgent',
                        shop=shop,
                        product=product
                    )


# Additional signal for shop performance notifications
@receiver(post_save, sender=Order)
def create_milestone_notifications(sender, instance, created, **kwargs):
    """
    Create milestone notifications for shop achievements.
    """
    if created:
        shop = instance.shop
        
        # Count total orders for this shop
        total_orders = Order.objects.filter(shop=shop).count()
        
        # Milestone notifications
        milestones = [1, 5, 10, 25, 50, 100, 500, 1000]
        
        if total_orders in milestones:
            milestone_messages = {
                1: f"🎊 First order received! Welcome to OneSoko commerce.",
                5: f"🎯 5 orders completed! Your shop is growing.",
                10: f"🔟 10 orders milestone reached! Great progress.",
                25: f"🏆 25 orders achieved! You're building momentum.",
                50: f"🌟 50 orders completed! Excellent work.",
                100: f"💯 100 orders milestone! You're a success story.",
                500: f"🚀 500 orders! Your shop is thriving.",
                1000: f"👑 1000 orders! You're a OneSoko champion!"
            }
            
            Notification.objects.create(
                user=shop.shopowner,
                message=milestone_messages[total_orders],
                type='milestone',
                priority='medium',
                shop=shop
            )
