import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cartAPI } from '../services/api';
import { Cart as CartType, CartItem } from '../types';

// Group cart items by shop for better organization
interface ShopGroup {
  shop: {
    shopId: string;
    name: string;
    logo?: string | null;
  };
  items: CartItem[];
  shopTotal: number;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [expandedShops, setExpandedShops] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const cartData = await cartAPI.getCart();
      setCart(cartData);
      // Expand all shops by default
      if (cartData?.items) {
        const shopIds = new Set(cartData.items.map(item => item.shop.shopId));
        setExpandedShops(shopIds);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Group items by shop
  const groupItemsByShop = (items: CartItem[]): ShopGroup[] => {
    const shopMap = new Map<string, ShopGroup>();
    
    items.forEach(item => {
      const shopId = item.shop.shopId;
      if (!shopMap.has(shopId)) {
        shopMap.set(shopId, {
          shop: {
            shopId: item.shop.shopId,
            name: item.shop.name,
            logo: item.shop.logo
          },
          items: [],
          shopTotal: 0
        });
      }
      
      const shopGroup = shopMap.get(shopId)!;
      shopGroup.items.push(item);
      shopGroup.shopTotal += item.total_price;
    });
    
    return Array.from(shopMap.values());
  };

  const updateItemQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      const updatedCart = await cartAPI.updateCartItem(itemId, newQuantity);
      setCart(updatedCart);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      const updatedCart = await cartAPI.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeShopItems = async (shopId: string) => {
    if (!cart?.items) return;
    
    const shopItems = cart.items.filter(item => item.shop.shopId === shopId);
    if (!window.confirm(`Are you sure you want to remove all ${shopItems.length} items from ${shopItems[0]?.shop.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      // Remove items one by one (in a real app, you'd have a bulk remove API)
      for (const item of shopItems) {
        await cartAPI.removeFromCart(item.id);
      }
      await fetchCart(); // Refresh cart after removing all items
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove shop items');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return;
    
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      setLoading(true);
      const updatedCart = await cartAPI.clearCart();
      setCart(updatedCart);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const toggleShopExpanded = (shopId: string) => {
    setExpandedShops(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shopId)) {
        newSet.delete(shopId);
      } else {
        newSet.add(shopId);
      }
      return newSet;
    });
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBagIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Cart</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchCart}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
          </div>

          {/* Empty Cart */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/shops"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            <button
              onClick={clearCart}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Grouped by Shop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {cart.items && groupItemsByShop(cart.items).map((shopGroup) => (
              <ShopSection
                key={shopGroup.shop.shopId}
                shopGroup={shopGroup}
                isExpanded={expandedShops.has(shopGroup.shop.shopId)}
                onToggleExpanded={() => toggleShopExpanded(shopGroup.shop.shopId)}
                onUpdateQuantity={updateItemQuantity}
                onRemoveItem={removeItem}
                onRemoveShopItems={() => removeShopItems(shopGroup.shop.shopId)}
                updatingItems={updatingItems}
              />
            ))}
          </div>

          {/* Enhanced Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              
              {/* Shop Breakdown */}
              {cart.items && groupItemsByShop(cart.items).length > 1 && (
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    By Shop:
                  </h3>
                  {groupItemsByShop(cart.items).map((shopGroup) => (
                    <div key={shopGroup.shop.shopId} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center">
                        <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                        {shopGroup.shop.name}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ${shopGroup.shopTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Items ({cart.total_items || 0})
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    ${(cart.total_price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      ${(cart.total_price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
                >
                  <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </button>

                <Link
                  to="/shops"
                  className="w-full text-center py-2 px-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium block"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                  🔒 Secure checkout powered by OneSoko
                </p>
                {cart.items && groupItemsByShop(cart.items).length > 1 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                    💡 Items from different shops may have separate delivery
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shop Section Component
interface ShopSectionProps {
  shopGroup: ShopGroup;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onRemoveShopItems: () => void;
  updatingItems: Set<number>;
}

const ShopSection: React.FC<ShopSectionProps> = ({
  shopGroup,
  isExpanded,
  onToggleExpanded,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveShopItems,
  updatingItems
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Shop Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleExpanded}
            className="flex items-center space-x-3 flex-1 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2"
          >
            <div className="flex-shrink-0">
              {shopGroup.shop.logo ? (
                <img
                  src={shopGroup.shop.logo}
                  alt={shopGroup.shop.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <BuildingStorefrontIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {shopGroup.shop.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {shopGroup.items.length} item{shopGroup.items.length !== 1 ? 's' : ''} • ${shopGroup.shopTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex-shrink-0">
              {isExpanded ? (
                <MinusIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <PlusIcon className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          
          <button
            onClick={onRemoveShopItems}
            className="ml-2 p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
            title={`Remove all items from ${shopGroup.shop.name}`}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Shop Items */}
      {isExpanded && (
        <div className="p-4">
          <div className="space-y-4">
            {shopGroup.items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
                isUpdating={updatingItems.has(item.id)}
                showShopName={false} // Don't show shop name since it's grouped
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Cart Item Card Component
interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  isUpdating: boolean;
  showShopName?: boolean;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  showShopName = true
}) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.product.quantity) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    if (window.confirm(`Remove "${item.product.name}" from your cart?`)) {
      onRemove(item.id);
    }
  };

  // Calculate discount percentage if promotional price exists
  const discountPercentage = item.product.promotional_price 
    ? Math.round(((item.product.price - item.product.promotional_price) / item.product.price) * 100)
    : 0;

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Link to={`/products/${item.product.productId}`} className="block">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {item.product.image ? (
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBagIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link 
              to={`/products/${item.product.productId}`}
              className="block hover:text-primary-600 dark:hover:text-primary-400"
            >
              <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {item.product.name}
              </h3>
            </Link>
            
            {showShopName && (
              <Link 
                to={`/shops/${item.shop.shopId}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mt-1 block"
              >
                🏪 {item.shop.name}
              </Link>
            )}
            
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${item.product.promotional_price || item.product.price}
              </span>
              {item.product.promotional_price && (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    ${item.product.price}
                  </span>
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="mt-1">
              {item.product.quantity === 0 ? (
                <span className="text-xs text-red-600 dark:text-red-400">Out of Stock</span>
              ) : item.product.quantity < 10 ? (
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  Only {item.product.quantity} left
                </span>
              ) : (
                <span className="text-xs text-green-600 dark:text-green-400">In Stock</span>
              )}
            </div>
          </div>
          
          <div className="text-right ml-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              ${item.total_price.toFixed(2)}
            </p>
            {quantity > 1 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ${(item.total_price / quantity).toFixed(2)} each
              </p>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MinusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex items-center min-w-[3rem]">
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <span className="text-sm font-medium text-gray-900 dark:text-white text-center w-full">
                  {quantity}
                </span>
              )}
            </div>
            
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating || quantity >= item.product.quantity || item.product.quantity === 0}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remove from cart"
          >
            <TrashIcon className="w-4 h-4" />
            <span className="text-sm">Remove</span>
          </button>
        </div>

        {/* Warnings */}
        {quantity >= item.product.quantity && item.product.quantity > 0 && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
            Maximum available quantity reached
          </p>
        )}
        
        {item.product.quantity === 0 && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            This item is currently out of stock
          </p>
        )}
      </div>
    </div>
  );
};

export default CartPage; 