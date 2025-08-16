import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { BuildingStorefrontIcon, ShoppingBagIcon, StarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AddToCartButton from '../../components/cart/AddToCartButton';
import type { Product, Shop } from '../../types';
import toast from 'react-hot-toast';

interface SearchFilters {
  category: string;
  priceRange: string;
  rating: string;
  availability: string;
  sortBy: string;
}

const ExplorePage: React.FC = () => {
  const [searchType, setSearchType] = useState<'products' | 'shops'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    priceRange: '',
    rating: '',
    availability: '',
    sortBy: 'relevance'
  });

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 
    'Health & Beauty', 'Automotive', 'Food & Beverages'
  ];

  const priceRanges = [
    { label: 'Under $25', value: '0-25' },
    { label: '$25 - $50', value: '25-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: 'Over $200', value: '200-999999' }
  ];

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Rating', value: 'rating' },
    { label: 'Popularity', value: 'popularity' }
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      // Load popular/featured items when no search query
      loadFeaturedItems();
    }
  }, [searchType, filters]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      if (searchType === 'products') {
        const response = await api.get('/products/', {
          params: {
            search: searchQuery,
            category: filters.category || undefined,
            price_min: filters.priceRange ? filters.priceRange.split('-')[0] : undefined,
            price_max: filters.priceRange ? filters.priceRange.split('-')[1] : undefined,
            ordering: getSortingParam(filters.sortBy),
            is_active: filters.availability === 'available' ? true : undefined
          }
        });
        setProducts(response.data.results || response.data);
        setShops([]);
      } else {
        const response = await api.get('/shops/', {
          params: {
            search: searchQuery,
            ordering: filters.sortBy === 'rating' ? '-rating' : '-created_at'
          }
        });
        setShops(response.data.results || response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedItems = async () => {
    setLoading(true);
    try {
      if (searchType === 'products') {
        const response = await api.get('/products/', {
          params: {
            is_featured: true,
            is_active: true,
            ordering: getSortingParam(filters.sortBy)
          }
        });
        setProducts(response.data.results || response.data);
        setShops([]);
      } else {
        const response = await api.get('/shops/', {
          params: {
            is_active: true,
            ordering: '-rating'
          }
        });
        setShops(response.data.results || response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Load featured items error:', error);
      toast.error('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSortingParam = (sortBy: string) => {
    switch (sortBy) {
      case 'price_asc': return 'price';
      case 'price_desc': return '-price';
      case 'newest': return '-created_at';
      case 'rating': return '-rating';
      case 'popularity': return '-view_count';
      default: return '-created_at';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      rating: '',
      availability: '',
      sortBy: 'relevance'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== 'relevance').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Explore OneSoko
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover amazing products and shops from our marketplace
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          {/* Search Type Tabs */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
              <button
                onClick={() => setSearchType('products')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  searchType === 'products'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
                }`}
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>Products</span>
              </button>
              <button
                onClick={() => setSearchType('shops')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  searchType === 'shops'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
                }`}
              >
                <BuildingStorefrontIcon className="w-4 h-4" />
                <span>Shops</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search for ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-4 py-1.5"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters Toggle */}
          {searchType === 'products' && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && searchType === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Any Price</option>
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Items</option>
                  <option value="available">In Stock Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Apply Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="mb-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {searchQuery ? (
                    <>
                      Search Results for "{searchQuery}" ({searchType === 'products' ? products.length : shops.length} found)
                    </>
                  ) : (
                    <>
                      {searchType === 'products' ? 'Featured Products' : 'Popular Shops'} ({searchType === 'products' ? products.length : shops.length})
                    </>
                  )}
                </h2>
              </div>

              {/* Products Results */}
              {searchType === 'products' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <div
                        key={product.productId}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                      >
                        <Link to={`/products/${product.productId}`} className="block">
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-48 w-full object-cover object-center group-hover:opacity-75"
                              />
                            ) : (
                              <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="p-4">
                          <Link to={`/products/${product.productId}`}>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {product.description}
                          </p>

                          {/* Rating */}
                          <div className="mt-2 flex items-center">
                            <div className="flex items-center">
                              {[0, 1, 2, 3, 4].map((rating) => (
                                <StarIcon
                                  key={rating}
                                  className={`h-4 w-4 ${
                                    (product.average_rating || 0) > rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                              ({product.reviews?.length || 0})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ${product.price}
                            </span>
                            {product.promotional_price && parseFloat(product.promotional_price) > parseFloat(product.price) && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                ${product.promotional_price}
                              </span>
                            )}
                          </div>

                          {/* Stock Status */}
                          <div className="mt-2">
                            {product.quantity === 0 ? (
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                Out of Stock
                              </span>
                            ) : product.quantity <= 5 ? (
                              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                Only {product.quantity} left!
                              </span>
                            ) : (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                In Stock
                              </span>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          <div className="mt-4">
                            <AddToCartButton
                              product={product}
                              size="sm"
                              showQuantitySelector={false}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Shops Results */}
              {searchType === 'shops' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shops.length > 0 ? (
                    shops.map((shop) => (
                      <Link
                        key={shop.shopId}
                        to={`/shops/${shop.shopId}`}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
                            {shop.logo ? (
                              <img
                                src={shop.logo}
                                alt={shop.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-white font-bold text-xl">
                                {shop.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {shop.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {shop.city}, {shop.country}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {shop.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{shop.products_count || 0} Products</span>
                          <div className="flex items-center space-x-1">
                            <span className="flex items-center">
                              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                              <span>{shop.views ? (shop.views / 100).toFixed(1) : 'New'}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <BuildingStorefrontIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No shops found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Try adjusting your search terms
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
