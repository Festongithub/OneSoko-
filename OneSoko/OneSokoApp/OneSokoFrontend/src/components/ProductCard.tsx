import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  HeartIcon,
  EyeIcon,
  ShoppingCartIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import AddToCartButton from './AddToCartButton';
import { Product, Shop } from '../types';
import { config } from '../config/environment';

interface ProductCardProps {
  product: Product;
  shop: Shop;
  className?: string;
  showShopInfo?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  shop,
  className = '',
  showShopInfo = true,
  size = 'md'
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Helper function to get full image URL
  const getFullImageUrl = (imageUrl: string | null): string | null => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return `${config.BACKEND_URL}${imageUrl}`;
    }
    
    return `${config.BACKEND_URL}/${imageUrl}`;
  };

  const sizeClasses = {
    sm: {
      container: 'max-w-xs',
      image: 'h-32',
      title: 'text-sm',
      price: 'text-lg',
      description: 'text-xs'
    },
    md: {
      container: 'max-w-sm',
      image: 'h-48',
      title: 'text-base',
      price: 'text-xl',
      description: 'text-sm'
    },
    lg: {
      container: 'max-w-md',
      image: 'h-64',
      title: 'text-lg',
      price: 'text-2xl',
      description: 'text-base'
    }
  };

  const currentSizeClasses = sizeClasses[size];

  const handleWishlistToggle = async () => {
    // TODO: Implement wishlist functionality
    setIsInWishlist(!isInWishlist);
  };

  const hasDiscount = product.promotional_price && product.promotional_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - (product.promotional_price || 0)) / product.price) * 100)
    : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group ${currentSizeClasses.container} ${className}`}>
      {/* Product Image */}
      <div className={`relative ${currentSizeClasses.image} bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
        {product.image && !imageError ? (
          <img
            src={getFullImageUrl(product.image) || ''}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCartIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <TagIcon className="w-3 h-3 mr-1" />
              {discountPercentage}% OFF
            </span>
          </div>
        )}

        {/* Stock Status */}
        {product.quantity === 0 && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={handleWishlistToggle}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isInWishlist ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            to={`/products/${product.productId}`}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            <EyeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 ${currentSizeClasses.title}`}>
          <Link 
            to={`/products/${product.productId}`}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {/* Product Description */}
        <p className={`text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 ${currentSizeClasses.description}`}>
          {product.description}
        </p>

        {/* Shop Info */}
        {showShopInfo && (
          <div className="mb-3">
            <Link
              to={`/shops/${shop.slug}`}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {shop.name}
            </Link>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-4 h-4 ${
                  star <= 4 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            4.0 (24 reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-gray-900 dark:text-white ${currentSizeClasses.price}`}>
              ${hasDiscount ? (product.promotional_price || 0).toFixed(2) : product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Stock indicator */}
          <div className="text-right">
            {product.quantity > 0 && product.quantity < 10 && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                Only {product.quantity} left
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <AddToCartButton
          product={product}
          shop={shop}
          className="w-full"
          size={size === 'sm' ? 'sm' : 'md'}
          variant="primary"
        />

        {/* Product Categories/Tags */}
        {product.category && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <TagIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {typeof product.category === 'string' ? product.category : product.category.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
