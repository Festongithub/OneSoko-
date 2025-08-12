import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';

interface CartIconProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  animate?: boolean;
}

const CartIcon: React.FC<CartIconProps> = ({
  className = '',
  iconSize = 'md',
  showCount = true,
  animate = true
}) => {
  const { itemCount, loading } = useCart();

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const containerClasses = `relative inline-flex items-center ${className}`;
  const iconClasses = `${iconSizes[iconSize]} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors`;

  return (
    <Link to="/cart" className={containerClasses}>
      <div className="relative">
        <ShoppingCartIcon className={iconClasses} />
        
        {/* Cart count badge */}
        {showCount && itemCount > 0 && (
          <span 
            className={`
              absolute -top-2 -right-2 
              inline-flex items-center justify-center 
              px-2 py-1 
              text-xs font-bold 
              leading-none 
              text-white 
              bg-red-600 
              rounded-full 
              transform
              ${animate ? 'animate-pulse' : ''}
              ${loading ? 'opacity-50' : ''}
            `}
            style={{ minWidth: '1.25rem', minHeight: '1.25rem' }}
          >
            {loading ? '...' : itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;
