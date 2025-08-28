import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon,
  ShareIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  rating?: number;
  isWishlist?: boolean;
}

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  className?: string;
}

export const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  className = ""
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlist, setIsWishlist] = useState(product.isWishlist || false);
  const [isSharing, setIsSharing] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API call
    onAddToCart?.(product.id);
    setIsAdding(false);
  };

  const handleToggleWishlist = () => {
    setIsWishlist(!isWishlist);
    onToggleWishlist?.(product.id);
  };

  const handleShare = async () => {
    setIsSharing(true);
    // Simulate share action
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSharing(false);
  };

  return (
    <div className={`group relative bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-elevated border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-all duration-300 ${className}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                isWishlist 
                  ? 'bg-error-500 text-white shadow-elevated' 
                  : 'bg-white/90 text-neutral-700 hover:bg-white shadow-sm'
              }`}
            >
              {isWishlist ? (
                <HeartSolid className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </button>

            {/* Quick View */}
            <button
              onClick={() => onQuickView?.(product.id)}
              className="p-2 bg-white/90 text-neutral-700 rounded-full hover:bg-white shadow-sm backdrop-blur-sm transition-all duration-200"
            >
              <EyeIcon className="w-4 h-4" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 text-neutral-700 rounded-full hover:bg-white shadow-sm backdrop-blur-sm transition-all duration-200"
            >
              {isSharing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShareIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Add to Cart Button */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 shadow-elevated disabled:opacity-75"
          >
            {isAdding ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCartIcon className="w-4 h-4" />
                <span>Add to Cart</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <Link 
            to={`/products/${product.id}`}
            className="text-sm font-medium text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500">({product.rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {product.price}
          </span>
          <div className="text-xs text-neutral-500">
            Free shipping
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
