import json
import time
import hashlib
import hmac
from datetime import datetime, timedelta
from django.db import models, transaction
from django.contrib.auth.models import User
from django.core.cache import cache
from django.conf import settings
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message, Shop, UserProfile
from .permissions import IsMessageParticipant
import logging

logger = logging.getLogger(__name__)

class EnhancedMessageManager:
    """
    Enhanced message manager for better performance and security
    """
    
    def __init__(self):
        self.cache_ttl = 300  # 5 minutes cache
        self.rate_limit_window = 60  # 1 minute
        self.max_messages_per_minute = 20
    
    def create_message(self, sender, recipient, content, message_type='text', **kwargs):
        """
        Create a new message with enhanced security and validation
        """
        # Rate limiting check
        if not self.check_rate_limit(sender):
            raise serializers.ValidationError("Rate limit exceeded. Please wait before sending more messages.")
        
        # Content validation and sanitization
        sanitized_content = self.sanitize_content(content)
        
        # Create message with transaction
        with transaction.atomic():
            message = Message.objects.create(
                sender=sender,
                recipient=recipient,
                content=sanitized_content,
                message_type=message_type,
                **kwargs
            )
            
            # Update conversation cache
            self.update_conversation_cache(sender, recipient, message)
            
            # Create notification for recipient
            self.create_message_notification(message)
            
            return message
    
    def get_conversation(self, user1, user2, limit=50, offset=0):
        """
        Get conversation between two users with caching
        """
        cache_key = f"conversation:{user1.id}:{user2.id}:{limit}:{offset}"
        cached_messages = cache.get(cache_key)
        
        if cached_messages:
            return cached_messages
        
        messages = Message.objects.filter(
            models.Q(sender=user1, recipient=user2) |
            models.Q(sender=user2, recipient=user1)
        ).order_by('-created_at')[offset:offset + limit]
        
        # Cache the result
        cache.set(cache_key, list(messages), self.cache_ttl)
        
        return messages
    
    def get_user_conversations(self, user):
        """
        Get all conversations for a user with last message
        """
        cache_key = f"user_conversations:{user.id}"
        cached_conversations = cache.get(cache_key)
        
        if cached_conversations:
            return cached_conversations
        
        # Get all users this user has conversations with
        conversation_users = User.objects.filter(
            models.Q(sent_messages__recipient=user) |
            models.Q(received_messages__sender=user)
        ).distinct()
        
        conversations = []
        for other_user in conversation_users:
            last_message = Message.objects.filter(
                models.Q(sender=user, recipient=other_user) |
                models.Q(sender=other_user, recipient=user)
            ).order_by('-created_at').first()
            
            unread_count = Message.objects.filter(
                sender=other_user,
                recipient=user,
                is_read=False
            ).count()
            
            conversations.append({
                'user': other_user,
                'last_message': last_message,
                'unread_count': unread_count
            })
        
        # Sort by last message time
        conversations.sort(key=lambda x: x['last_message'].created_at if x['last_message'] else datetime.min, reverse=True)
        
        # Cache the result
        cache.set(cache_key, conversations, self.cache_ttl)
        
        return conversations
    
    def mark_as_read(self, message_id, user):
        """
        Mark message as read with validation
        """
        try:
            message = Message.objects.get(id=message_id)
            
            # Check if user is the recipient
            if message.recipient != user:
                raise PermissionError("You can only mark messages sent to you as read.")
            
            if not message.is_read:
                message.is_read = True
                message.read_at = datetime.now()
                message.save()
                
                # Update cache
                self.invalidate_conversation_cache(message.sender, message.recipient)
                
            return message
        except Message.DoesNotExist:
            raise serializers.ValidationError("Message not found.")
    
    def mark_conversation_as_read(self, other_user, current_user):
        """
        Mark all messages in a conversation as read
        """
        unread_messages = Message.objects.filter(
            sender=other_user,
            recipient=current_user,
            is_read=False
        )
        
        if unread_messages.exists():
            unread_messages.update(
                is_read=True,
                read_at=datetime.now()
            )
            
            # Update cache
            self.invalidate_conversation_cache(other_user, current_user)
    
    def get_unread_count(self, user):
        """
        Get unread message count with caching
        """
        cache_key = f"unread_count:{user.id}"
        cached_count = cache.get(cache_key)
        
        if cached_count is not None:
            return cached_count
        
        count = Message.objects.filter(
            recipient=user,
            is_read=False
        ).count()
        
        # Cache for 1 minute
        cache.set(cache_key, count, 60)
        
        return count
    
    def check_rate_limit(self, user):
        """
        Check if user has exceeded rate limit
        """
        cache_key = f"message_rate_limit:{user.id}"
        current_count = cache.get(cache_key, 0)
        
        if current_count >= self.max_messages_per_minute:
            return False
        
        cache.set(cache_key, current_count + 1, self.rate_limit_window)
        return True
    
    def sanitize_content(self, content):
        """
        Sanitize message content for security
        """
        # Remove potentially dangerous HTML/script tags
        import re
        dangerous_patterns = [
            r'<script.*?</script>',
            r'<iframe.*?</iframe>',
            r'javascript:',
            r'on\w+\s*=',
        ]
        
        sanitized = content
        for pattern in dangerous_patterns:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
        
        return sanitized.strip()
    
    def update_conversation_cache(self, user1, user2, message):
        """
        Update conversation cache when new message is sent
        """
        cache_keys = [
            f"conversation:{user1.id}:{user2.id}:*",
            f"conversation:{user2.id}:{user1.id}:*",
            f"user_conversations:{user1.id}",
            f"user_conversations:{user2.id}",
            f"unread_count:{user2.id}"
        ]
        
        for key in cache_keys:
            cache.delete_pattern(key)
    
    def invalidate_conversation_cache(self, user1, user2):
        """
        Invalidate conversation cache
        """
        self.update_conversation_cache(user1, user2, None)
    
    def create_message_notification(self, message):
        """
        Create notification for new message
        """
        from .models import Notification
        
        Notification.objects.create(
            user=message.recipient,
            title="New Message",
            message=f"You have a new message from {message.sender.username}",
            notification_type="message",
            related_object_id=message.id,
            related_object_type="message"
        )


