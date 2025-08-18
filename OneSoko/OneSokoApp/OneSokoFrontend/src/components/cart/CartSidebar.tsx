import React from 'react';
import { Link } from 'react-router-dom';
import { 
  XMarkIcon, 
  MinusIcon, 
  PlusIcon, 
  TrashIcon,
  ShoppingBagIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../stores/cartStore';
import type { CartItem } from '../../types';

const CartSidebar: React.FC = () => {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCartStore();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getItemPrice = (item: CartItem): number => {
    let basePrice = item.product.promotional_price 
      ? parseFloat(item.product.promotional_price)
      : parseFloat(item.product.price);
    
    if (item.variant?.price_adjustment) {
      basePrice += parseFloat(item.variant.price_adjustment);
    }
    
    return basePrice;
  };

  const getItemTotal = (item: CartItem): number => {
    return getItemPrice(item) * item.quantity;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={toggleCart}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({getTotalItems()})
            </h2>
            <button
              onClick={toggleCart}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBagIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      
                      {/* Price Display */}
                      <div className="flex items-center mt-2 space-x-2">
                        {item.product.promotional_price && (
                          <span className="text-sm line-through text-gray-400">
                            {formatPrice(parseFloat(item.product.price))}
                          </span>
                        )}
                        <span className="text-sm font-medium text-primary-600">
                          {formatPrice(getItemPrice(item))}
                        </span>
                        {item.product.discount && parseFloat(item.product.discount) > 0 && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            -{item.product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium px-2 py-1 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            disabled={item.quantity >= item.product.quantity}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="mt-2 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(getItemTotal(item))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary-600">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button className="w-full btn-primary py-3 text-base font-semibold">
                  Proceed to Checkout
                </button>
                
                <div className="flex space-x-2">
                  <Link 
                    to="/cart"
                    onClick={toggleCart}
                    className="flex-1 btn-secondary py-2 text-sm text-center flex items-center justify-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View Full Cart</span>
                  </Link>
                  <button
                    onClick={clearCart}
                    className="flex-1 btn-outline py-2 text-sm border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
