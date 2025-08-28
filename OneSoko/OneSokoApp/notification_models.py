from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class NotificationTemplate(models.Model):
    """Template for different types of notifications"""
    NOTIFICATION_TYPES = [
        ('order_status', 'Order Status Update'),
        ('loyalty_points', 'Loyalty Points Earned'),
        ('loyalty_tier', 'Loyalty Tier Upgrade'),
        ('reward_available', 'New Reward Available'),
        ('reward_redeemed', 'Reward Redeemed'),
        ('referral_bonus', 'Referral Bonus Earned'),
        ('low_stock', 'Low Stock Alert'),
        ('sales_milestone', 'Sales Milestone Reached'),
        ('new_review', 'New Product Review'),
        ('promotional', 'Promotional Message'),
        ('system', 'System Notification'),
    ]
    
    DELIVERY_METHODS = [
        ('in_app', 'In-App Notification'),
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    delivery_methods = models.JSONField(default=list)  # List of delivery methods
    is_active = models.BooleanField(default=True)
    
    # Targeting options
    target_user_types = models.JSONField(default=list)  # ['customer', 'shop_owner', 'admin']
    target_conditions = models.JSONField(default=dict)  # Conditions for triggering
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.notification_type})"


class RealTimeNotification(models.Model):
    """Individual notifications sent to users"""
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='real_time_notifications')
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, null=True, blank=True)
    
    # Notification content
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50)
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, default='medium')
    
    # Metadata
    data = models.JSONField(default=dict)  # Additional data for the notification
    action_url = models.URLField(blank=True, null=True)  # URL to navigate when clicked
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Delivery tracking
    delivery_methods_used = models.JSONField(default=list)
    delivery_attempts = models.IntegerField(default=0)
    last_delivery_attempt = models.DateTimeField(null=True, blank=True)
    
    # Timing
    scheduled_for = models.DateTimeField(null=True, blank=True)  # For scheduled notifications
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type', 'created_at']),
            models.Index(fields=['status', 'scheduled_for']),
        ]
    
    def __str__(self):
        return f"{self.title} -> {self.recipient.username}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.status = 'read'
            self.save(update_fields=['is_read', 'read_at', 'status', 'updated_at'])
    
    def is_expired(self):
        """Check if notification has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class NotificationPreference(models.Model):
    """User preferences for notification delivery"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_enabled = models.BooleanField(default=True)
    email_frequency = models.CharField(
        max_length=20,
        choices=[
            ('immediate', 'Immediate'),
            ('hourly', 'Hourly Digest'),
            ('daily', 'Daily Digest'),
            ('weekly', 'Weekly Digest'),
            ('never', 'Never'),
        ],
        default='immediate'
    )
    
    # SMS preferences
    sms_enabled = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Push notification preferences
    push_enabled = models.BooleanField(default=True)
    push_token = models.TextField(blank=True, null=True)  # Device push token
    
    # In-app notification preferences
    in_app_enabled = models.BooleanField(default=True)
    
    # Notification type preferences
    notification_types_enabled = models.JSONField(default=dict)  # {notification_type: boolean}
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)  # e.g., 22:00
    quiet_hours_end = models.TimeField(null=True, blank=True)    # e.g., 08:00
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.username}"
    
    def is_quiet_hours(self):
        """Check if current time is within quiet hours"""
        if not self.quiet_hours_enabled or not self.quiet_hours_start or not self.quiet_hours_end:
            return False
        
        current_time = timezone.now().time()
        
        # Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if self.quiet_hours_start > self.quiet_hours_end:
            return current_time >= self.quiet_hours_start or current_time <= self.quiet_hours_end
        # Handle same-day quiet hours (e.g., 12:00 to 14:00)
        else:
            return self.quiet_hours_start <= current_time <= self.quiet_hours_end
    
    def should_receive_notification(self, notification_type, delivery_method):
        """Check if user should receive a specific notification"""
        # Check if notification type is enabled
        if notification_type in self.notification_types_enabled:
            if not self.notification_types_enabled[notification_type]:
                return False
        
        # Check delivery method preferences
        if delivery_method == 'email' and not self.email_enabled:
            return False
        elif delivery_method == 'sms' and not self.sms_enabled:
            return False
        elif delivery_method == 'push' and not self.push_enabled:
            return False
        elif delivery_method == 'in_app' and not self.in_app_enabled:
            return False
        
        # Check quiet hours for non-urgent notifications
        if delivery_method in ['push', 'sms'] and self.is_quiet_hours():
            return False
        
        return True


class NotificationQueue(models.Model):
    """Queue for batch processing notifications"""
    BATCH_TYPES = [
        ('immediate', 'Immediate Delivery'),
        ('hourly', 'Hourly Batch'),
        ('daily', 'Daily Batch'),
        ('weekly', 'Weekly Batch'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification = models.ForeignKey(RealTimeNotification, on_delete=models.CASCADE)
    batch_type = models.CharField(max_length=20, choices=BATCH_TYPES, default='immediate')
    delivery_method = models.CharField(max_length=20)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    scheduled_for = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=3)
    
    error_message = models.TextField(blank=True, null=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['scheduled_for']
        indexes = [
            models.Index(fields=['status', 'scheduled_for']),
            models.Index(fields=['delivery_method', 'batch_type']),
        ]
    
    def __str__(self):
        return f"Queue: {self.notification.title} via {self.delivery_method}"


class NotificationAnalytics(models.Model):
    """Analytics data for notification performance"""
    date = models.DateField()
    notification_type = models.CharField(max_length=50)
    delivery_method = models.CharField(max_length=20)
    
    # Metrics
    total_sent = models.IntegerField(default=0)
    total_delivered = models.IntegerField(default=0)
    total_read = models.IntegerField(default=0)
    total_clicked = models.IntegerField(default=0)
    total_failed = models.IntegerField(default=0)
    
    # Calculated rates
    delivery_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # delivered/sent
    read_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)      # read/delivered
    click_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)     # clicked/read
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['date', 'notification_type', 'delivery_method']
        ordering = ['-date']
    
    def calculate_rates(self):
        """Calculate delivery, read, and click rates"""
        if self.total_sent > 0:
            self.delivery_rate = (self.total_delivered / self.total_sent) * 100
        
        if self.total_delivered > 0:
            self.read_rate = (self.total_read / self.total_delivered) * 100
        
        if self.total_read > 0:
            self.click_rate = (self.total_clicked / self.total_read) * 100
        
        self.save(update_fields=['delivery_rate', 'read_rate', 'click_rate', 'updated_at'])
