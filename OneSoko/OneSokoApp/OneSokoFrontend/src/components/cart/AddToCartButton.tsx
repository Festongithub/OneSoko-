import React, { useState } from 'react';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cartAPI } from '../../services/api';
import { Product, Shop } from '../../types';
import { useNavigate } from 'react-router-dom';

interface AddToCartButtonProps {
  product: Product;
  shop: Shop;
  quantity?: number;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  requireAuth?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  shop,
  quantity = 1,
  className = '',
  onSuccess,
  onError,
  requireAuth = true
}) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // Require authentication by default
      if (requireAuth && !localStorage.getItem('access_token')) {
        navigate('/login');
        return;
      }

      await cartAPI.addToCart(product.productId, shop.shopId, quantity);
      setAdded(true);
      onSuccess?.();

      // Notify listeners (e.g., CartBadge) to refresh counts
      window.dispatchEvent(new CustomEvent('cart:updated'));
      
      // Reset added state after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !product.is_active || product.quantity < quantity;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors
        ${added
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-primary-600 text-white hover:bg-primary-700'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      ) : added ? (
        <CheckIcon className="w-4 h-4 mr-2" />
      ) : (
        <ShoppingCartIcon className="w-4 h-4 mr-2" />
      )}
      
      {loading ? 'Adding...' : added ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  );
};

export default AddToCartButton; 