class ShopMessagingManager:
    """
    Specialized messaging manager for shop-related communications
    """
    
    def __init__(self):
        self.message_manager = EnhancedMessageManager()
    
    def send_inquiry_to_shop(self, customer, shop, product, inquiry_content):
        """
        Send product inquiry to shop owner
        """
        shop_owner = shop.shopowner
        
        # Create inquiry message
        message = self.message_manager.create_message(
            sender=customer,
            recipient=shop_owner,
            content=inquiry_content,
            message_type='inquiry',
            shop=shop,
            product=product
        )
        
        return message
    
    def send_order_update(self, order, update_type, message_content):
        """
        Send order update message to customer
        """
        customer = order.customer
        
        message = self.message_manager.create_message(
            sender=order.shop.shopowner,
            recipient=customer,
            content=message_content,
            message_type='order_update',
            order=order,
            update_type=update_type
        )
        
        return message
    
    def send_bulk_message_to_customers(self, shop_owner, customers, message_content):
        """
        Send bulk message to multiple customers (with rate limiting)
        """
        messages = []
        
        for customer in customers:
            # Check rate limit for each message
            if not self.message_manager.check_rate_limit(shop_owner):
                break
            
            message = self.message_manager.create_message(
                sender=shop_owner,
                recipient=customer,
                content=message_content,
                message_type='bulk'
            )
            messages.append(message)
        
        return messages
    
    def get_shop_conversations(self, shop_owner):
        """
        Get conversations related to shop operations
        """
        # Get messages where shop owner is involved and message is shop-related
        shop_messages = Message.objects.filter(
            models.Q(sender=shop_owner) | models.Q(recipient=shop_owner),
            message_type__in=['inquiry', 'order_update', 'bulk']
        ).select_related('sender', 'recipient', 'shop', 'product', 'order')
        
        # Group by conversation partner
        conversations = {}
        for message in shop_messages:
            other_user = message.recipient if message.sender == shop_owner else message.sender
            if other_user.id not in conversations:
                conversations[other_user.id] = {
                    'user': other_user,
                    'messages': [],
                    'unread_count': 0
                }
            
            conversations[other_user.id]['messages'].append(message)
            if not message.is_read and message.recipient == shop_owner:
                conversations[other_user.id]['unread_count'] += 1
        
        return list(conversations.values())


class MessageSerializer(serializers.ModelSerializer):
    """
    Enhanced message serializer with security features
    """
    
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)
    sender_avatar = serializers.CharField(source='sender.profile.avatar.url', read_only=True)
    recipient_avatar = serializers.CharField(source='recipient.profile.avatar.url', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'recipient', 'content', 'message_type',
            'is_read', 'created_at', 'read_at', 'shop', 'product', 'order',
            'sender_username', 'recipient_username',
            'sender_avatar', 'recipient_avatar'
        ]
        read_only_fields = ['sender', 'is_read', 'created_at', 'read_at']
    
    def validate_content(self, value):
        """
        Validate message content
        """
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Message content cannot be empty.")
        
        if len(value) > 1000:
            raise serializers.ValidationError("Message content cannot exceed 1000 characters.")
        
        return value
    
    def validate_recipient(self, value):
        """
        Validate recipient
        """
        if value == self.context['request'].user:
            raise serializers.ValidationError("You cannot send a message to yourself.")
        
        return value


class ConversationSerializer(serializers.Serializer):
    """
    Serializer for conversation data
    """
    
    user = serializers.SerializerMethodField()
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.IntegerField()
    
    def get_user(self, obj):
        user = obj['user']
        return {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': user.profile.avatar.url if hasattr(user, 'profile') and user.profile.avatar else None
        }


