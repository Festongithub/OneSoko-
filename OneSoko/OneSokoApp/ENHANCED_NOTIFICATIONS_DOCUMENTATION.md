# Enhanced Shop Owner Notification System Documentation

## Overview

The enhanced notification system provides comprehensive notification capabilities for shop owners, including:

- **Product-specific order notifications** - Detailed notifications when individual products are ordered
- **Daily order statistics** - Complete daily analytics and summaries  
- **Weekly order summaries** - Week-by-week performance analytics
- **Stock level alerts** - Automatic low stock and out-of-stock notifications
- **Real-time order notifications** - Instant notifications when new orders are received

## New API Endpoints

### 1. Daily Order Statistics
**GET** `/api/orders/daily_orders_count/`

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**
```json
{
  "date": "2025-08-12",
  "total_orders": 5,
  "total_revenue": 2999.95,
  "products_ordered": [
    {
      "product_name": "Smartphone",
      "quantity": 10,
      "total_revenue": 1999.90,
      "product_id": "uuid-here"
    }
  ],
  "shop_breakdown": {
    "Electronics Store": {
      "orders_count": 3,
      "revenue": 1500.00,
      "shop_id": "shop-uuid-here"
    }
  }
}
```

### 2. Weekly Order Summary  
**GET** `/api/orders/weekly_orders_summary/`

**Query Parameters:**
- `date` (optional): Any date within the target week in YYYY-MM-DD format

**Response:**
```json
{
  "week_start": "2025-08-11",
  "week_end": "2025-08-17", 
  "total_orders": 25,
  "total_revenue": 15000.50,
  "daily_breakdown": {
    "Monday": {
      "date": "2025-08-11",
      "orders": 5,
      "revenue": 2500.00
    },
    "Tuesday": {
      "date": "2025-08-12", 
      "orders": 8,
      "revenue": 4000.25
    }
  },
  "average_daily_orders": 3.57,
  "average_daily_revenue": 2142.93
}
```

### 3. Create Daily Summary Notification
**POST** `/api/orders/create_daily_summary/`

**Request Body:**
```json
{
  "date": "2025-08-12"  // Optional, defaults to today
}
```

**Response:**
```json
{
  "detail": "Daily summary notification created successfully"
}
```

### 4. Shop Owner Order Notifications
**GET** `/api/orders/order_notifications/`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `page_size` (optional): Items per page (default: 20)

**Response:**
```json
{
  "notifications": [
    {
      "id": 123,
      "text": "New order #456 received from John Doe for $199.99",
      "type": "new_order_received",
      "is_read": false,
      "timestamp": "2025-08-12T10:30:00Z",
      "data": {
        "order_id": "order-uuid",
        "customer_name": "John Doe",
        "total": 199.99
      },
      "shop_id": "shop-uuid",
      "shop_name": "Electronics Store",
      "order_id": "order-uuid",
      "product_id": null,
      "product_name": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 87,
    "has_next": true,
    "has_previous": false
  }
}
```

## Notification Types

### 1. Order-Related Notifications
- `new_order_received` - When a new order is placed
- `order_status_updated` - When order status changes
- `order_completed` - When order is completed

### 2. Product-Specific Notifications  
- `product_ordered` - When a specific product is ordered
- `product_low_stock` - When product stock falls below threshold
- `product_out_of_stock` - When product is completely out of stock

### 3. Analytics Notifications
- `daily_summary` - Daily order and revenue summary
- `weekly_summary` - Weekly performance summary

## Backend Integration

### Enhanced Order Creation

When an order is created, the system now automatically:

1. **Creates order notification** - Basic order received notification
2. **Creates product-specific notifications** - Individual notifications for each product ordered
3. **Checks stock levels** - Automatically creates low stock alerts if needed
4. **Updates inventory tracking** - Maintains real-time stock monitoring

```python
# In your order creation view:
from OneSokoApp.enhanced_shop_notifications import notify_shop_owner_new_order

# After creating the order
order = Order.objects.create(...)
notify_shop_owner_new_order(order)  # This handles all notifications
```

### Manual Notification Creation

```python
from OneSokoApp.enhanced_shop_notifications import (
    ShopOwnerNotificationManager, 
    create_daily_summary_for_shop_owner
)

# Create manual notifications
manager = ShopOwnerNotificationManager()

# Low stock alert
manager.notify_low_stock(product, threshold=5)

# Out of stock alert  
manager.notify_out_of_stock(product)

# Daily summary
create_daily_summary_for_shop_owner(shop_owner_user)
```

