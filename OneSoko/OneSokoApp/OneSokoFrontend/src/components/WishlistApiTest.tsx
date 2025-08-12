import React, { useState, useCallback } from 'react';
import { 
  HeartIcon, 
  PlusIcon, 
  TrashIcon, 
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { wishlistAPI } from '../services/api';
import { Wishlist, Product } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

const WishlistApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [testProductId, setTestProductId] = useState('test-product-id');

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test Functions
  const testGetMyWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wishlistAPI.getMyWishlist();
      setWishlist(data);
      addTestResult({
        success: true,
        message: `Successfully fetched wishlist with ${data.products.length} products`,
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch wishlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const testCreateWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wishlistAPI.create();
      setWishlist(data);
      addTestResult({
        success: true,
        message: 'Successfully created wishlist',
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to create wishlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const testAddProductToWishlist = useCallback(async () => {
    if (!wishlist) {
      addTestResult({
        success: false,
        message: 'No wishlist available',
        error: 'Please create or fetch a wishlist first'
      });
      return;
    }

    setLoading(true);
    try {
      const data = await wishlistAPI.addProduct(testProductId);
      addTestResult({
        success: true,
        message: `Successfully added product ${testProductId} to wishlist`,
        data: data
      });
      // Refresh wishlist
      testGetMyWishlist();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to add product to wishlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [wishlist, testProductId, testGetMyWishlist]);

  const testRemoveProductFromWishlist = useCallback(async () => {
    if (!wishlist) {
      addTestResult({
        success: false,
        message: 'No wishlist available',
        error: 'Please create or fetch a wishlist first'
      });
      return;
    }

    if (wishlist.products.length === 0) {
      addTestResult({
        success: false,
        message: 'No products in wishlist',
        error: 'Please add a product to wishlist first'
      });
      return;
    }

    setLoading(true);
    try {
      const productToRemove = wishlist.products[0];
      const data = await wishlistAPI.removeProduct(productToRemove.productId);
      addTestResult({
        success: true,
        message: `Successfully removed product ${productToRemove.productId} from wishlist`,
        data: data
      });
      // Refresh wishlist
      testGetMyWishlist();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to remove product from wishlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [wishlist, testGetMyWishlist]);

  const testAddMultipleProducts = useCallback(async () => {
    if (!wishlist) {
      addTestResult({
        success: false,
        message: 'No wishlist available',
        error: 'Please create or fetch a wishlist first'
      });
      return;
    }

    setLoading(true);
    try {
      const testProducts = ['product-1', 'product-2', 'product-3'];
      let successCount = 0;
      
      for (const productId of testProducts) {
        try {
          await wishlistAPI.addProduct(productId);
          successCount++;
        } catch (error) {
          console.log(`Failed to add product ${productId}:`, error);
        }
      }
      
      addTestResult({
        success: successCount > 0,
        message: `Successfully added ${successCount} out of ${testProducts.length} products to wishlist`,
        data: { successCount, totalProducts: testProducts.length }
      });
      // Refresh wishlist
      testGetMyWishlist();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to add multiple products to wishlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [wishlist, testGetMyWishlist]);

  const testClearWishlist = useCallback(async () => {
    if (!wishlist) {
      addTestResult({
        success: false,
        message: 'No wishlist available',
        error: 'Please create or fetch a wishlist first'
      });
      return;
    }

    if (wishlist.products.length === 0) {
      addTestResult({
        success: false,
        message: 'Wishlist is already empty',
        error: 'No products to remove'
      });
      return;
    }

    setLoading(true);
    try {
      const productsToRemove = [...wishlist.products];
      let successCount = 0;
      
      for (const product of productsToRemove) {
        try {
          await wishlistAPI.removeProduct(product.productId);
          successCount++;
        } catch (error) {
          console.log(`Failed to remove product ${product.productId}:`, error);
        }
      }
      
      addTestResult({
        success: successCount > 0,
        message: `Successfully removed ${successCount} out of ${productsToRemove.length} products from wishlist`,
        data: { successCount, totalProducts: productsToRemove.length }
      });
      // Refresh wishlist
      testGetMyWishlist();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to clear wishlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [wishlist, testGetMyWishlist]);

  const testWishlistOperations = useCallback(async () => {
    setLoading(true);
    try {
      // Test full workflow
      addTestResult({
        success: true,
        message: 'Starting comprehensive wishlist test workflow',
        data: { step: 'workflow_start' }
      });

      // 1. Get or create wishlist
      let currentWishlist;
      try {
        currentWishlist = await wishlistAPI.getMyWishlist();
        addTestResult({
          success: true,
          message: 'Retrieved existing wishlist',
          data: { productsCount: currentWishlist.products.length }
        });
      } catch (error) {
        currentWishlist = await wishlistAPI.create();
        addTestResult({
          success: true,
          message: 'Created new wishlist',
          data: { productsCount: 0 }
        });
      }

      // 2. Add test products
      const testProducts = ['test-product-1', 'test-product-2'];
      for (const productId of testProducts) {
        try {
          await wishlistAPI.addProduct(productId);
          addTestResult({
            success: true,
            message: `Added product ${productId} to wishlist`,
            data: { productId }
          });
        } catch (error) {
          addTestResult({
            success: false,
            message: `Failed to add product ${productId}`,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // 3. Get updated wishlist
      const updatedWishlist = await wishlistAPI.getMyWishlist();
      addTestResult({
        success: true,
        message: `Wishlist now contains ${updatedWishlist.products.length} products`,
        data: { productsCount: updatedWishlist.products.length }
      });

      // 4. Remove one product
      if (updatedWishlist.products.length > 0) {
        const productToRemove = updatedWishlist.products[0];
        await wishlistAPI.removeProduct(productToRemove.productId);
        addTestResult({
          success: true,
          message: `Removed product ${productToRemove.productId} from wishlist`,
          data: { productId: productToRemove.productId }
        });
      }

      // 5. Final wishlist state
      const finalWishlist = await wishlistAPI.getMyWishlist();
      addTestResult({
        success: true,
        message: `Workflow completed. Final wishlist has ${finalWishlist.products.length} products`,
        data: { finalProductsCount: finalWishlist.products.length }
      });

      setWishlist(finalWishlist);
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Workflow test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Wishlist API Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all Wishlist API endpoints
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={testGetMyWishlist}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Get My Wishlist
            </button>
            <button
              onClick={testCreateWishlist}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Create Wishlist
            </button>
            <button
              onClick={testAddProductToWishlist}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Add Product
            </button>
            <button
              onClick={testRemoveProductFromWishlist}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Remove Product
            </button>
            <button
              onClick={testAddMultipleProducts}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Multiple Products
            </button>
            <button
              onClick={testClearWishlist}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Clear Wishlist
            </button>
            <button
              onClick={testWishlistOperations}
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              Test Workflow
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>

          {/* Test Product ID Input */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Test Product ID:
            </label>
            <input
              type="text"
              value={testProductId}
              onChange={(e) => setTestProductId(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter product ID"
            />
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          )}
        </div>

        {/* Current Wishlist Display */}
        {wishlist && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Wishlist ({wishlist.products.length} products)
            </h3>
            {wishlist.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.products.map((product) => (
                  <div key={product.productId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {product.productId}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Price: ${product.price}</p>
                      </div>
                      <HeartIcon className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No products in wishlist</p>
            )}
          </div>
        )}

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Results ({testResults.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {result.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.message}
                    </p>
                    {result.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{result.error}</p>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                          View Data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistApiTest; 