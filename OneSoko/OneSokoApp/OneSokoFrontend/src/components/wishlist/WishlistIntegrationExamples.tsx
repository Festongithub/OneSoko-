import React from 'react';
import { WishlistButton } from './WishlistButton';

// Example component showing how to integrate WishlistButton into product cards
interface ProductCardProps {
  product: {
    productId: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
}

export const ProductCardWithWishlist: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative">
        <img
          src={product.image || '/placeholder-image.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        
        {/* Wishlist Button - positioned in top right corner */}
        <div className="absolute top-2 right-2">
          <WishlistButton 
            productId={product.productId}
            size="md"
            className="bg-white bg-opacity-90 p-2 rounded-full shadow-sm hover:bg-opacity-100"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          
          {/* Alternative: Wishlist button with text */}
          <WishlistButton 
            productId={product.productId}
            showText={true}
            size="sm"
            className="text-sm"
          />
        </div>
        
        <div className="mt-3 flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Add to Cart
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Example of a wishlist counter component for the header
export const WishlistCounter: React.FC = () => {
  // This would typically use a context or hook to get the wishlist count
  const [wishlistCount, setWishlistCount] = React.useState(0);
  
  React.useEffect(() => {
    // Load wishlist count from API
    // This is a placeholder - you'd implement this based on your auth system
    const loadWishlistCount = async () => {
      try {
        // const response = await wishlistApi.getStats();
        // setWishlistCount(response.total_items);
        setWishlistCount(3); // Placeholder
      } catch (error) {
        console.error('Error loading wishlist count:', error);
      }
    };
    
    loadWishlistCount();
  }, []);

  return (
    <div className="relative">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      
      {wishlistCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {wishlistCount}
        </span>
      )}
    </div>
  );
};
