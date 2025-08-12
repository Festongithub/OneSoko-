import React, { useState, useEffect, useCallback } from 'react';
import { 
  HeartIcon, 
  TrashIcon, 
  ShoppingCartIcon, 
  EyeIcon,
  StarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { wishlistAPI, cartAPI } from '../services/api';
import { Wishlist, Product } from '../types';

const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [removingFromWishlist, setRemovingFromWishlist] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistAPI.getMyWishlist();
      setWishlist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.productId);
    setError(null);
    
    try {
      // Get the first shop that sells this product
      const shop = product.shops[0];
      if (!shop) {
        throw new Error('No shop found for this product');
      }

      await cartAPI.addToCart(product.productId, shop.shopId, 1);

      // Show success message
      setError(null);
      // You could add a success toast here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingFromWishlist(productId);
    setError(null);
    
    try {
      await wishlistAPI.removeProduct(productId);
      // Refresh wishlist
      fetchWishlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from wishlist');
    } finally {
      setRemovingFromWishlist(null);
    }
  };

  const handleMoveAllToCart = async () => {
    if (!wishlist || wishlist.products.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      for (const product of wishlist.products) {
        const shop = product.shops[0];
        if (shop) {
          await cartAPI.addToCart(product.productId, shop.shopId, 1);
        }
      }
      
      // Clear wishlist after moving all items
      for (const product of wishlist.products) {
        await wishlistAPI.removeProduct(product.productId);
      }
      
      fetchWishlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move items to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleClearWishlist = async () => {
    if (!wishlist || wishlist.products.length === 0) return;
    
    if (!window.confirm('Are you sure you want to clear your wishlist? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      for (const product of wishlist.products) {
        await wishlistAPI.removeProduct(product.productId);
      }
      fetchWishlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear wishlist');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getProductPrice = (product: Product) => {
    if (product.promotional_price && product.promotional_price < product.price) {
      return product.promotional_price;
    }
    return product.price;
  };

  const isProductDiscounted = (product: Product) => {
    return product.promotional_price && product.promotional_price < product.price;
  };

  if (loading && !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Wishlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {wishlist ? `${wishlist.products.length} items` : 'No items in wishlist'}
              </p>
            </div>
            
            {wishlist && wishlist.products.length > 0 && (
              <div className="flex space-x-3">
                <button
                  onClick={handleMoveAllToCart}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  Move All to Cart
                </button>
                <button
                  onClick={handleClearWishlist}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Wishlist Items */}
        {!loading && wishlist && wishlist.products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.products.map((product) => (
              <div key={product.productId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Product Image */}
                <div className="aspect-w-1 aspect-h-1 w-full">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center mb-3">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${getProductPrice(product).toFixed(2)}
                    </span>
                    {isProductDiscounted(product) && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    {renderStars(4)} {/* Assuming average rating of 4 */}
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">(24)</span>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    {product.quantity > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        In Stock ({product.quantity})
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.productId}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.productId || product.quantity === 0}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-1" />
                      {addingToCart === product.productId ? 'Adding...' : 'Add to Cart'}
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(product.productId)}
                      disabled={removingFromWishlist === product.productId}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          /* Empty State */
          <div className="text-center py-12">
            <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items in wishlist</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start adding products to your wishlist to see them here.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}

        {/* Summary */}
        {wishlist && wishlist.products.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wishlist Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{wishlist.products.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {wishlist.products.filter(p => p.quantity > 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${wishlist.products.reduce((total, product) => total + getProductPrice(product), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 