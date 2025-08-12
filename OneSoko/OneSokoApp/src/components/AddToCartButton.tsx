import React, { useState } from 'react';
import { ShoppingCartIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cartAPI } from '../services/api';
import { Product, Shop } from '../types';

interface AddToCartButtonProps {
  product: Product;
  shop: Shop;
  className?: string;
  quantity?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  showIcon?: boolean;
  showText?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  shop,
  className = '',
  quantity = 1,
  size = 'md',
  variant = 'primary',
  showIcon = true,
  showText = true,
  onSuccess,
  onError
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600',
    outline: 'bg-transparent hover:bg-primary-50 text-primary-600 border-primary-600 dark:hover:bg-primary-900/20 dark:text-primary-400 dark:border-primary-400'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleAddToCart = async () => {
    if (!product.productId || !shop.shopId) {
      const errorMsg = 'Invalid product or shop information';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (product.quantity < quantity) {
      const errorMsg = 'Not enough stock available';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await cartAPI.addToCart(product.productId, shop.shopId, quantity);
      
      // Show success state
      setIsAdded(true);
      onSuccess?.();
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add item to cart';
      setError(errorMsg);
      onError?.(errorMsg);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const getButtonContent = () => {
    if (isAdding) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          {showText && <span className="ml-2">Adding...</span>}
        </>
      );
    }

    if (isAdded) {
      return (
        <>
          {showIcon && <CheckIcon className={`${iconSizes[size]} text-green-500`} />}
          {showText && <span className={showIcon ? 'ml-2' : ''}>Added!</span>}
        </>
      );
    }

    if (error) {
      return (
        <>
          {showIcon && <ExclamationTriangleIcon className={`${iconSizes[size]} text-red-500`} />}
          {showText && <span className={showIcon ? 'ml-2' : ''}>Error</span>}
        </>
      );
    }

    return (
      <>
        {showIcon && <ShoppingCartIcon className={iconSizes[size]} />}
        {showText && <span className={showIcon ? 'ml-2' : ''}>Add to Cart</span>}
      </>
    );
  };

  const getButtonClasses = () => {
    let classes = `inline-flex items-center justify-center border rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`;
    
    if (error) {
      classes += ' bg-red-50 hover:bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-600';
    } else if (isAdded) {
      classes += ' bg-green-50 hover:bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 dark:border-green-600';
    } else {
      classes += ` ${variantClasses[variant]}`;
    }
    
    return classes;
  };

  const isDisabled = isAdding || product.quantity < quantity || !product.is_active;

  return (
    <div className="relative">
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={getButtonClasses()}
        title={
          !product.is_active 
            ? 'Product is not available'
            : product.quantity < quantity 
            ? 'Not enough stock'
            : 'Add to cart'
        }
      >
        {getButtonContent()}
      </button>
      
      {/* Stock indicator */}
      {product.quantity < 10 && product.quantity > 0 && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
            {product.quantity} left
          </span>
        </div>
      )}
      
      {product.quantity === 0 && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Out of stock
          </span>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
