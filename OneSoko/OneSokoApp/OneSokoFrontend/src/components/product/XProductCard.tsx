import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  ShoppingCartIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  shop: {
    name: string;
    username: string;
    verified?: boolean;
  };
  rating: number;
  reviewCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  category: string;
  description?: string;
  discount?: number;
}

interface XProductCardProps {
  product: Product;
  variant?: 'feed' | 'grid' | 'list';
  showShopInfo?: boolean;
}

const XProductCard: React.FC<XProductCardProps> = ({ 
  product, 
  variant = 'feed',
  showShopInfo = true 
}) => {
  const [isLiked, setIsLiked] = useState(product.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(product.isBookmarked || false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} on OneSoko`,
        url: window.location.href
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic
    console.log('Added to cart:', product.name);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIconSolid
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'
        }`}
      />
    ));
  };

  if (variant === 'feed') {
    return (
      <div className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors">
        {/* Shop Info */}
        {showShopInfo && (
          <div className="flex items-center space-x-2 mb-3">
            <img
              src="/api/placeholder/24/24"
              alt={product.shop.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-medium text-white text-sm">{product.shop.name}</span>
            {product.shop.verified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-gray-500 text-sm">@{product.shop.username}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">2h</span>
          </div>
        )}

        <Link to={`/products/${product.id}`} className="block">
          <div className="space-y-3">
            {/* Product Text */}
            <div>
              <h3 className="text-white font-medium text-lg mb-1">{product.name}</h3>
              {product.description && (
                <p className="text-gray-400 text-sm">{product.description}</p>
              )}
              <span className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded mt-2">
                #{product.category}
              </span>
            </div>

            {/* Product Image */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
              {product.discount && (
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{product.discount}%
                  </span>
                </div>
              )}
            </div>

            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-white">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="flex">{renderStars(product.rating)}</div>
                  <span className="text-gray-400 text-sm">({product.reviewCount})</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 max-w-md">
          <button 
            onClick={handleLike}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            {isLiked ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="text-sm">Like</span>
          </button>

          <button 
            onClick={handleAddToCart}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="text-sm">Add to Cart</span>
          </button>

          <button 
            onClick={handleBookmark}
            className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
          >
            {isBookmarked ? (
              <BookmarkIconSolid className="w-5 h-5 text-green-500" />
            ) : (
              <BookmarkIcon className="w-5 h-5" />
            )}
            <span className="text-sm">Save</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <Link 
        to={`/products/${product.id}`}
        className="block bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700"
      >
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {product.discount && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{product.discount}%
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={handleLike}
              className="p-1.5 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
            >
              {isLiked ? (
                <HeartIconSolid className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={handleBookmark}
              className="p-1.5 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkIconSolid className="w-4 h-4 text-green-500" />
              ) : (
                <BookmarkIcon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-gray-400 text-xs">({product.reviewCount})</span>
          </div>
          
          <h3 className="text-white font-medium mb-2 line-clamp-2">{product.name}</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {showShopInfo && (
                <p className="text-gray-400 text-xs mt-1">{product.shop.name}</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // List variant
  return (
    <Link 
      to={`/products/${product.id}`}
      className="flex items-center space-x-4 p-4 hover:bg-gray-900 transition-colors border-b border-gray-800"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 object-cover rounded-lg"
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{product.name}</h3>
        <div className="flex items-center space-x-1 mt-1">
          <div className="flex">{renderStars(product.rating)}</div>
          <span className="text-gray-400 text-xs">({product.reviewCount})</span>
        </div>
        {showShopInfo && (
          <p className="text-gray-400 text-xs mt-1">{product.shop.name}</p>
        )}
      </div>
      
      <div className="text-right">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-white">
            {formatPrice(product.price)}
          </span>
        </div>
        {product.originalPrice && (
          <span className="text-sm text-gray-500 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
      </div>
    </Link>
  );
};

export default XProductCard;