### Getting Statistics

```python
from OneSokoApp.enhanced_shop_notifications import (
    get_shop_owner_daily_stats,
    ShopOwnerNotificationManager
)

# Daily stats
daily_stats = get_shop_owner_daily_stats(shop_owner_user, "2025-08-12")

# Weekly stats
weekly_stats = ShopOwnerNotificationManager.get_weekly_order_stats(shop_owner_user)
```

## Security & Permissions

All endpoints require:
- **Authentication**: User must be logged in
- **Shop Owner Status**: User must have `is_shopowner=True` in their profile
- **Ownership Validation**: Users can only access data for shops they own

The `IsShopOwnerForManagement` permission class ensures:
- Only authenticated users can access endpoints
- Only users with shop owner status can view shop data
- Shop owners can only see data for their own shops

## Frontend Integration Examples

### Daily Statistics Dashboard

```typescript
// Get daily order statistics
const getDailyStats = async (date?: string) => {
  const params = date ? `?date=${date}` : '';
  const response = await fetch(`/api/orders/daily_orders_count/${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Usage
const todayStats = await getDailyStats();
const specificDate = await getDailyStats('2025-08-10');
```

### Weekly Analytics

```typescript
// Get weekly summary
const getWeeklyStats = async (date?: string) => {
  const params = date ? `?date=${date}` : '';
  const response = await fetch(`/api/orders/weekly_orders_summary/${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Notification Management

```typescript
// Get shop owner notifications
const getNotifications = async (page = 1, pageSize = 20) => {
  const response = await fetch(
    `/api/orders/order_notifications/?page=${page}&page_size=${pageSize}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};
```

## Database Schema Changes

### Enhanced Notification Model

The notification system uses the existing `Notification` model with new types:

```python
# New notification types added:
NOTIFICATION_TYPES = [
    ('product_ordered', 'Product Ordered'),
    ('daily_summary', 'Daily Summary'), 
    ('weekly_summary', 'Weekly Summary'),
    ('stock_alert', 'Stock Alert'),
    ('product_low_stock', 'Product Low Stock'),
    ('product_out_of_stock', 'Product Out of Stock'),
]
```

### Data Structure

Notifications now include structured JSON data:

```json
{
  "order_id": "uuid",
  "product_id": "uuid", 
  "customer_name": "John Doe",
  "quantity_ordered": 2,
  "unit_price": 99.99,
  "total_amount": 199.98,
  "remaining_stock": 15,
  "shop_id": "uuid",
  "order_date": "2025-08-12T10:30:00Z"
}
```

## Testing

Run the comprehensive test suite:

```bash
cd /home/flamers/OneSoko-/OneSoko
source env/bin/activate  
python OneSokoApp/test_enhanced_notifications.py
```

The test validates:
- ✅ Order notification creation
- ✅ Product-specific notifications  
- ✅ Daily statistics calculation
- ✅ Weekly analytics generation
- ✅ Stock alert system
- ✅ Notification data integrity
- ✅ JSON serialization handling
- ✅ Permission enforcement

## Error Handling

The system includes comprehensive error handling:

- **JSON Serialization**: Custom serializer handles UUID, Decimal, and DateTime objects
- **Database Errors**: Graceful handling of database connectivity issues
- **Permission Errors**: Clear error messages for unauthorized access
- **Validation Errors**: Proper validation of date formats and required fields
- **Logging**: Detailed logging for debugging and monitoring

## Performance Considerations

- **Database Optimization**: Efficient queries with proper indexing
- **Pagination**: All list endpoints include pagination
- **Caching Potential**: Statistics calculations can be cached for frequently accessed data
- **Bulk Operations**: Efficient handling of multiple notifications
- **Query Optimization**: Minimal database hits for notification creation

## Future Enhancements

Potential improvements to consider:

1. **Real-time Notifications**: WebSocket integration for instant notifications
2. **Email/SMS Integration**: Send notifications via email or SMS
3. **Notification Preferences**: Allow shop owners to customize notification types
4. **Advanced Analytics**: More detailed analytics and reporting
5. **Notification Templates**: Customizable notification message templates
6. **Batch Processing**: Background tasks for large-scale notification processing

---

This enhanced notification system provides shop owners with comprehensive insights into their business operations and ensures they never miss important events related to their shops and products.
