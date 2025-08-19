import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import wishlistApi from '../../services/wishlistApi.ts';
import type { WishlistResponse, WishlistStats } from '../../services/wishlistApi.ts';

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading your wishlist...</span>
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
    <p className="text-gray-500 mb-6">Start adding products you love to keep track of them!</p>
    <button 
      onClick={() => window.location.href = '/products'}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
    >
      Browse Products
    </button>
  </div>
);

// Wishlist Item Component
interface WishlistItemProps {
  product: any;
  onRemove: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ product, onRemove, onAddToCart }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(product.id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={product.image || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-md"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-semibold text-blue-600">
              ${parseFloat(product.price || 0).toFixed(2)}
            </span>
            
            <div className="flex gap-2">
              {/* Add to Cart Button */}
              {onAddToCart && (
                <button
                  onClick={() => onAddToCart(product.id)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              )}
              
              {/* Remove Button */}
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-sm text-red-600 hover:text-red-800 px-2 py-1 disabled:opacity-50"
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  stats: WishlistStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
    <h2 className="text-xl font-semibold mb-4">Wishlist Summary</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.total_items}</div>
        <div className="text-sm opacity-90">Total Items</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">${stats.total_value.toFixed(2)}</div>
        <div className="text-sm opacity-90">Total Value</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.available_items}</div>
        <div className="text-sm opacity-90">Available</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.categories_count}</div>
        <div className="text-sm opacity-90">Categories</div>
      </div>
    </div>
  </div>
);

// Main WishlistPage Component
export const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null);
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist data
  const loadWishlistData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [wishlistData, statsData] = await Promise.all([
        wishlistApi.getWishlist(),
        wishlistApi.getStats()
      ]);
      
      setWishlist(wishlistData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load wishlist');
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const handleRemoveItem = async (productId: string) => {
    try {
      await wishlistApi.removeProduct(productId);
      await loadWishlistData(); // Reload data
    } catch (err: any) {
      console.error('Error removing item:', err);
      setError('Failed to remove item from wishlist');
    }
  };

  // Add item to cart (placeholder - implement based on your cart system)
  const handleAddToCart = async (productId: string) => {
    try {
      // Implement cart API call here
      console.log('Adding to cart:', productId);
      // Example: await cartApi.addProduct(productId);
      alert('Added to cart!'); // Replace with proper notification
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart'); // Replace with proper error handling
    }
  };

  // Clear entire wishlist
  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      await wishlistApi.clearWishlist();
      await loadWishlistData(); // Reload data
    } catch (err: any) {
      console.error('Error clearing wishlist:', err);
      setError('Failed to clear wishlist');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlistData();
    }
  }, [isAuthenticated]);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your wishlist</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Keep track of products you love</p>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <button 
              onClick={loadWishlistData}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && wishlist && stats && (
          <>
            {/* Stats Card */}
            <StatsCard stats={stats} />

            {/* Wishlist Items */}
            {wishlist.wishlist.products.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {wishlist.total_items} {wishlist.total_items === 1 ? 'Item' : 'Items'}
                  </h2>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleClearWishlist}
                      className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => window.location.href = '/products'}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid gap-4">
                  {wishlist.wishlist.products.map((product: any) => (
                    <WishlistItem
                      key={product.id}
                      product={product}
                      onRemove={handleRemoveItem}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};