from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django.contrib.auth.models import User

from .notification_models import (
    NotificationTemplate, RealTimeNotification, NotificationPreference,
    NotificationQueue, NotificationAnalytics
)
from .permissions import IsShopOwnerOrReadOnly


class RealTimeNotificationViewSet(viewsets.ViewSet):
    """Real-time notification management"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_notifications(self, request):
        """Get user's notifications with pagination and filtering"""
        user = request.user
        
        # Query parameters
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
        notification_type = request.query_params.get('type')
        
        # Build queryset
        notifications = RealTimeNotification.objects.filter(recipient=user)
        
        if unread_only:
            notifications = notifications.filter(is_read=False)
        
        if notification_type:
            notifications = notifications.filter(notification_type=notification_type)
        
        # Filter out expired notifications
        notifications = notifications.filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        )
        
        # Pagination
        total_count = notifications.count()
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        notifications = notifications[start_idx:end_idx]
        
        # Serialize notifications
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.text,
                'notification_type': notification.notification_type,
                'priority': notification.priority,
                'is_read': notification.is_read,
                'read_at': notification.read_at,
                'action_url': notification.action_url,
                'data': notification.data,
                'created_at': notification.created_at,
                'expires_at': notification.expires_at,
            })
        
        # Get unread count
        unread_count = RealTimeNotification.objects.filter(
            recipient=user, 
            is_read=False
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        ).count()
        
        return Response({
            'notifications': notifications_data,
            'total_count': total_count,
            'unread_count': unread_count,
            'page': page,
            'page_size': page_size,
            'has_next': end_idx < total_count,
            'has_previous': page > 1,
        })

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a specific notification as read"""
        try:
            notification = RealTimeNotification.objects.get(
                id=pk, 
                recipient=request.user
            )
            notification.mark_as_read()
            return Response({'message': 'Notification marked as read'})
        except RealTimeNotification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the user"""
        user = request.user
        
        # Update all unread notifications
        updated_count = RealTimeNotification.objects.filter(
            recipient=user, 
            is_read=False
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        ).update(
            is_read=True,
            read_at=timezone.now(),
            status='read',
            updated_at=timezone.now()
        )
        
        return Response({
            'message': f'{updated_count} notifications marked as read'
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get notification summary statistics"""
        user = request.user
        
        # Get counts by type
        type_counts = RealTimeNotification.objects.filter(
            recipient=user
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        ).values('notification_type').annotate(
            total=Count('id'),
            unread=Count('id', filter=Q(is_read=False))
        ).order_by('notification_type')
        
        # Get recent activity (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_count = RealTimeNotification.objects.filter(
            recipient=user,
            created_at__gte=seven_days_ago
        ).count()
        
        # Priority breakdown of unread notifications
        priority_counts = RealTimeNotification.objects.filter(
            recipient=user,
            is_read=False
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        ).values('priority').annotate(count=Count('id')).order_by('priority')
        
        return Response({
            'type_counts': list(type_counts),
            'recent_count': recent_count,
            'priority_counts': list(priority_counts),
        })

    @action(detail=False, methods=['delete'])
    def clear_read(self, request):
        """Clear all read notifications older than 30 days"""
        user = request.user
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        deleted_count, _ = RealTimeNotification.objects.filter(
            recipient=user,
            is_read=True,
            read_at__lt=thirty_days_ago
        ).delete()
        
        return Response({
            'message': f'{deleted_count} old notifications cleared'
        })


class NotificationPreferenceViewSet(viewsets.ViewSet):
    """User notification preferences management"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'post', 'put'])
    def my_preferences(self, request):
        """Get or update user's notification preferences"""
        user = request.user
        
        # Get or create preferences
        preferences, created = NotificationPreference.objects.get_or_create(
            user=user,
            defaults={
                'notification_types_enabled': {
                    'order_status': True,
                    'loyalty_points': True,
                    'loyalty_tier': True,
                    'reward_available': True,
                    'reward_redeemed': True,
                    'referral_bonus': True,
                    'low_stock': True,
                    'sales_milestone': True,
                    'new_review': True,
                    'promotional': False,
                    'system': True,
                }
            }
        )
        
        if request.method == 'GET':
            return Response({
                'email_enabled': preferences.email_enabled,
                'email_frequency': preferences.email_frequency,
                'sms_enabled': preferences.sms_enabled,
                'phone_number': preferences.phone_number,
                'push_enabled': preferences.push_enabled,
                'in_app_enabled': preferences.in_app_enabled,
                'notification_types_enabled': preferences.notification_types_enabled,
                'quiet_hours_enabled': preferences.quiet_hours_enabled,
                'quiet_hours_start': preferences.quiet_hours_start,
                'quiet_hours_end': preferences.quiet_hours_end,
            })
        
        elif request.method in ['POST', 'PUT']:
            data = request.data
            
            # Update preferences
            preferences.email_enabled = data.get('email_enabled', preferences.email_enabled)
            preferences.email_frequency = data.get('email_frequency', preferences.email_frequency)
            preferences.sms_enabled = data.get('sms_enabled', preferences.sms_enabled)
            preferences.phone_number = data.get('phone_number', preferences.phone_number)
            preferences.push_enabled = data.get('push_enabled', preferences.push_enabled)
            preferences.in_app_enabled = data.get('in_app_enabled', preferences.in_app_enabled)
            
            if 'notification_types_enabled' in data:
                preferences.notification_types_enabled.update(data['notification_types_enabled'])
            
            preferences.quiet_hours_enabled = data.get('quiet_hours_enabled', preferences.quiet_hours_enabled)
            preferences.quiet_hours_start = data.get('quiet_hours_start', preferences.quiet_hours_start)
            preferences.quiet_hours_end = data.get('quiet_hours_end', preferences.quiet_hours_end)
            
            preferences.save()
            
            return Response({'message': 'Preferences updated successfully'})


class NotificationAnalyticsViewSet(viewsets.ViewSet):
    """Notification analytics for shop owners and admins"""
    permission_classes = [IsAuthenticated, IsShopOwnerOrReadOnly]

    @action(detail=False, methods=['get'])
    def performance_metrics(self, request):
        """Get notification performance metrics"""
        # Date range
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        
        # Overall metrics
        analytics = NotificationAnalytics.objects.filter(
            date__gte=start_date
        ).aggregate(
            total_sent=models.Sum('total_sent'),
            total_delivered=models.Sum('total_delivered'),
            total_read=models.Sum('total_read'),
            total_clicked=models.Sum('total_clicked'),
            total_failed=models.Sum('total_failed'),
            avg_delivery_rate=Avg('delivery_rate'),
            avg_read_rate=Avg('read_rate'),
            avg_click_rate=Avg('click_rate'),
        )
        
        # Performance by type
        type_performance = NotificationAnalytics.objects.filter(
            date__gte=start_date
        ).values('notification_type').annotate(
            total_sent=models.Sum('total_sent'),
            total_delivered=models.Sum('total_delivered'),
            total_read=models.Sum('total_read'),
            avg_delivery_rate=Avg('delivery_rate'),
            avg_read_rate=Avg('read_rate'),
        ).order_by('-total_sent')
        
        # Performance by delivery method
        method_performance = NotificationAnalytics.objects.filter(
            date__gte=start_date
        ).values('delivery_method').annotate(
            total_sent=models.Sum('total_sent'),
            total_delivered=models.Sum('total_delivered'),
            total_read=models.Sum('total_read'),
            avg_delivery_rate=Avg('delivery_rate'),
            avg_read_rate=Avg('read_rate'),
        ).order_by('-total_sent')
        
        # Daily trends
        daily_trends = NotificationAnalytics.objects.filter(
            date__gte=start_date
        ).values('date').annotate(
            total_sent=models.Sum('total_sent'),
            total_delivered=models.Sum('total_delivered'),
            total_read=models.Sum('total_read'),
        ).order_by('date')
        
        return Response({
            'overall_metrics': analytics,
            'type_performance': list(type_performance),
            'method_performance': list(method_performance),
            'daily_trends': list(daily_trends),
        })

    @action(detail=False, methods=['get'])
    def engagement_insights(self, request):
        """Get user engagement insights"""
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Active users (users who have read notifications)
        active_users = RealTimeNotification.objects.filter(
            created_at__gte=start_date,
            is_read=True
        ).values('recipient').distinct().count()
        
        # Top notification types by engagement
        top_types = RealTimeNotification.objects.filter(
            created_at__gte=start_date
        ).values('notification_type').annotate(
            total_count=Count('id'),
            read_count=Count('id', filter=Q(is_read=True)),
            engagement_rate=Avg(
                models.Case(
                    models.When(is_read=True, then=1.0),
                    default=0.0,
                    output_field=models.FloatField()
                )
            ) * 100
        ).order_by('-engagement_rate')
        
        # User response time analysis
        response_times = RealTimeNotification.objects.filter(
            created_at__gte=start_date,
            is_read=True,
            read_at__isnull=False
        ).extra(
            select={
                'response_time_minutes': "(EXTRACT(EPOCH FROM read_at) - EXTRACT(EPOCH FROM created_at)) / 60"
            }
        ).aggregate(
            avg_response_time=Avg('response_time_minutes'),
            min_response_time=models.Min('response_time_minutes'),
            max_response_time=models.Max('response_time_minutes'),
        )
        
        return Response({
            'active_users': active_users,
            'top_notification_types': list(top_types),
            'response_time_analysis': response_times,
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification(request):
    """Send a custom notification (for testing or admin use)"""
    data = request.data
    
    # Validate required fields
    required_fields = ['recipient_id', 'title', 'message', 'notification_type']
    for field in required_fields:
        if field not in data:
            return Response(
                {'error': f'{field} is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    try:
        recipient = User.objects.get(id=data['recipient_id'])
    except User.DoesNotExist:
        return Response(
            {'error': 'Recipient not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create notification
    notification = RealTimeNotification.objects.create(
        recipient=recipient,
        title=data['title'],
        message=data['message'],
        notification_type=data['notification_type'],
        priority=data.get('priority', 'medium'),
        data=data.get('data', {}),
        action_url=data.get('action_url'),
        expires_at=data.get('expires_at'),
    )
    
    return Response({
        'message': 'Notification sent successfully',
        'notification_id': str(notification.id)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_health_check(request):
    """Health check endpoint for notification system"""
    
    # Check queue status
    pending_count = NotificationQueue.objects.filter(status='pending').count()
    failed_count = NotificationQueue.objects.filter(status='failed').count()
    
    # Check recent delivery performance
    today = timezone.now().date()
    today_analytics = NotificationAnalytics.objects.filter(date=today).aggregate(
        total_sent=models.Sum('total_sent'),
        total_failed=models.Sum('total_failed'),
    )
    
    # Calculate health score
    health_score = 100
    if pending_count > 1000:
        health_score -= 20
    if failed_count > 100:
        health_score -= 30
    if today_analytics['total_failed'] and today_analytics['total_sent']:
        failure_rate = (today_analytics['total_failed'] / today_analytics['total_sent']) * 100
        if failure_rate > 10:
            health_score -= 25
    
    health_status = 'healthy' if health_score >= 80 else 'degraded' if health_score >= 60 else 'unhealthy'
    
    return Response({
        'status': health_status,
        'health_score': health_score,
        'pending_notifications': pending_count,
        'failed_notifications': failed_count,
        'today_sent': today_analytics['total_sent'] or 0,
        'today_failed': today_analytics['total_failed'] or 0,
        'timestamp': timezone.now(),
    })
