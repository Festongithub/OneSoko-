import React, { useState, useEffect, useCallback } from 'react';
import { 
  TagIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  StarIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { categoriesAPI } from '../services/api';
import { Category, Product } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const CategoriesApiTest: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categoryStats, setCategoryStats] = useState<any>(null);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  // Test 1: Get All Categories
  const testGetAllCategories = useCallback(async () => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getAll();
      setCategories(result);
      addTestResult({
        success: true,
        message: `Successfully fetched ${result.length} categories`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Test 2: Search Categories
  const testSearchCategories = async () => {
    if (!searchQuery.trim()) {
      addTestResult({
        success: false,
        message: 'Search query is required',
        error: 'Please enter a search term'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await categoriesAPI.search(searchQuery);
      addTestResult({
        success: true,
        message: `Found ${result.length} categories matching "${searchQuery}"`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to search categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Get Category by Slug
  const testGetCategoryBySlug = async (slug: string) => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getBySlug(slug);
      setSelectedCategory(result);
      addTestResult({
        success: true,
        message: `Successfully fetched category: ${result.name}`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Failed to fetch category with slug: ${slug}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Get Category Products
  const testGetCategoryProducts = async (categoryId: number) => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getProducts(categoryId);
      setCategoryProducts(result.products);
      setSelectedCategory(result.category);
      addTestResult({
        success: true,
        message: `Found ${result.count} products in category "${result.category.name}"`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Failed to fetch products for category ID: ${categoryId}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Get Category Statistics
  const testGetCategoryStats = async () => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getStats();
      setCategoryStats(result);
      addTestResult({
        success: true,
        message: `Successfully fetched stats for ${result.total_categories} categories`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch category statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 6: Get Popular Products
  const testGetPopularProducts = async (categoryId: number) => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getPopularProducts(categoryId);
      setPopularProducts(result.popular_products);
      setSelectedCategory(result.category);
      addTestResult({
        success: true,
        message: `Found ${result.popular_products.length} popular products in category "${result.category.name}"`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Failed to fetch popular products for category ID: ${categoryId}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    testGetAllCategories();
  }, [testGetAllCategories]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Categories API Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all category-related API endpoints and monitor results
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
                  onClick={testGetAllCategories}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <TagIcon className="w-4 h-4 mr-2" />
                  Test Get All Categories
                </button>

                <button
                  onClick={testGetCategoryStats}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Test Get Category Statistics
                </button>

                <button
                  onClick={() => testGetAllCategories()}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Search Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Search Categories
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search Query
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter category name to search..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={testSearchCategories}
                  disabled={loading || !searchQuery.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                  Test Search Categories
                </button>
              </div>
            </div>

            {/* Category Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Category Actions
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Category
                  </label>
                  <select
                    onChange={(e) => {
                      const category = categories.find(c => c.id === parseInt(e.target.value));
                      setSelectedCategory(category || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} (ID: {category.id})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <div className="space-y-2">
                    <button
                      onClick={() => testGetCategoryProducts(selectedCategory.id)}
                      disabled={loading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Test Get Category Products
                    </button>

                    <button
                      onClick={() => testGetPopularProducts(selectedCategory.id)}
                      disabled={loading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                      <StarIcon className="w-4 h-4 mr-2" />
                      Test Get Popular Products
                    </button>

                    <button
                      onClick={() => testGetCategoryBySlug(selectedCategory.slug)}
                      disabled={loading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <TagIcon className="w-4 h-4 mr-2" />
                      Test Get Category by Slug
                    </button>
                  </div>
                )}
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

            {/* Category Statistics Display */}
            {categoryStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Category Statistics
                </h2>
                
                <div className="space-y-3">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {categoryStats.total_categories}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Total Categories
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {categoryStats.categories.map((stat: any) => (
                      <div
                        key={stat.id}
                        className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {stat.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.product_count} products
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Category Products */}
            {categoryProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Category Products ({categoryProducts.length})
                </h2>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ${product.price} • Stock: {product.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Products */}
            {popularProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Popular Products ({popularProducts.length})
                </h2>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {popularProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded bg-yellow-50 dark:bg-yellow-900/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ${product.price} • Stock: {product.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesApiTest; 