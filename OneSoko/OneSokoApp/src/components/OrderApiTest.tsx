import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBagIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ordersAPI, productsAPI, shopsAPI } from '../services/api';
import { Order, Product, Shop, CreateOrder } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const OrderApiTest: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    shop_id: '',
    products: [{ product_id: '', quantity: 1 }]
  });

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const [ordersData, productsData, shopsData] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
        shopsAPI.getAll()
      ]);
      setOrders(ordersData);
      setProducts(productsData.results || productsData);
      setShops(Array.isArray(shopsData) ? shopsData : []);
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch initial data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, fetchInitialData]);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  // Test 0: Test API Connection (Public endpoint)
  const testApiConnection = async () => {
    try {
      setLoading(true);
      // Test with a public endpoint (shop search)
      const result = await shopsAPI.search('test', '');
      addTestResult({
        success: true,
        message: `API connection successful. Found ${result.length} shops in search results.`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'API connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 1: Get All Orders
  const testGetAllOrders = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await ordersAPI.getAll();
      setOrders(result);
      addTestResult({
        success: true,
        message: `Successfully fetched ${result.length} orders`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Get Order Details
  const testGetOrderDetails = async (orderId: number) => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await ordersAPI.getById(orderId);
      setSelectedOrder(result);
      addTestResult({
        success: true,
        message: `Successfully fetched order details for order #${orderId}`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Failed to fetch order details for order #${orderId}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Create Order from Cart
  const testCreateOrderFromCart = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await ordersAPI.createFromCart();
      setOrders(prev => [...result, ...prev]);
      addTestResult({
        success: true,
        message: `Successfully created ${result.length} orders from cart`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to create order from cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Create Direct Order
  const testCreateDirectOrder = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const orderData: CreateOrder = {
        shop_id: newOrderData.shop_id,
        items: newOrderData.products.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity
        }))
      };
      
      const result = await ordersAPI.create(orderData);
      setOrders(prev => [result, ...prev]);
      addTestResult({
        success: true,
        message: `Successfully created order #${result.id}`,
        data: result
      });
      
      // Reset form
      setNewOrderData({
        shop_id: '',
        products: [{ product_id: '', quantity: 1 }]
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to create direct order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Update Order Status
  const testUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? result : order
      ));
      addTestResult({
        success: true,
        message: `Successfully updated order #${orderId} status to ${newStatus}`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Failed to update order #${orderId} status`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 6: Get Order Details (Alternative endpoint)
  const testGetOrderDetailsAlt = async (orderId: number) => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await ordersAPI.getOrderDetails(orderId);
      addTestResult({
        success: true,
        message: `Successfully fetched order details (alt) for order #${orderId}`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Failed to fetch order details (alt) for order #${orderId}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const addProductToOrder = () => {
    setNewOrderData(prev => ({
      ...prev,
      products: [...prev.products, { product_id: '', quantity: 1 }]
    }));
  };

  const removeProductFromOrder = (index: number) => {
    setNewOrderData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const updateProductInOrder = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    setNewOrderData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Authentication Warning */}
        {!isAuthenticated && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Authentication Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please log in to access the Order API testing features. All API endpoints require authentication.
                </p>
                <div className="mt-3">
                  <a
                    href="/login"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700"
                  >
                    Go to Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order API Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all order-related API endpoints and monitor results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                API Test Controls
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={testApiConnection}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Test API Connection
                </button>

                <button
                  onClick={testGetAllOrders}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Test Get All Orders
                </button>

                <button
                  onClick={testCreateOrderFromCart}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <ShoppingBagIcon className="w-4 h-4 mr-2" />
                  Test Create Order from Cart
                </button>

                <button
                  onClick={fetchInitialData}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Create Direct Order Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create Direct Order
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Shop
                  </label>
                  <select
                    value={newOrderData.shop_id}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, shop_id: e.target.value }))}
                    disabled={!isAuthenticated}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a shop</option>
                    {shops.map(shop => (
                      <option key={shop.shopId} value={shop.shopId}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Products
                  </label>
                  {newOrderData.products.map((product, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <select
                        value={product.product_id}
                        onChange={(e) => updateProductInOrder(index, 'product_id', e.target.value)}
                        disabled={!isAuthenticated}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select a product</option>
                        {products.map(p => (
                          <option key={p.productId} value={p.productId}>
                            {p.name} - ${p.price}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProductInOrder(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        disabled={!isAuthenticated}
                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={() => removeProductFromOrder(index)}
                        disabled={!isAuthenticated}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addProductToOrder}
                    disabled={!isAuthenticated}
                    className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Product
                  </button>
                </div>

                <button
                  onClick={testCreateDirectOrder}
                  disabled={loading || !isAuthenticated || !newOrderData.shop_id || newOrderData.products.some(p => !p.product_id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Test Create Direct Order
                </button>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Test Results
                </h2>
                <button
                  onClick={clearTestResults}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No test results yet. Run some tests to see results here.
                  </p>
                ) : (
                  testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start">
                        {result.success ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {result.message}
                          </p>
                          {result.error && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              Error: {result.error}
                            </p>
                          )}
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                                View Response Data
                              </summary>
                              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Orders ({orders.length})
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No orders found. Create some orders to see them here.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Order #{order.id}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => testGetOrderDetails(order.id)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <EyeIcon className="w-3 h-3 mr-1" />
                      Details
                    </button>
                    <button
                      onClick={() => testGetOrderDetailsAlt(order.id)}
                      className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <EyeIcon className="w-3 h-3 mr-1" />
                      Details (Alt)
                    </button>
                    <select
                      onChange={(e) => testUpdateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="">Update Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>Shop: {order.shop.name}</p>
                    <p>Items: {order.total_items}</p>
                    <p>Created: {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Order Details */}
        {selectedOrder && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selected Order Details
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Information</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                  <p><strong>Items:</strong> {selectedOrder.total_items}</p>
                  <p><strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Shop Information</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Name:</strong> {selectedOrder.shop.name}</p>
                  <p><strong>Location:</strong> {selectedOrder.shop.location}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shop.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.shop.email || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Items</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${item.total_price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderApiTest; 