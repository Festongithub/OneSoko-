import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types';

interface MiniCartProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}

const MiniCart: React.FC<MiniCartProps> = ({
  className = '',
  iconSize = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cart, itemCount, totalPrice, removeFromCart, updateCartItem, loading } = useCart();

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ShoppingCartIcon className={iconSizes[iconSize]} />
        
        {/* Cart count badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[1.25rem]">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Shopping Cart ({itemCount})
            </h3>

            {/* Empty Cart */}
            {!cart || !cart.items || cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCartIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
                <Link
                  to="/shops"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                  {cart.items.map((item) => (
                    <MiniCartItem
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onUpdateQuantity={handleUpdateQuantity}
                      isLoading={loading}
                    />
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      Total: ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      to="/cart"
                      onClick={() => setIsOpen(false)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      View Cart
                    </Link>
                    <Link
                      to="/checkout"
                      onClick={() => setIsOpen(false)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      Checkout
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Mini Cart Item Component
interface MiniCartItemProps {
  item: CartItem;
  onRemove: (itemId: number) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  isLoading: boolean;
}

const MiniCartItem: React.FC<MiniCartItemProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
  isLoading
}) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {item.product.image ? (
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <ShoppingCartIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {item.product.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {item.shop.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={isLoading || item.quantity <= 1}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <MinusIcon className="w-3 h-3" />
            </button>
            <span className="text-xs font-medium text-gray-900 dark:text-white min-w-[1.5rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isLoading || item.quantity >= item.product.quantity}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              ${item.total_price.toFixed(2)}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              disabled={isLoading}
              className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 disabled:opacity-50"
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
