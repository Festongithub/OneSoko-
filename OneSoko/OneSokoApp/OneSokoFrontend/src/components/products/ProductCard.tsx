import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon,
  EyeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Product, Shop } from '../../types';
import { wishlistAPI } from '../../services/api';
import AddToCartButton from '../cart/AddToCartButton';
import ProductInquiry from '../messaging/ProductInquiry';

interface ProductCardProps {
  product: Product;
  shop: Shop;
  showShopInfo?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  shop, 
  showShopInfo = true,
  className = '' 
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  const handleToggleWishlist = async () => {
    if (!localStorage.getItem('access_token')) {
      // Redirect to login if not authenticated
      return;
    }

    setIsLoading(true);
    try {
      if (isWishlisted) {
        await wishlistAPI.removeProduct(product.productId);
        setIsWishlisted(false);
      } else {
        await wishlistAPI.addProduct(product.productId);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscountedPrice = () => {
    const basePrice = product.promotional_price || product.price;
    return basePrice * (1 - product.discount / 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ${className}`}>
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleToggleWishlist}
            disabled={isLoading}
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
          
          <Link
            to={`/products/${product.productId}`}
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="w-4 h-4 text-gray-600" />
          </Link>
        </div>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}

        {/* Stock Status */}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Shop Info */}
        {showShopInfo && (
          <Link
            to={`/shops/${shop.slug}`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-2 block"
          >
            {shop.name}
          </Link>
        )}

        {/* Product Name */}
        <Link to={`/products/${product.productId}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(calculateDiscountedPrice())}
          </span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.promotional_price || product.price)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-4 h-4 ${
                  star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">(24 reviews)</span>
        </div>

        {/* Add to Cart Button */}
        <div className="space-y-2">
          <AddToCartButton
            product={product}
            shop={shop}
            quantity={1}
            className="w-full py-2"
          />
          
          {/* Ask Question Button */}
          <button
            onClick={() => setShowInquiry(true)}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
            Ask Question
          </button>
        </div>
      </div>

      {/* Product Inquiry Modal */}
      <ProductInquiry
        product={product}
        shop={shop}
        isOpen={showInquiry}
        onClose={() => setShowInquiry(false)}
      />
    </div>
  );
};

export default ProductCard; 