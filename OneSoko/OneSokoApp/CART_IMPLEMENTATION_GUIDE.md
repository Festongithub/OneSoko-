# Shopping Cart Implementation Guide

## Overview
This document outlines the comprehensive shopping cart functionality implemented in the OneSoko application, allowing users to add items, delete items, and store cart data in the database.

## 🛒 Cart Features Implemented

### Core Functionality
- ✅ **Add items to cart** - Users can add products to their cart with specified quantities
- ✅ **Remove items from cart** - Users can remove individual items from their cart
- ✅ **Update item quantities** - Users can increase or decrease quantities of cart items
- ✅ **Clear entire cart** - Users can remove all items from their cart at once
- ✅ **Persistent storage** - Cart data is stored in the database and persists across sessions
- ✅ **Real-time updates** - Cart updates are reflected immediately in the UI
- ✅ **Stock validation** - Prevents adding more items than available in stock

### Database Integration
- **Cart Model**: Each user has a unique cart stored in the database
- **CartItem Model**: Individual cart items with product, shop, quantity, and pricing information
- **Automatic cart creation**: Carts are created automatically when users add their first item
- **Data persistence**: Cart contents persist between browser sessions and devices

## 🏗️ Architecture Components

### Backend (Django REST API)
1. **Models** (`OneSokoApp/models.py`)
   - `Cart`: User's shopping cart container
   - `CartItem`: Individual items in the cart with quantities and pricing

2. **Views** (`OneSokoApp/views.py`)
   - `CartViewSet`: Full CRUD operations for cart management
   - Endpoints for add, update, remove, clear, and fetch operations

3. **Serializers** (`OneSokoApp/serializers.py`)
   - `CartSerializer`: Complete cart with items and totals
   - `CartItemSerializer`: Individual cart item details
   - `AddToCartSerializer`: Validation for adding items

### Frontend (React/TypeScript)
1. **Components**
   - `AddToCartButton`: Reusable button for adding products to cart
   - `CartIcon`: Header cart icon with item count badge
   - `MiniCart`: Dropdown cart preview with quick actions
   - `ProductCard`: Product display with integrated cart functionality

2. **Pages**
   - `Cart`: Full cart management page
   - `ShopProducts`: Shop-specific product listing with cart integration
   - `CartTestPage`: Testing interface for cart functionality

3. **Context/State Management**
   - `CartProvider`: Global cart state management
   - `useCart`: Hook for accessing cart functionality throughout the app

## 🔗 API Endpoints

### Cart Management
```
GET    /api/cart/                    # Get user's cart
POST   /api/cart/add_item/           # Add item to cart
PUT    /api/cart/update_item/{id}/   # Update item quantity
DELETE /api/cart/remove_item/{id}/   # Remove item from cart
DELETE /api/cart/clear_cart/         # Clear entire cart
GET    /api/cart/item_count/         # Get cart item count
```

### Request/Response Examples

#### Add Item to Cart
```json
POST /api/cart/add_item/
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "shop_id": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 2
}

Response:
{
  "message": "Item added to cart",
  "cart": {
    "id": 1,
    "user": "username",
    "items": [...],
    "total_items": 3,
    "total_price": "49.99"
  }
}
```

#### Update Item Quantity
```json
PUT /api/cart/update_item/123/
{
  "quantity": 5
}

Response:
{
  "message": "Item quantity updated",
  "cart": { ... }
}
```

## 🎯 User Experience Features

### Visual Feedback
- **Loading states**: Spinners and disabled states during API calls
- **Success indicators**: Green checkmarks and "Added!" messages
- **Error handling**: Clear error messages with retry options
- **Stock warnings**: "Only X left" and "Out of stock" indicators

### Smart Interactions
- **Quantity validation**: Prevents invalid quantities (< 1 or > stock)
- **Duplicate handling**: Updates quantity if item already in cart
- **Auto-refresh**: Cart data refreshes periodically and on focus
- **Optimistic updates**: UI updates immediately, with rollback on failure

### Responsive Design
- **Mobile-first**: Cart components work on all screen sizes
- **Touch-friendly**: Large buttons and easy-to-tap controls
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🧪 Testing

### Automated Tests
- **API Integration**: Test all cart endpoints
- **Component Testing**: Test cart components in isolation
- **User Flow Testing**: Test complete add-to-cart workflows

### Manual Testing Page
Access `/cart-test` to manually test:
- Adding items to cart
- Updating quantities
- Removing items
- Clearing cart
- Error scenarios

## 🔒 Security & Validation

### Backend Validation
- **Authentication required**: All cart operations require valid JWT token
- **User isolation**: Users can only access their own cart
- **Stock validation**: Prevents overselling
- **Product validation**: Ensures products exist and are active

### Frontend Validation
- **Input sanitization**: All user inputs are validated
- **Stock checking**: Real-time stock validation
- **Error boundaries**: Graceful error handling

## 📱 Mobile Considerations

### Touch Optimizations
- **Large touch targets**: Buttons sized for finger taps
- **Swipe gestures**: Swipe to remove items (future enhancement)
- **Native-like feel**: Smooth animations and transitions

### Performance
- **Lazy loading**: Components load only when needed
- **Debounced updates**: Prevents excessive API calls
- **Offline support**: Basic offline cart management (future enhancement)

## 🚀 Deployment Considerations

### Environment Configuration
- **API endpoints**: Configurable for different environments
- **Error handling**: Production-ready error messages
- **Monitoring**: Cart conversion tracking and analytics

### Database Performance
- **Optimized queries**: Efficient database operations
- **Indexing**: Proper database indexes for cart lookups
- **Connection pooling**: Efficient database connections

## 🔮 Future Enhancements

### Planned Features
- **Guest carts**: Anonymous cart functionality
- **Cart sharing**: Share cart with other users
- **Save for later**: Move items to wishlist
- **Cart expiration**: Automatic cart cleanup
- **Bulk operations**: Add multiple items at once

### Advanced Features
- **Cart recommendations**: Suggest related products
- **Price alerts**: Notify on price changes
- **Inventory notifications**: Alert when out-of-stock items return
- **Social features**: Share carts on social media

## 📖 Usage Examples

### Basic Usage
```typescript
import { useCart } from '../contexts/CartContext';
import AddToCartButton from '../components/AddToCartButton';

function ProductPage({ product, shop }) {
  const { addToCart, itemCount } = useCart();
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>Cart has {itemCount} items</p>
      <AddToCartButton 
        product={product} 
        shop={shop}
        onSuccess={() => console.log('Added to cart!')}
      />
    </div>
  );
}
```

### Advanced Usage
```typescript
import { useCart } from '../contexts/CartContext';

function CustomCartComponent() {
  const { 
    cart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    loading,
    error 
  } = useCart();
  
  const handleAddToCart = async (productId, shopId, quantity) => {
    try {
      await addToCart(productId, shopId, quantity);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
  
  return (
    <div>
      {/* Custom cart implementation */}
    </div>
  );
}
```

## 🎉 Conclusion

The shopping cart implementation provides a robust, user-friendly, and scalable solution for e-commerce functionality. Users can seamlessly add items, manage quantities, and complete purchases with confidence that their cart data is securely stored and synchronized across all their devices.

The architecture supports future enhancements and can scale with the application's growth, providing a solid foundation for the OneSoko marketplace platform.