class EnhancedMessageViewSet:
    """
    Enhanced message viewset with better security and performance
    """
    
    def __init__(self):
        self.message_manager = EnhancedMessageManager()
        self.shop_messaging = ShopMessagingManager()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def conversations(self, request):
        """
        Get all conversations for the current user
        """
        conversations = self.message_manager.get_user_conversations(request.user)
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def with_user(self, request):
        """
        Get conversation with specific user
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        
        messages = self.message_manager.get_conversation(
            request.user, other_user, limit, offset
        )
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def mark_as_read(self, request, pk=None):
        """
        Mark message as read
        """
        try:
            message = self.message_manager.mark_as_read(pk, request.user)
            serializer = MessageSerializer(message)
            return Response(serializer.data)
        except (serializers.ValidationError, PermissionError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def mark_conversation_read(self, request):
        """
        Mark all messages in a conversation as read
        """
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = User.objects.get(id=user_id)
            self.message_manager.mark_conversation_as_read(other_user, request.user)
            return Response({'status': 'success'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def unread_count(self, request):
        """
        Get unread message count
        """
        count = self.message_manager.get_unread_count(request.user)
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def shop_conversations(self, request):
        """
        Get shop-related conversations (for shop owners)
        """
        if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
            return Response(
                {'error': 'Only shop owners can access shop conversations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        conversations = self.shop_messaging.get_shop_conversations(request.user)
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_bulk_message(self, request):
        """
        Send bulk message to customers (shop owners only)
        """
        if not hasattr(request.user, 'profile') or not request.user.profile.is_shopowner:
            return Response(
                {'error': 'Only shop owners can send bulk messages'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        customer_ids = request.data.get('customer_ids', [])
        message_content = request.data.get('content')
        
        if not customer_ids or not message_content:
            return Response(
                {'error': 'customer_ids and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            customers = User.objects.filter(id__in=customer_ids)
            messages = self.shop_messaging.send_bulk_message_to_customers(
                request.user, customers, message_content
            )
            
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# WebSocket support for real-time messaging
class WebSocketMessageHandler:
    """
    WebSocket handler for real-time messaging
    """
    
    def __init__(self):
        self.message_manager = EnhancedMessageManager()
    
    def handle_message(self, websocket, message_data):
        """
        Handle incoming WebSocket message
        """
        try:
            message_type = message_data.get('type')
            
            if message_type == 'send_message':
                return self.handle_send_message(websocket, message_data)
            elif message_type == 'mark_read':
                return self.handle_mark_read(websocket, message_data)
            elif message_type == 'typing':
                return self.handle_typing(websocket, message_data)
            else:
                return {'error': 'Unknown message type'}
                
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
            return {'error': 'Internal server error'}
    
    def handle_send_message(self, websocket, message_data):
        """
        Handle sending a new message
        """
        recipient_id = message_data.get('recipient_id')
        content = message_data.get('content')
        
        if not recipient_id or not content:
            return {'error': 'recipient_id and content are required'}
        
        try:
            recipient = User.objects.get(id=recipient_id)
            message = self.message_manager.create_message(
                sender=websocket.user,
                recipient=recipient,
                content=content
            )
            
            # Broadcast to recipient if online
            self.broadcast_to_user(recipient, {
                'type': 'new_message',
                'message': MessageSerializer(message).data
            })
            
            return {'status': 'success', 'message_id': message.id}
            
        except User.DoesNotExist:
            return {'error': 'Recipient not found'}
        except Exception as e:
            return {'error': str(e)}
    
    def handle_mark_read(self, websocket, message_data):
        """
        Handle marking message as read
        """
        message_id = message_data.get('message_id')
        
        if not message_id:
            return {'error': 'message_id is required'}
        
        try:
            message = self.message_manager.mark_as_read(message_id, websocket.user)
            
            # Notify sender that message was read
            self.broadcast_to_user(message.sender, {
                'type': 'message_read',
                'message_id': message_id
            })
            
            return {'status': 'success'}
            
        except Exception as e:
            return {'error': str(e)}
    
    def handle_typing(self, websocket, message_data):
        """
        Handle typing indicator
        """
        recipient_id = message_data.get('recipient_id')
        is_typing = message_data.get('is_typing', False)
        
        if not recipient_id:
            return {'error': 'recipient_id is required'}
        
        try:
            recipient = User.objects.get(id=recipient_id)
            
            # Broadcast typing indicator to recipient
            self.broadcast_to_user(recipient, {
                'type': 'typing',
                'user_id': websocket.user.id,
                'is_typing': is_typing
            })
            
            return {'status': 'success'}
            
        except User.DoesNotExist:
            return {'error': 'Recipient not found'}
    
    def broadcast_to_user(self, user, data):
        """
        Broadcast message to specific user if online
        """
        # This would integrate with your WebSocket implementation
        # For now, we'll just log the broadcast
        logger.info(f"Broadcasting to user {user.id}: {data}") 