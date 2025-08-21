import React, { useState } from 'react';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  EyeIcon, 
  StarIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  shop: {
    name: string;
    verified: boolean;
  };
  inStock: boolean;
  discount?: number;
  isNew?: boolean;
  tags?: string[];
}

interface InteractiveProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (productId: string) => void;
  onShare: (productId: string) => void;
  isInWishlist?: boolean;
  className?: string;
}

export const InteractiveProductCard: React.FC<InteractiveProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onShare,
  isInWishlist = false,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className={`group relative bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-700">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}
        
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{discountPercentage}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              NEW
            </span>
          )}
          {!product.inStock && (
            <span className="px-2 py-1 bg-neutral-500 text-white text-xs font-bold rounded-full">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Action Buttons - Show on Hover */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
          >
            {isInWishlist ? (
              <HeartSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400 hover:text-red-500" />
            )}
          </button>
          
          <button
            onClick={() => onQuickView(product.id)}
            className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
          >
            <EyeIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400 hover:text-primary-500" />
          </button>
          
          <button
            onClick={() => onShare(product.id)}
            className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
          >
            <ShareIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400 hover:text-blue-500" />
          </button>
        </div>

        {/* Quick Add Button - Show on Hover */}
        <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={() => onAddToCart(product.id)}
            disabled={!product.inStock}
            className={`w-full py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              product.inStock
                ? 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg'
                : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCartIcon className="h-4 w-4" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Shop Info */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {product.shop.name}
          </span>
          {product.shop.verified && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ✓
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-neutral-300 dark:text-neutral-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-neutral-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-neutral-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 2 && (
              <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                +{product.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5 rounded-2xl transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
};
