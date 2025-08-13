import React, { useState } from 'react';
import { useShopSearch } from '../hooks/useShopSearch';
import SmartSearchInput from './search/SmartSearchInput';
import AdvancedSearchFilters from './search/AdvancedSearchFilters';
import SearchResults from './search/SearchResults';
import { Shop } from '../types';

interface SearchFilters {
  city: string;
  country: string;
  status: string;
}

const ShopSearchDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    country: '',
    status: 'active',
  });
  const [showFilters, setShowFilters] = useState(false);

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
  } = useShopSearch();

  // Handle search
  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim() && !filters.city && !filters.country) {
      clearResults();
      return;
    }

    clearError();

    // Use advanced search if filters are applied
    if (filters.city || filters.country || filters.status !== 'active') {
      await search({
        query: query.trim(),
        ...filters,
      });
    } else {
      await quickSearch(query.trim());
    }
  };

  // Handle shop selection
  const handleShopSelect = (shop: Shop) => {
    console.log('Selected shop:', shop);
    // Here you could navigate to the shop page
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Optimized Shop Search Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Experience our enhanced search with autocomplete, filters, and caching
          </p>
        </div>

        <div className="p-6">
          {/* Search Interface */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SmartSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  onSelectShop={handleShopSelect}
                  placeholder="Search shops with smart autocomplete..."
                  showTrending={true}
                  trendingShops={trending.slice(0, 3)}
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
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Quick Clear */}
            {(searchQuery || filters.city || filters.country) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ city: '', country: '', status: 'active' });
                  clearResults();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search Results */}
          <SearchResults
            shops={shops}
            loading={loading}
            error={error}
            totalCount={totalCount}
            query={searchQuery}
            onShopClick={handleShopSelect}
            showStats={true}
          />

          {/* Trending Shops (when no search) */}
          {!searchQuery && !filters.city && !filters.country && shops.length === 0 && !loading && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                🔥 Trending Shops
              </h3>
              <SearchResults
                shops={trending}
                loading={false}
                error={null}
                totalCount={trending.length}
                onShopClick={handleShopSelect}
                showStats={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopSearchDemo; 