import React, { useState, useEffect, useCallback } from 'react';
import { 
  TagIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  StarIcon,
  ShoppingBagIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { categoriesAPI } from '../services/api';
import { Category, Product } from '../types';

interface CategoryStats {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'products'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getAll();
      setCategories(result);
      setFilteredCategories(result);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch category statistics
  const fetchCategoryStats = useCallback(async () => {
    try {
      const result = await categoriesAPI.getStats();
      setCategoryStats(result.categories);
    } catch (error) {
      console.error('Failed to fetch category statistics:', error);
    }
  }, []);

  // Get products by category
  const fetchCategoryProducts = useCallback(async (categoryId: number) => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getProducts(categoryId);
      setCategoryProducts(result.products);
      setSelectedCategory(result.category);
    } catch (error) {
      console.error('Failed to fetch category products:', error);
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
    } catch (error) {
      console.error('Failed to fetch popular products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort categories
  useEffect(() => {
    let filtered = categories;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = getProductCount(a.id);
        bValue = getProductCount(b.id);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCategories(filtered);
  }, [categories, searchQuery, sortBy, sortOrder]);

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchCategoryStats();
  }, [fetchCategories, fetchCategoryStats]);

  const getProductCount = (categoryId: number) => {
    const stat = categoryStats.find(s => s.id === categoryId);
    return stat ? stat.product_count : 0;
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 p-8 hover:shadow-md transition-all duration-200 hover:scale-105 min-h-[200px] flex flex-col relative overflow-hidden">
      <div className="flex items-start justify-between mb-6 flex-1">
        <div className="flex-1 pr-12">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {getProductCount(category.id)} products available
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
            /{category.slug}
          </p>
        </div>
        <div className="flex-shrink-0 p-1.5 rounded-md bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 absolute top-6 right-6">
          <TagIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      <div className="flex space-x-4 mt-auto">
        <button
          onClick={() => fetchCategoryProducts(category.id)}
          disabled={loading}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm border border-blue-500"
        >
          <EyeIcon className="w-4 h-4 mr-2" />
          Browse
        </button>
        <button
          onClick={() => fetchPopularProducts(category.id)}
          disabled={loading}
          className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium text-sm min-w-[50px] border border-yellow-500"
        >
          <StarIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const ProductCard = ({ product, isPopular = false }: { product: Product; isPopular?: boolean }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 ${
      isPopular ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
          {product.name}
        </h4>
        {isPopular && (
          <StarIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" />
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {product.description}
      </p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          ${product.price}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Stock: {product.quantity}
        </span>
      </div>
      {product.discount > 0 && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
            {product.discount}% OFF
          </span>
        </div>
      )}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
        View Details
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600">
              <TagIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
              <p className="text-gray-600 dark:text-gray-400">Explore products by category</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                fetchCategories();
                fetchCategoryStats();
              }}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'products')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="products">Sort by Products</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <FunnelIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {!selectedCategory && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Categories ({filteredCategories.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <TagIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No categories found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search criteria.' : 'No categories available at the moment.'}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
            }>
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Category Products */}
      {selectedCategory && (
        <div className="space-y-6">
          {/* Category Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCategory.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {getProductCount(selectedCategory.id)} products • Slug: {selectedCategory.slug}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  ← Back to Categories
                </button>
                <button
                  onClick={() => fetchCategoryProducts(selectedCategory.id)}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  All Products
                </button>
                <button
                  onClick={() => fetchPopularProducts(selectedCategory.id)}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  <StarIcon className="w-4 h-4 mr-2" />
                  Popular
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {(categoryProducts.length > 0 || popularProducts.length > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {popularProducts.length > 0 ? 'Popular Products' : 'All Products'} 
                ({popularProducts.length > 0 ? popularProducts.length : categoryProducts.length})
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(popularProducts.length > 0 ? popularProducts : categoryProducts).map((product) => (
                    <ProductCard 
                      key={product.productId} 
                      product={product} 
                      isPopular={popularProducts.length > 0}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {categoryProducts.length === 0 && popularProducts.length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center py-8">
                <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This category doesn't have any products yet.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories; 