from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q, F
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
import uuid

from .models import Order, OrderItem, Product, Shop, Notification, UserProfile
from .serializers import OrderSerializer, OrderItemSerializer
from .permissions import IsShopOwnerOrReadOnly


class EnhancedOrderViewSet(viewsets.ModelViewSet):
    """
    Enhanced Order Management with tracking, analytics, and status updates.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter orders based on user role."""
        user = self.request.user
        
        # Check if user is a shop owner
        try:
            profile = UserProfile.objects.get(user=user)
            if profile.is_shopowner:
                # Shop owners see orders for their shops
                shops = Shop.objects.filter(shopowner=user)
                return Order.objects.filter(shop__in=shops).order_by('-created_at')
        except UserProfile.DoesNotExist:
            pass
        
        # Regular customers see their own orders
        return Order.objects.filter(user=user).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update order status with notifications and tracking.
        """
        try:
            order = self.get_object()
            new_status = request.data.get('status')
            tracking_info = request.data.get('tracking_info', '')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate status
            valid_statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
            if new_status not in valid_statuses:
                return Response(
                    {'error': f'Invalid status. Must be one of: {valid_statuses}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check permissions (only shop owner can update)
            if not self._can_update_order(request.user, order):
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            old_status = order.status
            order.status = new_status
            order.save()
            
            # Create tracking entry
            self._create_tracking_entry(order, old_status, new_status, tracking_info)
            
            # Send notification to customer
            self._notify_customer_status_change(order, old_status, new_status)
            
            # Update shop analytics
            self._update_shop_analytics(order, new_status)
            
            return Response({
                'message': f'Order status updated from {old_status} to {new_status}',
                'order': OrderSerializer(order).data,
                'tracking_info': tracking_info
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to update order status: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def tracking(self, request, pk=None):
        """
        Get order tracking information.
        """
        try:
            order = self.get_object()
            
            # Get tracking entries (we'll create this model)
            tracking_entries = self._get_tracking_entries(order)
            
            # Calculate estimated delivery
            estimated_delivery = self._calculate_estimated_delivery(order)
            
            return Response({
                'order_id': order.id,
                'current_status': order.status,
                'tracking_entries': tracking_entries,
                'estimated_delivery': estimated_delivery,
                'order_date': order.created_at,
                'customer_info': {
                    'name': f"{order.user.first_name} {order.user.last_name}",
                    'email': order.user.email
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get tracking info: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        Get order analytics for shop owners.
        """
        try:
            user = request.user
            
            # Check if user is shop owner
            if not self._is_shop_owner(user):
                return Response(
                    {'error': 'Only shop owners can access analytics'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get shop owner's shops
            shops = Shop.objects.filter(shopowner=user)
            orders = Order.objects.filter(shop__in=shops)
            
            # Calculate analytics
            analytics = self._calculate_order_analytics(orders)
            
            return Response(analytics, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get analytics: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """
        Get order summary for dashboard.
        """
        try:
            user = request.user
            
            if self._is_shop_owner(user):
                # Shop owner dashboard
                shops = Shop.objects.filter(shopowner=user)
                orders = Order.objects.filter(shop__in=shops)
                
                summary = {
                    'total_orders': orders.count(),
                    'pending_orders': orders.filter(status='pending').count(),
                    'shipped_orders': orders.filter(status='shipped').count(),
                    'delivered_orders': orders.filter(status='delivered').count(),
                    'total_revenue': orders.filter(status='delivered').aggregate(
                        total=Sum('total')
                    )['total'] or 0,
                    'recent_orders': OrderSerializer(
                        orders.order_by('-created_at')[:5], many=True
                    ).data
                }
            else:
                # Customer dashboard
                orders = Order.objects.filter(user=user)
                
                summary = {
                    'total_orders': orders.count(),
                    'pending_orders': orders.filter(status='pending').count(),
                    'shipped_orders': orders.filter(status='shipped').count(),
                    'delivered_orders': orders.filter(status='delivered').count(),
                    'recent_orders': OrderSerializer(
                        orders.order_by('-created_at')[:5], many=True
                    ).data
                }
            
            return Response(summary, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get dashboard summary: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """
        Update multiple orders' status at once.
        """
        try:
            order_ids = request.data.get('order_ids', [])
            new_status = request.data.get('status')
            
            if not order_ids or not new_status:
                return Response(
                    {'error': 'order_ids and status are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get orders and check permissions
            orders = Order.objects.filter(id__in=order_ids)
            updated_orders = []
            
            with transaction.atomic():
                for order in orders:
                    if self._can_update_order(request.user, order):
                        old_status = order.status
                        order.status = new_status
                        order.save()
                        
                        # Create tracking and notifications
                        self._create_tracking_entry(order, old_status, new_status)
                        self._notify_customer_status_change(order, old_status, new_status)
                        
                        updated_orders.append(order.id)
            
            return Response({
                'message': f'Updated {len(updated_orders)} orders to {new_status}',
                'updated_orders': updated_orders
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to bulk update orders: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Helper methods
    def _can_update_order(self, user, order):
        """Check if user can update the order."""
        try:
            profile = UserProfile.objects.get(user=user)
            if profile.is_shopowner:
                return order.shop.shopowner == user
        except UserProfile.DoesNotExist:
            pass
        return False
    
    def _is_shop_owner(self, user):
        """Check if user is a shop owner."""
        try:
            profile = UserProfile.objects.get(user=user)
            return profile.is_shopowner
        except UserProfile.DoesNotExist:
            return False
    
    def _create_tracking_entry(self, order, old_status, new_status, tracking_info=''):
        """Create a tracking entry for status change."""
        # This would use a OrderTracking model (we'll create this next)
        # For now, we'll create a notification as tracking
        message = f"Order #{order.id} status changed from {old_status} to {new_status}"
        if tracking_info:
            message += f" - {tracking_info}"
        
        Notification.objects.create(
            user=order.shop.shopowner,
            message=message,
            type='order_status_update',
            priority='medium',
            order=order
        )
    
    def _notify_customer_status_change(self, order, old_status, new_status):
        """Send notification to customer about status change."""
        status_messages = {
            'paid': '💳 Your payment has been confirmed!',
            'shipped': '📦 Your order has been shipped!',
            'delivered': '🎉 Your order has been delivered!',
            'cancelled': '❌ Your order has been cancelled.'
        }
        
        if new_status in status_messages:
            Notification.objects.create(
                user=order.user,
                message=f"Order #{order.id}: {status_messages[new_status]}",
                type='order_status_update',
                priority='high' if new_status in ['delivered', 'cancelled'] else 'medium',
                order=order
            )
    
    def _update_shop_analytics(self, order, new_status):
        """Update shop analytics based on order status."""
        if new_status == 'delivered':
            shop = order.shop
            shop.total_orders = F('total_orders') + 1
            shop.total_sales = F('total_sales') + order.total
            shop.save(update_fields=['total_orders', 'total_sales'])
    
    def _get_tracking_entries(self, order):
        """Get tracking entries for an order."""
        # For now, use notifications as tracking entries
        tracking_notifications = Notification.objects.filter(
            order=order,
            type='order_status_update'
        ).order_by('timestamp')
        
        return [
            {
                'timestamp': notif.timestamp,
                'status': 'Updated',
                'description': notif.message,
                'location': 'System'
            }
            for notif in tracking_notifications
        ]
    
    def _calculate_estimated_delivery(self, order):
        """Calculate estimated delivery date."""
        if order.status == 'delivered':
            return None
        
        # Simple estimation: 3-7 days from ship date
        if order.status == 'shipped':
            return order.created_at + timedelta(days=7)
        elif order.status == 'paid':
            return order.created_at + timedelta(days=10)
        else:
            return order.created_at + timedelta(days=14)
    
    def _calculate_order_analytics(self, orders):
        """Calculate comprehensive order analytics."""
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        last_7_days = today - timedelta(days=7)
        
        # Basic counts
        total_orders = orders.count()
        orders_last_30_days = orders.filter(created_at__date__gte=last_30_days).count()
        orders_last_7_days = orders.filter(created_at__date__gte=last_7_days).count()
        
        # Revenue analytics
        total_revenue = orders.filter(status='delivered').aggregate(
            total=Sum('total')
        )['total'] or 0
        
        revenue_last_30_days = orders.filter(
            status='delivered',
            created_at__date__gte=last_30_days
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # Status breakdown
        status_breakdown = orders.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Monthly trend (last 6 months)
        monthly_data = []
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_orders = orders.filter(
                created_at__date__gte=month_start,
                created_at__date__lte=month_end
            ).count()
            
            month_revenue = orders.filter(
                status='delivered',
                created_at__date__gte=month_start,
                created_at__date__lte=month_end
            ).aggregate(total=Sum('total'))['total'] or 0
            
            monthly_data.append({
                'month': month_start.strftime('%B %Y'),
                'orders': month_orders,
                'revenue': float(month_revenue)
            })
        
        # Top products
        top_products = OrderItem.objects.filter(
            order__in=orders,
            order__status='delivered'
        ).values(
            'product__name'
        ).annotate(
            quantity_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('order__total'))
        ).order_by('-quantity_sold')[:10]
        
        return {
            'overview': {
                'total_orders': total_orders,
                'orders_last_30_days': orders_last_30_days,
                'orders_last_7_days': orders_last_7_days,
                'total_revenue': float(total_revenue),
                'revenue_last_30_days': float(revenue_last_30_days),
                'average_order_value': float(total_revenue / total_orders) if total_orders > 0 else 0
            },
            'status_breakdown': list(status_breakdown),
            'monthly_trend': list(reversed(monthly_data)),
            'top_products': list(top_products)
        }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order_from_cart(request):
    """
    Create an order from cart items.
    """
    try:
        data = request.data
        shop_id = data.get('shop_id')
        cart_items = data.get('cart_items', [])  # [{'product_id': 'uuid', 'quantity': 2}, ...]
        
        if not shop_id or not cart_items:
            return Response(
                {'error': 'shop_id and cart_items are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get shop
        try:
            shop = Shop.objects.get(shopId=shop_id)
        except Shop.DoesNotExist:
            return Response(
                {'error': 'Shop not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        total_amount = 0
        order_items_data = []
        
        # Validate cart items and calculate total
        with transaction.atomic():
            for item in cart_items:
                product_id = item.get('product_id')
                quantity = item.get('quantity', 1)
                
                try:
                    product = Product.objects.get(productId=product_id)
                except Product.DoesNotExist:
                    return Response(
                        {'error': f'Product {product_id} not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Check stock
                if product.quantity < quantity:
                    return Response(
                        {'error': f'Insufficient stock for {product.name}. Available: {product.quantity}, Requested: {quantity}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Calculate item total
                item_price = product.promotional_price or product.price
                item_total = item_price * quantity
                total_amount += item_total
                
                order_items_data.append({
                    'product': product,
                    'quantity': quantity,
                    'price': item_price
                })
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                shop=shop,
                total=total_amount,
                status='pending'
            )
            
            # Create order items and update stock
            for item_data in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['product'],
                    quantity=item_data['quantity']
                )
                
                # Update stock
                product = item_data['product']
                product.quantity -= item_data['quantity']
                product.save()
            
            # Notify shop owner
            Notification.objects.create(
                user=shop.shopowner,
                message=f'🎉 New order #{order.id} received from {request.user.first_name} {request.user.last_name} for ${total_amount}',
                type='new_order',
                priority='high',
                order=order,
                shop=shop
            )
            
            # Notify customer
            Notification.objects.create(
                user=request.user,
                message=f'✅ Order #{order.id} placed successfully! Total: ${total_amount}',
                type='order_status_update',
                priority='medium',
                order=order
            )
        
        return Response({
            'message': 'Order created successfully',
            'order': OrderSerializer(order).data,
            'total_amount': float(total_amount)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to create order: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_reports(request):
    """
    Generate detailed order reports for shop owners.
    """
    try:
        user = request.user
        
        # Check if user is shop owner
        try:
            profile = UserProfile.objects.get(user=user)
            if not profile.is_shopowner:
                return Response(
                    {'error': 'Only shop owners can access reports'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get query parameters
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        report_type = request.GET.get('type', 'summary')  # summary, detailed, export
        
        # Get shop owner's shops and orders
        shops = Shop.objects.filter(shopowner=user)
        orders = Order.objects.filter(shop__in=shops)
        
        # Apply date filters
        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)
        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)
        
        if report_type == 'summary':
            # Summary report
            report_data = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'summary': {
                    'total_orders': orders.count(),
                    'total_revenue': float(orders.filter(status='delivered').aggregate(
                        total=Sum('total')
                    )['total'] or 0),
                    'pending_orders': orders.filter(status='pending').count(),
                    'shipped_orders': orders.filter(status='shipped').count(),
                    'delivered_orders': orders.filter(status='delivered').count(),
                    'cancelled_orders': orders.filter(status='cancelled').count()
                },
                'top_customers': list(orders.values(
                    'user__first_name', 'user__last_name', 'user__email'
                ).annotate(
                    order_count=Count('id'),
                    total_spent=Sum('total')
                ).order_by('-total_spent')[:10])
            }
        
        elif report_type == 'detailed':
            # Detailed report with all orders
            report_data = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'orders': OrderSerializer(orders.order_by('-created_at'), many=True).data,
                'summary': {
                    'total_orders': orders.count(),
                    'total_revenue': float(orders.filter(status='delivered').aggregate(
                        total=Sum('total')
                    )['total'] or 0)
                }
            }
        
        return Response(report_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to generate report: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
