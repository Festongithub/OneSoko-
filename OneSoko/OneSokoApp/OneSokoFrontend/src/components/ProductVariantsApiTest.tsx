import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { productVariantsAPI, productsAPI } from '../services/api';
import { ProductVariant, Product } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const ProductVariantsApiTest: React.FC = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Form states
  const [variantForm, setVariantForm] = useState({
    product: '',
    name: '',
    value: '',
    price_adjustment: 0,
    quantity: 0
  });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [stats, setStats] = useState<any>(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  // Test 1: Get All Variants
  const testGetAllVariants = useCallback(async () => {
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
      const result = await productVariantsAPI.getAll();
      setVariants(result);
      addTestResult({
        success: true,
        message: `Successfully fetched ${result.length} variants`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch variants',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Test 2: Get My Product Variants
  const testGetMyProductVariants = async () => {
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
      const result = await productVariantsAPI.getMyProductVariants();
      setVariants(result);
      addTestResult({
        success: true,
        message: `Successfully fetched ${result.length} of your product variants`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch my product variants',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Get Variants by Product
  const testGetVariantsByProduct = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    if (!selectedProductId) {
      addTestResult({
        success: false,
        message: 'Product ID required',
        error: 'Please select a product first'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await productVariantsAPI.getByProduct(selectedProductId);
      addTestResult({
        success: true,
        message: `Successfully fetched ${result.length} variants for product`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch variants by product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Create Variant
  const testCreateVariant = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    if (!variantForm.product || !variantForm.name || !variantForm.value) {
      addTestResult({
        success: false,
        message: 'Missing required fields',
        error: 'Please fill in product, name, and value fields'
      });
      return;
    }

    try {
      setLoading(true);
      const selectedProduct = products.find(p => p.productId === variantForm.product);
      if (!selectedProduct) {
        throw new Error('Selected product not found');
      }

      const variantData = {
        product: selectedProduct.productId,
        name: variantForm.name,
        value: variantForm.value,
        price_adjustment: variantForm.price_adjustment,
        quantity: variantForm.quantity
      };

      const result = await productVariantsAPI.create(variantData);
      setVariants(prev => [...prev, result]);
      addTestResult({
        success: true,
        message: 'Successfully created variant',
        data: result
      });
      // Reset form
      setVariantForm({
        product: '',
        name: '',
        value: '',
        price_adjustment: 0,
        quantity: 0
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to create variant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Get Low Stock Variants
  const testGetLowStockVariants = async () => {
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
      const result = await productVariantsAPI.getLowStock();
      addTestResult({
        success: true,
        message: `Found ${result.length} variants with low stock`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch low stock variants',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 6: Get Out of Stock Variants
  const testGetOutOfStockVariants = async () => {
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
      const result = await productVariantsAPI.getOutOfStock();
      addTestResult({
        success: true,
        message: `Found ${result.length} variants out of stock`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch out of stock variants',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 7: Get Variant Stats
  const testGetVariantStats = async () => {
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
      const result = await productVariantsAPI.getStats();
      setStats(result);
      addTestResult({
        success: true,
        message: 'Successfully fetched variant statistics',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch variant stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 8: Update Variant Quantity
  const testUpdateVariantQuantity = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    if (variants.length === 0) {
      addTestResult({
        success: false,
        message: 'No variants available',
        error: 'Please fetch variants first'
      });
      return;
    }

    const variant = variants[0];
    const newQuantity = variant.quantity + 1;

    try {
      setLoading(true);
      const result = await productVariantsAPI.updateQuantity(variant.id, newQuantity);
      setVariants(prev => prev.map(v => v.id === variant.id ? result : v));
      addTestResult({
        success: true,
        message: `Successfully updated variant quantity to ${newQuantity}`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to update variant quantity',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 9: Update Variant Price Adjustment
  const testUpdateVariantPriceAdjustment = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    if (variants.length === 0) {
      addTestResult({
        success: false,
        message: 'No variants available',
        error: 'Please fetch variants first'
      });
      return;
    }

    const variant = variants[0];
    const newPriceAdjustment = variant.price_adjustment + 1;

    try {
      setLoading(true);
      const result = await productVariantsAPI.updatePriceAdjustment(variant.id, newPriceAdjustment);
      setVariants(prev => prev.map(v => v.id === variant.id ? result : v));
      addTestResult({
        success: true,
        message: `Successfully updated variant price adjustment to ${newPriceAdjustment}`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to update variant price adjustment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 10: Delete Variant
  const testDeleteVariant = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    if (variants.length === 0) {
      addTestResult({
        success: false,
        message: 'No variants available',
        error: 'Please fetch variants first'
      });
      return;
    }

    const variant = variants[0];

    try {
      setLoading(true);
      await productVariantsAPI.delete(variant.id);
      setVariants(prev => prev.filter(v => v.id !== variant.id));
      addTestResult({
        success: true,
        message: 'Successfully deleted variant',
        data: { deleted_id: variant.id }
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to delete variant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = useCallback(async () => {
    try {
      const result = await productsAPI.getMyProducts();
      setProducts(result);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      testGetMyProductVariants();
      fetchProducts();
    }
  }, [isAuthenticated, testGetMyProductVariants, fetchProducts]);

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
                  Please log in to access the ProductVariants API testing features.
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
            ProductVariants API Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all ProductVariants-related API endpoints and monitor results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            {/* Basic Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Tests
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={testGetAllVariants}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <CubeIcon className="w-4 h-4 mr-2" />
                  Get All Variants
                </button>

                <button
                  onClick={testGetMyProductVariants}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <CubeIcon className="w-4 h-4 mr-2" />
                  Get My Product Variants
                </button>

                <button
                  onClick={testGetVariantStats}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Get Variant Stats
                </button>
              </div>
            </div>

            {/* Stock Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Stock Management Tests
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={testGetLowStockVariants}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  Get Low Stock Variants
                </button>

                <button
                  onClick={testGetOutOfStockVariants}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Get Out of Stock Variants
                </button>

                <button
                  onClick={testUpdateVariantQuantity}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Update Variant Quantity
                </button>

                <button
                  onClick={testUpdateVariantPriceAdjustment}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Update Price Adjustment
                </button>
              </div>
            </div>

            {/* Product-specific Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Product-specific Tests
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={!isAuthenticated}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.productId} value={product.productId}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={testGetVariantsByProduct}
                  disabled={loading || !isAuthenticated || !selectedProductId}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                  Get Variants by Product
                </button>
              </div>
            </div>

            {/* CRUD Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                CRUD Operations
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product
                  </label>
                  <select
                    value={variantForm.product}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, product: e.target.value }))}
                    disabled={!isAuthenticated}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.productId} value={product.productId}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={variantForm.name}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isAuthenticated}
                    placeholder="e.g., Size"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variant Value
                  </label>
                  <input
                    type="text"
                    value={variantForm.value}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, value: e.target.value }))}
                    disabled={!isAuthenticated}
                    placeholder="e.g., Large"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price Adjustment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={variantForm.price_adjustment}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                      disabled={!isAuthenticated}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variantForm.quantity}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      disabled={!isAuthenticated}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={testCreateVariant}
                    disabled={loading || !isAuthenticated || !variantForm.product || !variantForm.name || !variantForm.value}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Variant
                  </button>

                  <button
                    onClick={testDeleteVariant}
                    disabled={loading || !isAuthenticated || variants.length === 0}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete First Variant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results and Data Display */}
          <div className="space-y-6">
            {/* Test Results */}
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
                          <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
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

            {/* Current Variants */}
            {variants.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Current Variants ({variants.length})
                </h2>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {variants.slice(0, 5).map((variant) => (
                    <div key={variant.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {variant.product.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {variant.name}: {variant.value}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {variant.quantity} | Price Adj: ${variant.price_adjustment}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${variant.total_price}
                          </p>
                          {variant.quantity === 0 ? (
                            <span className="text-xs text-red-600 dark:text-red-400">Out of Stock</span>
                          ) : variant.quantity <= 5 ? (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">Low Stock</span>
                          ) : (
                            <span className="text-xs text-green-600 dark:text-green-400">In Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {variants.length > 5 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Showing first 5 of {variants.length} variants
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Variant Stats */}
            {stats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Variant Statistics
                </h2>
                
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Variants</p>
                      <p className="font-medium text-gray-900 dark:text-white">{stats.total_variants}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Quantity</p>
                      <p className="font-medium text-gray-900 dark:text-white">{stats.total_quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Low Stock</p>
                      <p className="font-medium text-gray-900 dark:text-white">{stats.low_stock_count}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Out of Stock</p>
                      <p className="font-medium text-gray-900 dark:text-white">{stats.out_of_stock_count}</p>
                    </div>
                  </div>
                  
                  {stats.variants_by_name && stats.variants_by_name.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Variants by Name:</p>
                      <div className="space-y-1">
                        {stats.variants_by_name.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantsApiTest; 