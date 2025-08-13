import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  FireIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { Shop } from '../../types';
import { useDebouncedShopSearch } from '../../hooks/useShopSearch';

interface SmartSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onSelectShop?: (shop: Shop) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showTrending?: boolean;
  trendingShops?: Shop[];
  className?: string;
}

interface SearchHistory {
  query: string;
  timestamp: number;
}

const SmartSearchInput: React.FC<SmartSearchInputProps> = ({
  value,
  onChange,
  onSearch,
  onSelectShop,
  placeholder = 'Search shops...',
  showSuggestions = true,
  showTrending = true,
  trendingShops = [],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const { suggestions, loading } = useDebouncedShopSearch(value);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shop_search_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSearchHistory(parsed.slice(0, 5)); // Keep only last 5 searches
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [
      { query: query.trim(), timestamp: Date.now() },
      ...searchHistory.filter(h => h.query !== query.trim())
    ].slice(0, 5);
    
    setSearchHistory(newHistory);
    localStorage.setItem('shop_search_history', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length > 0 || showTrending);
  };

  // Handle search submission
  const handleSearch = (query: string = value) => {
    if (query.trim()) {
      saveToHistory(query);
      onSearch(query);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle shop selection
  const handleSelectShop = (shop: Shop) => {
    onChange(shop.name);
    saveToHistory(shop.name);
    setIsOpen(false);
    if (onSelectShop) {
      onSelectShop(shop);
    } else {
      onSearch(shop.name);
    }
  };

  // Handle history selection
  const handleSelectHistory = (query: string) => {
    onChange(query);
    handleSearch(query);
  };

  // Clear input
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const shouldShowDropdown = isOpen && (
    (value && (suggestions.length > 0 || loading)) ||
    (!value && (searchHistory.length > 0 || (showTrending && trendingShops.length > 0)))
  );

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
        />
        
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Loading State */}
          {loading && value && (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500 mx-auto"></div>
              <span className="text-sm mt-2 block">Searching...</span>
            </div>
          )}

          {/* Search Suggestions */}
          {value && suggestions.length > 0 && !loading && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                Suggestions
              </div>
              {suggestions.map((shop) => (
                <button
                  key={shop.shopId}
                  onClick={() => handleSelectShop(shop)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {shop.name}
                      </div>
                      {shop.city && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {shop.city}
                          {shop.country && `, ${shop.country}`}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {value && suggestions.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              <BuildingStorefrontIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No shops found for "{value}"</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-primary-600 dark:text-primary-400 text-sm hover:underline"
              >
                Search anyway
              </button>
            </div>
          )}

          {/* Search History */}
          {!value && searchHistory.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                Recent Searches
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectHistory(item.query)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white">{item.query}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Trending Shops */}
          {!value && showTrending && trendingShops.length > 0 && (
            <div>
              {searchHistory.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700" />
              )}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                Trending Shops
              </div>
              {trendingShops.slice(0, 3).map((shop) => (
                <button
                  key={shop.shopId}
                  onClick={() => handleSelectShop(shop)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FireIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {shop.name}
                      </div>
                      {shop.city && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {shop.city}
                          {shop.country && `, ${shop.country}`}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearchInput;
