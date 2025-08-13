import React, { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FireIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import SmartSearchInput from '../components/search/SmartSearchInput';
import AdvancedSearchFilters from '../components/search/AdvancedSearchFilters';
import SearchResults from '../components/search/SearchResults';
import { useShopSearch } from '../hooks/useShopSearch';
import { Shop } from '../types';

interface SearchFilters {
  city: string;
  country: string;
  status: string;
}

const OptimizedShopSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    country: '',
    status: 'active',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'trending' | 'search'>('trending');

  const {
    shops,
    loading,
    error,
    totalCount,
    trending,
    search,
    quickSearch,
    clearResults,
    clearError,
    loadTrending,
  } = useShopSearch();

  // Load trending shops on mount
  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  // Handle search with filters
  const handleSearch = useCallback(
    async (query: string = searchQuery) => {
      if (!query.trim() && !filters.city && !filters.country) {
        setSearchMode('trending');
        clearResults();
        return;
      }

      setSearchMode('search');
      clearError();

      // Use quick search for simple queries, advanced search for filtered queries
      if (filters.city || filters.country || filters.status !== 'active') {
        await search({
          query: query.trim(),
          ...filters,
        });
      } else {
        await quickSearch(query.trim());
      }
    },
    [searchQuery, filters, search, quickSearch, clearResults, clearError]
  );

  // Handle shop selection
  const handleShopSelect = (shop: Shop) => {
    // Navigate to shop page or handle selection
    console.log('Selected shop:', shop);
    // Example: navigate to shop detail page
    // navigate(`/shops/${shop.slug || shop.shopId}`);
  };

  // Clear all search and filters
  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({
      city: '',
      country: '',
      status: 'active',
    });
    setSearchMode('trending');
    clearResults();
    clearError();
  };

  // Determine which shops to display
  const displayShops = searchMode === 'trending' ? trending : shops;
  const displayTotalCount = searchMode === 'trending' ? trending.length : totalCount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Find Amazing Shops
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover thousands of shops offering unique products and services. 
            Search by name, location, or browse trending shops.
          </p>
        </div>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <SmartSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  onSelectShop={handleShopSelect}
                  placeholder="Search for shops by name, description, or keywords..."
                  showTrending={true}
                  trendingShops={trending.slice(0, 3)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <AdvancedSearchFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  isOpen={showFilters}
                  onToggle={() => setShowFilters(!showFilters)}
                />
                
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      Search
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSearchMode('trending');
                  handleClearAll();
                }}
                className={`
                  inline-flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                  ${searchMode === 'trending'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                <FireIcon className="h-4 w-4 mr-1" />
                Trending
              </button>
              
              {(searchQuery || filters.city || filters.country) && (
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Section */}
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {searchMode === 'trending' ? (
                <>
                  <FireIcon className="h-6 w-6 text-primary-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Trending Shops
                  </h2>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-6 w-6 text-primary-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Search Results
                  </h2>
                </>
              )}
            </div>

            {/* Active Filters Display */}
            {searchMode === 'search' && (filters.city || filters.country || searchQuery) && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Filters:</span>
                {searchQuery && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 rounded">
                    "{searchQuery}"
                  </span>
                )}
                {filters.city && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {filters.city}
                  </span>
                )}
                {filters.country && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded">
                    {filters.country}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          <SearchResults
            shops={displayShops}
            loading={loading}
            error={error}
            totalCount={displayTotalCount}
            query={searchMode === 'search' ? searchQuery : undefined}
            onShopClick={handleShopSelect}
            showStats={true}
          />

          {/* Performance Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                🚀 Performance Info (Development Only)
              </h3>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                <div>Mode: {searchMode}</div>
                <div>Results: {displayShops.length} shops</div>
                <div>Loading: {loading ? 'Yes' : 'No'}</div>
                <div>Search Cache: {searchMode === 'search' ? 'Active' : 'N/A'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedShopSearch;
