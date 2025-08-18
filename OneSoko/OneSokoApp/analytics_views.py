from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q, F, Max
from django.utils import timezone
from datetime import datetime, timedelta
import json

from .models import (
    Shop, Product, Order, OrderItem, User, 
    BusinessAnalytics, CustomerBehaviorAnalytics, ProductPerformanceAnalytics, 
    SalesForecasting, MarketingCampaignAnalytics
)
from .permissions import IsShopOwnerOrReadOnly

class AnalyticsViewSet(viewsets.ViewSet):
    """Advanced analytics for shop owners"""
    permission_classes = [IsAuthenticated, IsShopOwnerOrReadOnly]

    @action(detail=False, methods=['get'])
    def dashboard_overview(self, request):
        """Get comprehensive dashboard overview"""
        user = request.user
        
        # Get user's shop
        try:
            shop = Shop.objects.get(owner=user)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        # Date range parameters
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get orders in the date range
        orders = Order.objects.filter(
            shop=shop,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        # Calculate metrics
        total_revenue = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_orders = orders.count()
        completed_orders = orders.filter(status='delivered').count()
        cancelled_orders = orders.filter(status='cancelled').count()
        
        # Average order value
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Customer metrics
        unique_customers = orders.values('customer').distinct().count()
        returning_customers = orders.values('customer').annotate(
            order_count=Count('id')
        ).filter(order_count__gt=1).count()
        
        # Product metrics
        order_items = OrderItem.objects.filter(order__in=orders)
        total_products_sold = order_items.aggregate(Sum('quantity'))['quantity__sum'] or 0
        
        # Top selling products
        top_products = order_items.values('product__name').annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price'))
        ).order_by('-total_sold')[:5]
        
        # Revenue trend (daily for last 30 days)
        revenue_trend = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            daily_revenue = orders.filter(
                created_at__date=date
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            revenue_trend.append({
                'date': date.strftime('%Y-%m-%d'),
                'revenue': float(daily_revenue)
            })
        
        # Calculate growth rates
        previous_period_orders = Order.objects.filter(
            shop=shop,
            created_at__date__gte=start_date - timedelta(days=days),
            created_at__date__lt=start_date
        )
        
        previous_revenue = previous_period_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        previous_order_count = previous_period_orders.count()
        
        revenue_growth = ((total_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
        order_growth = ((total_orders - previous_order_count) / previous_order_count * 100) if previous_order_count > 0 else 0
        
        return Response({
            'period': f'{days} days',
            'date_range': {
                'start': start_date,
                'end': end_date
            },
            'overview': {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'cancelled_orders': cancelled_orders,
                'average_order_value': float(avg_order_value),
                'conversion_rate': (completed_orders / total_orders * 100) if total_orders > 0 else 0
            },
            'customers': {
                'unique_customers': unique_customers,
                'returning_customers': returning_customers,
                'new_customers': unique_customers - returning_customers,
                'retention_rate': (returning_customers / unique_customers * 100) if unique_customers > 0 else 0
            },
            'products': {
                'total_products_sold': total_products_sold,
                'top_selling_products': list(top_products)
            },
            'trends': {
                'revenue_trend': revenue_trend,
                'revenue_growth': float(revenue_growth),
                'order_growth': float(order_growth)
            }
        })

    @action(detail=False, methods=['get'])
    def sales_analytics(self, request):
        """Detailed sales analytics"""
        user = request.user
        
        try:
            shop = Shop.objects.get(owner=user)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        # Date range and grouping parameters
        days = int(request.query_params.get('days', 30))
        group_by = request.query_params.get('group_by', 'day')  # day, week, month
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        orders = Order.objects.filter(
            shop=shop,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        # Sales by time period
        sales_data = []
        if group_by == 'day':
            for i in range(days):
                date = start_date + timedelta(days=i)
                daily_data = orders.filter(created_at__date=date)
                sales_data.append({
                    'period': date.strftime('%Y-%m-%d'),
                    'revenue': float(daily_data.aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
                    'orders': daily_data.count(),
                    'customers': daily_data.values('customer').distinct().count()
                })
        
        # Sales by product category
        category_sales = OrderItem.objects.filter(order__in=orders).values(
            'product__category__name'
        ).annotate(
            total_revenue=Sum(F('quantity') * F('price')),
            total_quantity=Sum('quantity')
        ).order_by('-total_revenue')
        
        # Sales by payment method
        payment_methods = orders.values('payment_method').annotate(
            count=Count('id'),
            revenue=Sum('total_amount')
        ).order_by('-revenue')
        
        # Order status distribution
        status_distribution = orders.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'period': f'{days} days',
            'sales_timeline': sales_data,
            'category_performance': list(category_sales),
            'payment_methods': list(payment_methods),
            'order_status_distribution': list(status_distribution)
        })

    @action(detail=False, methods=['get'])
    def customer_analytics(self, request):
        """Customer behavior and segmentation analytics"""
        user = request.user
        
        try:
            shop = Shop.objects.get(owner=user)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        # Customer segmentation
        customers = User.objects.filter(
            orders__shop=shop
        ).annotate(
            total_orders=Count('orders'),
            total_spent=Sum('orders__total_amount'),
            last_order=Max('orders__created_at')
        ).distinct()
        
        # Segment customers
        segments = {
            'new': customers.filter(total_orders=1).count(),
            'regular': customers.filter(total_orders__gte=2, total_orders__lt=5).count(),
            'vip': customers.filter(total_orders__gte=5, total_spent__gte=1000).count(),
            'at_risk': customers.filter(
                last_order__lt=timezone.now() - timedelta(days=90)
            ).count()
        }
        
        # Top customers by value
        top_customers = customers.order_by('-total_spent')[:10]
        top_customer_data = []
        for customer in top_customers:
            top_customer_data.append({
                'name': f"{customer.first_name} {customer.last_name}",
                'email': customer.email,
                'total_orders': customer.total_orders,
                'total_spent': float(customer.total_spent or 0),
                'last_order': customer.last_order
            })
        
        # Customer acquisition by month
        acquisition_data = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            new_customers = User.objects.filter(
                orders__shop=shop,
                orders__created_at__gte=month_start,
                orders__created_at__lt=month_end
            ).distinct().count()
            
            acquisition_data.append({
                'month': month_start.strftime('%Y-%m'),
                'new_customers': new_customers
            })
        
        return Response({
            'customer_segments': segments,
            'top_customers': top_customer_data,
            'customer_acquisition': acquisition_data[::-1],  # Reverse to show chronologically
            'total_customers': customers.count()
        })

    @action(detail=False, methods=['get'])
    def product_performance(self, request):
        """Product performance analytics"""
        user = request.user
        
        try:
            shop = Shop.objects.get(owner=user)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get order items in date range
        order_items = OrderItem.objects.filter(
            order__shop=shop,
            order__created_at__date__gte=start_date,
            order__created_at__date__lte=end_date
        )
        
        # Product performance
        product_performance = order_items.values(
            'product__id',
            'product__name',
            'product__category__name'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price')),
            avg_price=Avg('price'),
            orders_count=Count('order', distinct=True)
        ).order_by('-total_revenue')
        
        # Low stock products
        low_stock_products = Product.objects.filter(
            shop=shop,
            stock_quantity__lte=F('reorder_level')
        ).values('id', 'name', 'stock_quantity', 'reorder_level')
        
        # Best performing categories
        category_performance = order_items.values(
            'product__category__name'
        ).annotate(
            total_revenue=Sum(F('quantity') * F('price')),
            total_sold=Sum('quantity'),
            avg_price=Avg('price')
        ).order_by('-total_revenue')
        
        # Products with no sales
        all_products = Product.objects.filter(shop=shop).count()
        products_with_sales = order_items.values('product').distinct().count()
        products_without_sales = all_products - products_with_sales
        
        return Response({
            'period': f'{days} days',
            'product_performance': list(product_performance[:20]),  # Top 20
            'category_performance': list(category_performance),
            'inventory_alerts': {
                'low_stock_products': list(low_stock_products),
                'products_without_sales': products_without_sales,
                'total_products': all_products
            }
        })

    @action(detail=False, methods=['get'])
    def financial_summary(self, request):
        """Financial analytics and reporting"""
        user = request.user
        
        try:
            shop = Shop.objects.get(owner=user)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        orders = Order.objects.filter(
            shop=shop,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        # Revenue breakdown
        total_revenue = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        completed_revenue = orders.filter(status='delivered').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        pending_revenue = orders.filter(status__in=['pending', 'processing']).aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        # Monthly comparison
        current_month = timezone.now().replace(day=1)
        last_month = current_month - timedelta(days=1)
        last_month_start = last_month.replace(day=1)
        
        current_month_revenue = Order.objects.filter(
            shop=shop,
            created_at__gte=current_month,
            status='delivered'
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        last_month_revenue = Order.objects.filter(
            shop=shop,
            created_at__gte=last_month_start,
            created_at__lt=current_month,
            status='delivered'
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        monthly_growth = ((current_month_revenue - last_month_revenue) / 
                         last_month_revenue * 100) if last_month_revenue > 0 else 0
        
        return Response({
            'period': f'{days} days',
            'revenue_summary': {
                'total_revenue': float(total_revenue),
                'completed_revenue': float(completed_revenue),
                'pending_revenue': float(pending_revenue),
                'revenue_completion_rate': (completed_revenue / total_revenue * 100) if total_revenue > 0 else 0
            },
            'monthly_comparison': {
                'current_month': float(current_month_revenue),
                'last_month': float(last_month_revenue),
                'growth_rate': float(monthly_growth)
            }
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_sales_forecast(request):
    """Generate sales forecast using simple trend analysis"""
    user = request.user
    
    try:
        shop = Shop.objects.get(owner=user)
    except Shop.DoesNotExist:
        return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)
    
    forecast_days = int(request.data.get('days', 30))
    
    # Get historical data (last 90 days)
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=90)
    
    historical_orders = Order.objects.filter(
        shop=shop,
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
        status='delivered'
    )
    
    # Calculate daily averages
    total_days = 90
    avg_daily_revenue = (historical_orders.aggregate(
        Sum('total_amount'))['total_amount__sum'] or 0) / total_days
    avg_daily_orders = historical_orders.count() / total_days
    
    # Generate forecast
    forecast_data = []
    for i in range(1, forecast_days + 1):
        forecast_date = end_date + timedelta(days=i)
        
        # Simple linear trend (can be enhanced with ML models)
        predicted_revenue = avg_daily_revenue * (1 + (i * 0.001))  # Small growth trend
        predicted_orders = int(avg_daily_orders * (1 + (i * 0.001)))
        
        forecast_data.append({
            'date': forecast_date.strftime('%Y-%m-%d'),
            'predicted_revenue': round(float(predicted_revenue), 2),
            'predicted_orders': predicted_orders,
            'confidence_level': max(90 - (i * 0.5), 60)  # Decreasing confidence over time
        })
    
    return Response({
        'shop': shop.name,
        'forecast_period': f'{forecast_days} days',
        'based_on_days': 90,
        'forecast': forecast_data,
        'summary': {
            'total_predicted_revenue': sum(item['predicted_revenue'] for item in forecast_data),
            'total_predicted_orders': sum(item['predicted_orders'] for item in forecast_data),
            'avg_confidence': sum(item['confidence_level'] for item in forecast_data) / len(forecast_data)
        }
    })
