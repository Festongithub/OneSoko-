import React, { useState, useEffect, useCallback } from 'react';
import { 
  TagIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  StarIcon,
  ShoppingBagIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { categoriesAPI } from '../services/api';
import { Category, Product } from '../types';

interface CategoryStats {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'stats' | 'products'>('browse');

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
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

  // Fetch category statistics
  const fetchCategoryStats = useCallback(async () => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getStats();
      setCategoryStats(result.categories);
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
  }, []);

  // Search categories
  const searchCategories = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const result = await categoriesAPI.search(query);
      setSearchResults(result);
      addTestResult({
        success: true,
        message: `Found ${result.length} categories matching "${query}"`,
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
  }, []);

  // Get products by category
  const fetchCategoryProducts = useCallback(async (categoryId: number) => {
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
        message: 'Failed to fetch category products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Get popular products by category
  const fetchPopularProducts = useCallback(async (categoryId: number) => {
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
        message: 'Failed to fetch popular products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCategories(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCategories]);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchCategoryStats();
  }, [fetchCategories, fetchCategoryStats]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Categories Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse, search, and manage product categories
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'browse', name: 'Browse Categories', icon: TagIcon },
              { id: 'search', name: 'Search', icon: MagnifyingGlassIcon },
              { id: 'stats', name: 'Statistics', icon: ChartBarIcon },
              { id: 'products', name: 'Category Products', icon: ShoppingBagIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Browse Categories Tab */}
            {activeTab === 'browse' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    All Categories ({categories.length})
                  </h2>
                  <button
                    onClick={fetchCategories}
                    disabled={loading}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No categories found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {category.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Slug: {category.slug}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchCategoryProducts(category.id)}
                            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <EyeIcon className="w-3 h-3 mr-1" />
                            View Products
                          </button>
                          <button
                            onClick={() => fetchPopularProducts(category.id)}
                            className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <StarIcon className="w-3 h-3 mr-1" />
                            Popular
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Search Categories
                </h2>
                
                <div className="mb-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search categories by name..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((category) => (
                      <div
                        key={category.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Slug: {category.slug}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fetchCategoryProducts(category.id)}
                              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              <EyeIcon className="w-3 h-3 mr-1" />
                              Products
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No categories found matching "{searchQuery}"
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Start typing to search categories...
                  </p>
                )}
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Category Statistics
                  </h2>
                  <button
                    onClick={fetchCategoryStats}
                    disabled={loading}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : categoryStats.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No category statistics available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {categoryStats.map((stat) => (
                      <div
                        key={stat.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {stat.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Slug: {stat.slug}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {stat.product_count}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Products
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Category Products
                </h2>

                {selectedCategory ? (
                  <div>
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">
                        {selectedCategory.name}
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Slug: {selectedCategory.slug}
                      </p>
                    </div>

                    {categoryProducts.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          All Products ({categoryProducts.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryProducts.map((product) => (
                            <div
                              key={product.productId}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            >
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                ${product.price}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Stock: {product.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {popularProducts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Popular Products ({popularProducts.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {popularProducts.map((product) => (
                            <div
                              key={product.productId}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {product.name}
                                </h5>
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                ${product.price}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Stock: {product.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {categoryProducts.length === 0 && popularProducts.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No products found for this category.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Select a category to view its products.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Test Results Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  API Test Results
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
                    No test results yet. Use the categories features to see results here.
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
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManagement; 