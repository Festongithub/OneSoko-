import React, { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { shopsAPI } from '../services/api';
import { Shop } from '../types';

const ShopSearchDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [searchResults, setSearchResults] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim() && !locationFilter.trim()) {
      setError('Please enter a search query or location');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const results = await shopsAPI.search(searchQuery, locationFilter);
      setSearchResults(results || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setLocationFilter('');
    setSearchResults([]);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Shop Search Demo
      </h2>
      
      <div className="space-y-4 mb-6">
        {/* Search Input */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex-1 relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by city or country..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        {/* Search Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search Results ({searchResults.length})
          </h3>
          <div className="space-y-4">
            {searchResults.map((shop) => (
              <div
                key={shop.shopId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    {shop.logo ? (
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {shop.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {shop.name}
                    </h4>
                    
                    {shop.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {shop.description}
                      </p>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>
                        {shop.city && shop.country 
                          ? `${shop.city}, ${shop.country}`
                          : shop.location || 'Location not specified'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Orders: {shop.total_orders}</span>
                      <span>Sales: ${shop.total_sales.toFixed(2)}</span>
                      <span>Views: {shop.views}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      shop.status === 'active' ? 'bg-green-100 text-green-800' :
                      shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {shop.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchResults.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No shops found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try searching with different keywords or location
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Searching...</p>
        </div>
      )}
    </div>
  );
};

export default ShopSearchDemo; 