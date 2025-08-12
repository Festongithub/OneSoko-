import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  TagIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CalendarIcon,
  XMarkIcon,
  ChevronDownIcon,
  ListBulletIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Product, Category, Shop } from '../types';

interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  location: string;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popularity';
  inStock: boolean;
  shopType: 'all' | 'verified' | 'featured';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

interface SearchResult {
  products: Product[];
  shops: Shop[];
  categories: Category[];
  totalProducts: number;
  totalShops: number;
  facets: {
    categories: { name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    locations: { name: string; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

interface AdvancedSearchProps {
  onSearchResults?: (results: SearchResult) => void;
  initialFilters?: Partial<SearchFilters>;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearchResults,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    rating: 0,
    location: '',
    sortBy: 'relevance',
    inStock: false,
    shopType: 'all',
    dateRange: 'all',
    ...initialFilters
  });

  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock data - in real implementation, these would come from API
  const categories = [
    { id: 1, name: 'Electronics', slug: 'electronics' },
    { id: 2, name: 'Clothing', slug: 'clothing' },
    { id: 3, name: 'Books', slug: 'books' },
    { id: 4, name: 'Home & Garden', slug: 'home-garden' },
    { id: 5, name: 'Sports', slug: 'sports' }
  ];

  const locations = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'
  ];

  const priceRanges = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $500', min: 100, max: 500 },
    { label: '$500 - $1000', min: 500, max: 1000 },
    { label: 'Over $1000', min: 1000, max: 10000 }
  ];

  // Debounced search function
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock search results
      const mockResults: SearchResult = {
        products: [
          {
            productId: '1',
            name: `Search Result for "${searchFilters.query}"`,
            description: 'Premium quality product with advanced features',
            price: 299.99,
            quantity: 25,
            stock: 25,
            image: null,
            category: null,
            tags: [],
            discount: 0,
            promotional_price: null,
            is_active: true,
            shops: [],
            rating: 4.5
          },
          {
            productId: '2',
            name: `Related Product to "${searchFilters.query}"`,
            description: 'High-performance solution for your needs',
            price: 199.99,
            quantity: 15,
            stock: 15,
            image: null,
            category: null,
            tags: [],
            discount: 0,
            promotional_price: null,
            is_active: true,
            shops: [],
            rating: 4.2
          }
        ],
        shops: [],
        categories: [],
        totalProducts: 156,
        totalShops: 23,
        facets: {
          categories: [
            { name: 'Electronics', count: 45 },
            { name: 'Clothing', count: 32 },
            { name: 'Books', count: 28 }
          ],
          priceRanges: [
            { min: 0, max: 50, count: 12 },
            { min: 50, max: 100, count: 34 },
            { min: 100, max: 500, count: 78 }
          ],
          locations: [
            { name: 'Nairobi', count: 89 },
            { name: 'Mombasa', count: 34 }
          ],
          ratings: [
            { rating: 5, count: 45 },
            { rating: 4, count: 67 },
            { rating: 3, count: 32 }
          ]
        }
      };

      setSearchResults(mockResults);
      onSearchResults?.(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [onSearchResults]);

  // Auto-suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Mock suggestions
    const mockSuggestions = [
      `${query} laptop`,
      `${query} phone`,
      `${query} accessories`,
      `${query} case`,
      `${query} wireless`
    ];
    setSuggestions(mockSuggestions);
  }, []);

  // Update filters
  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      query: filters.query, // Keep the search query
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      rating: 0,
      location: '',
      sortBy: 'relevance',
      inStock: false,
      shopType: 'all',
      dateRange: 'all'
    });
  }, [filters.query]);

  // Perform search when filters change
  useEffect(() => {
    if (filters.query.trim()) {
      const timer = setTimeout(() => {
        performSearch(filters);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filters, performSearch]);

  // Handle query suggestions
  useEffect(() => {
    if (filters.query) {
      fetchSuggestions(filters.query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [filters.query, fetchSuggestions]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 10000) count++;
    if (filters.rating > 0) count++;
    if (filters.location) count++;
    if (filters.inStock) count++;
    if (filters.shopType !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  }, [filters]);

  const renderProductCard = (product: Product) => (
    <div key={product.productId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="flex items-center text-yellow-500">
          <StarIcon className="w-4 h-4 fill-current" />
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
            {product.rating}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${product.price}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            Stock: {product.stock || product.quantity}
          </span>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find exactly what you're looking for with powerful search and filtering
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="flex items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, shops, categories..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
              />
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 mt-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateFilter('query', suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-900 dark:text-white">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-l-0 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => performSearch(filters)}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advanced Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 10000)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => updateFilter('rating', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={2}>2+ Stars</option>
                <option value={1}>1+ Stars</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>

            {/* Shop Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Type
              </label>
              <select
                value={filters.shopType}
                onChange={(e) => updateFilter('shopType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Shops</option>
                <option value="verified">Verified Only</option>
                <option value="featured">Featured Shops</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Added
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => updateFilter('inStock', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  In Stock Only
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Search Results
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {searchResults.totalProducts} products found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {searchResults.products.map(renderProductCard)}
          </div>

          {/* Pagination would go here */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Searching...
          </span>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
