import React, { useState } from 'react';
import { PlusIcon, ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../../stores/cartStore';
import type { Product, ProductVariant } from '../../types';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  quantity?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showQuantitySelector?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  variant,
  quantity: initialQuantity = 1,
  size = 'md',
  className = '',
  showQuantitySelector = false
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, toggleCart } = useCartStore();

  const handleAddToCart = () => {
    if (!product.is_active) {
      toast.error('This product is currently unavailable');
      return;
    }

    if (quantity > product.quantity) {
      toast.error(`Only ${product.quantity} items available in stock`);
      return;
    }

    addItem(product, variant, quantity);
    setIsAdded(true);
    
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
    });

    // Reset the added state after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleAddAndViewCart = () => {
    handleAddToCart();
    setTimeout(() => {
      toggleCart();
    }, 500);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1.5 text-xs min-h-[32px]';
      case 'lg':
        return 'px-5 py-3 text-base min-h-[48px]';
      default:
        return 'px-3 py-2 text-sm min-h-[40px]';
    }
  };

  const isOutOfStock = product.quantity === 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;

  if (isOutOfStock) {
    return (
      <div className="w-full">
        <button
          disabled
          className={`
            w-full ${getSizeClasses()} 
            bg-gray-200 text-gray-500 rounded-md cursor-not-allowed font-medium 
            border border-gray-300 
            flex items-center justify-center
            ${className}
          `}
        >
          Out of Stock
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* Stock Status */}
      {isLowStock && (
        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
          Only {product.quantity} left in stock!
        </p>
      )}

      {/* Quantity Selector */}
      {showQuantitySelector && (
        <div className="flex items-center space-x-2 mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Qty:</label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent flex-1 min-w-[50px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {Array.from({ length: Math.min(product.quantity, 10) }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main Add to Cart Button */}
      <div className="w-full space-y-1">
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`
            w-full ${getSizeClasses()} 
            ${isAdded 
              ? 'bg-green-600 text-white border-green-600' 
              : 'btn-primary hover:bg-primary-700 active:bg-primary-800'
            } 
            rounded-md font-medium transition-all duration-200 
            flex items-center justify-center space-x-1.5
            disabled:cursor-not-allowed
            border
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            ${className}
          `}
        >
          {isAdded ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Added!</span>
            </>
          ) : (
            <>
              <ShoppingCartIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Add to Cart</span>
            </>
          )}
        </button>

        {/* Optional Buy Now Button - Only show for larger sizes */}
        {size !== 'sm' && (
          <button
            onClick={handleAddAndViewCart}
            className={`
              w-full ${getSizeClasses()} 
              btn-secondary hover:bg-secondary-600
              rounded-md font-medium transition-all duration-200 
              flex items-center justify-center space-x-1.5
              border border-secondary-300
              focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-1
            `}
          >
            <PlusIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Buy Now</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AddToCartButton;
