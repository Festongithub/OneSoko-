import React, { useState, useEffect } from 'react';
import { cartAPI, productsAPI, shopsAPI } from '../services/api';
import { Cart, Product, Shop } from '../types';
import AddToCartButton from '../components/AddToCartButton';
import ProductCard from '../components/ProductCard';

const CartTestPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      setLoading(true);
      
      // Load initial data
      const [cartData, productsData, shopsData] = await Promise.all([
        cartAPI.getCart(),
        productsAPI.getAll(),
        shopsAPI.getAll()
      ]);
      
      setCart(cartData);
      setProducts(Array.isArray(productsData) ? productsData : productsData.results || []);
      setShops(Array.isArray(shopsData) ? shopsData : []);
      
      addTestResult('✅ Successfully loaded initial data');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMsg);
      addTestResult(`❌ Error loading data: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAddToCart = async () => {
    if (products.length === 0 || shops.length === 0) {
      addTestResult('❌ No products or shops available for testing');
      return;
    }

    try {
      const product = products[0];
      const shop = shops[0];
      
      addTestResult(`🧪 Testing add to cart: ${product.name} from ${shop.name}`);
      
      const updatedCart = await cartAPI.addToCart(product.productId, shop.shopId, 1);
      setCart(updatedCart);
      
      addTestResult(`✅ Successfully added ${product.name} to cart`);
      addTestResult(`📊 Cart now has ${updatedCart.total_items} items, total: $${updatedCart.total_price}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add to cart';
      addTestResult(`❌ Add to cart failed: ${errorMsg}`);
    }
  };

  const testUpdateQuantity = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      addTestResult('❌ No cart items to update');
      return;
    }

    try {
      const item = cart.items[0];
      const newQuantity = item.quantity + 1;
      
      addTestResult(`🧪 Testing quantity update: ${item.product.name} to ${newQuantity}`);
      
      const updatedCart = await cartAPI.updateCartItem(item.id, newQuantity);
      setCart(updatedCart);
      
      addTestResult(`✅ Successfully updated quantity to ${newQuantity}`);
      addTestResult(`📊 Cart total: $${updatedCart.total_price}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update quantity';
      addTestResult(`❌ Update quantity failed: ${errorMsg}`);
    }
  };

  const testRemoveItem = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      addTestResult('❌ No cart items to remove');
      return;
    }

    try {
      const item = cart.items[0];
      
      addTestResult(`🧪 Testing item removal: ${item.product.name}`);
      
      const updatedCart = await cartAPI.removeFromCart(item.id);
      setCart(updatedCart);
      
      addTestResult(`✅ Successfully removed ${item.product.name}`);
      addTestResult(`📊 Cart now has ${updatedCart.total_items} items`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to remove item';
      addTestResult(`❌ Remove item failed: ${errorMsg}`);
    }
  };

  const testClearCart = async () => {
    try {
      addTestResult('🧪 Testing clear cart');
      
      const updatedCart = await cartAPI.clearCart();
      setCart(updatedCart);
      
      addTestResult('✅ Successfully cleared cart');
      addTestResult(`📊 Cart is now empty`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to clear cart';
      addTestResult(`❌ Clear cart failed: ${errorMsg}`);
    }
  };

  const refreshCart = async () => {
    try {
      addTestResult('🔄 Refreshing cart data');
      const cartData = await cartAPI.getCart();
      setCart(cartData);
      addTestResult('✅ Cart data refreshed');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to refresh cart';
      addTestResult(`❌ Refresh failed: ${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Cart Functionality Test
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Status */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Current Cart
              </h2>
              
              {cart ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Items:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cart.total_items || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${(cart.total_price || 0).toFixed(2)}</span>
                  </div>
                  
                  {cart.items && cart.items.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Items:</h3>
                      <div className="space-y-2">
                        {cart.items.map((item) => (
                          <div key={item.id} className="text-xs text-gray-600 dark:text-gray-400">
                            {item.product.name} x{item.quantity} = ${item.total_price.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
              )}

              {/* Test Buttons */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={testAddToCart}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Test Add to Cart
                </button>
                <button
                  onClick={testUpdateQuantity}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Test Update Quantity
                </button>
                <button
                  onClick={testRemoveItem}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Test Remove Item
                </button>
                <button
                  onClick={testClearCart}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Test Clear Cart
                </button>
                <button
                  onClick={refreshCart}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Refresh Cart
                </button>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Results
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No test results yet. Run some tests using the buttons on the left.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <div key={index} className="text-sm font-mono text-gray-800 dark:text-gray-200">
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setTestResults([])}
                className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear Results
              </button>
            </div>

            {/* Sample Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sample Products (First 3)
              </h2>
              
              {products.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No products available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 3).map((product) => {
                    const productShop = shops.find(shop => 
                      shop.shopId === product.shop?.shopId || 
                      shop.products?.some((p: any) => p.productId === product.productId)
                    ) || shops[0]; // Fallback to first shop
                    
                    return (
                      <div key={product.productId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${(product.promotional_price || product.price).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Stock: {product.quantity}
                          </span>
                        </div>
                        
                        {productShop && (
                          <AddToCartButton
                            product={product}
                            shop={productShop}
                            size="sm"
                            className="w-full"
                            onSuccess={() => addTestResult(`✅ Added ${product.name} to cart via button`)}
                            onError={(error) => addTestResult(`❌ Button add failed: ${error}`)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartTestPage;
