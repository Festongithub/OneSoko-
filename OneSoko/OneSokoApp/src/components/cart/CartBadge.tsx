import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { cartAPI } from '../../services/api';

const CartBadge: React.FC = () => {
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartItemCount();

    // Refresh when cart updates elsewhere
    const onCartUpdated = () => fetchCartItemCount();
    window.addEventListener('cart:updated', onCartUpdated);

    return () => {
      window.removeEventListener('cart:updated', onCartUpdated);
    };
  }, []);

  const fetchCartItemCount = async () => {
    try {
      const count = await cartAPI.getCartItemCount();
      setItemCount(count);
    } catch (error) {
      // Silently fail - cart might not exist yet
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to="/cart"
      className="relative inline-flex items-center p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
    >
      <ShoppingCartIcon className="w-6 h-6" />
      
      {!loading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      
      <span className="sr-only">Cart ({itemCount} items)</span>
    </Link>
  );
};

export default CartBadge; 