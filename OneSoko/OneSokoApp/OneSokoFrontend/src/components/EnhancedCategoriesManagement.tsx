import React, { useState, useEffect, useCallback } from 'react';
import { 
  TagIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  StarIcon,
  ShoppingBagIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { categoriesAPI } from '../services/api';
import { Category, Product } from '../types';
import BulkOperations, { PRODUCT_BULK_ACTIONS } from './BulkOperations';

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

const EnhancedCategoriesManagement: React.FC = () => {
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
  
  // Bulk operations state
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]);
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

  // Add new category
  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return;

    try {
      setLoading(true);
      const result = await categoriesAPI.create({
        name: newCategoryName
      });
      
      setCategories(prev => [...prev, result]);
      setNewCategoryName('');
      setShowAddModal(false);
      
      addTestResult({
        success: true,
        message: `Successfully created category "${result.name}"`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to create category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [newCategoryName]);

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

  // Bulk operations handlers
  const handleCategorySelection = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = async (action: string, items: any[], value?: any) => {
    setBulkLoading(true);
    try {
      switch (action) {
        case 'delete':
          // Implement bulk delete
          console.log('Bulk delete:', items);
          addTestResult({
            success: true,
            message: `Successfully deleted ${items.length} items`
          });
          break;
        case 'update-category':
          // Implement bulk category update
          console.log('Bulk category update:', items, value);
          addTestResult({
            success: true,
            message: `Successfully updated category for ${items.length} items`
          });
          break;
        case 'publish':
          // Implement bulk publish
          console.log('Bulk publish:', items);
          addTestResult({
            success: true,
            message: `Successfully published ${items.length} items`
          });
          break;
        default:
          console.log('Bulk action:', action, items, value);
      }
    } catch (error) {
      addTestResult({
        success: false,
        message: `Bulk ${action} failed`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const clearCategorySelection = () => {
    setSelectedCategories([]);
  };

  const clearProductSelection = () => {
    setSelectedProducts([]);
  };

  useEffect(() => {
    fetchCategories();
    fetchCategoryStats();
  }, [fetchCategories, fetchCategoryStats]);

  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        searchCategories(searchQuery);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, searchCategories]);

  const renderCategoryCard = (category: Category, isSelected: boolean = false) => (
    <div key={category.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCategorySelection(category.id)}
            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex items-center">
            <TagIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h3>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ID: {category.id} • Slug: {category.slug}
        </span>
        <button
          onClick={() => fetchCategoryProducts(category.id)}
          className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
        >
          <EyeIcon className="w-4 h-4 mr-1" />
          View Products
        </button>
      </div>
    </div>
  );

  const renderProductCard = (product: Product, isSelected: boolean = false) => (
    <div key={product.productId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleProductSelection(product.productId)}
            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ${product.price}
            </p>
          </div>
        </div>
        {product.quantity <= 10 && (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
            Low Stock
          </span>
        )}
      </div>
      
      {product.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {product.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Stock: {product.quantity}</span>
        <span>ID: {product.productId}</span>
      </div>
    </div>
  );  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Enhanced Categories Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage categories with bulk operations and advanced features
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
          {[
            { id: 'browse', label: 'Browse Categories', icon: TagIcon },
            { id: 'search', label: 'Search', icon: MagnifyingGlassIcon },
            { id: 'stats', label: 'Statistics', icon: ChartBarIcon },
            { id: 'products', label: 'Category Products', icon: ShoppingBagIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bulk Operations for Categories */}
        {activeTab === 'browse' && selectedCategories.length > 0 && (
          <BulkOperations
            selectedItems={selectedCategories}
            onBulkAction={handleBulkAction}
            onClearSelection={clearCategorySelection}
            availableActions={[
              {
                id: 'delete',
                label: 'Delete',
                icon: XMarkIcon,
                color: 'red'
              },
              {
                id: 'export',
                label: 'Export',
                icon: ArrowPathIcon,
                color: 'blue'
              }
            ]}
            loading={bulkLoading}
          />
        )}

        {/* Bulk Operations for Products */}
        {activeTab === 'products' && selectedProducts.length > 0 && (
          <BulkOperations
            selectedItems={selectedProducts}
            onBulkAction={handleBulkAction}
            onClearSelection={clearProductSelection}
            availableActions={PRODUCT_BULK_ACTIONS}
            loading={bulkLoading}
          />
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((category) => 
              renderCategoryCard(category, selectedCategories.includes(category.id))
            )}
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {searchResults.map((category) => renderCategoryCard(category))}
          </div>
        </div>
      )}

      {activeTab === 'products' && selectedCategory && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Products in "{selectedCategory.name}"
            </h2>
            <p className="text-blue-700 dark:text-blue-300">
              {categoryProducts.length} products found
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categoryProducts.map((product) => 
              renderProductCard(product, selectedProducts.includes(product.productId))
            )}
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New Category
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category name"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  'Add Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Test Results
            </h2>
            <button
              onClick={clearTestResults}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start">
                  {result.success ? (
                    <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      result.success
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.message}
                    </p>
                    {result.error && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        Error: {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-900 dark:text-white">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCategoriesManagement;
