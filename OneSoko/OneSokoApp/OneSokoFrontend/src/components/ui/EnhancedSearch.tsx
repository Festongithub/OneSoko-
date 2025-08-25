import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ClockIcon, ArrowTrendingUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'product' | 'category';
  count?: number;
}

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onSearch,
  placeholder = "Search products, brands, categories...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock suggestions - replace with real API
  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'iPhone 15', type: 'trending', count: 1250 },
    { id: '2', text: 'Samsung Galaxy', type: 'trending', count: 980 },
    { id: '3', text: 'Laptop', type: 'category', count: 2100 },
    { id: '4', text: 'Wireless Headphones', type: 'product', count: 650 },
    { id: '5', text: 'Fashion', type: 'category', count: 3200 },
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    
    // Filter suggestions based on query
    if (value.trim()) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      
      onSearch(searchQuery);
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const clearRecentSearch = (searchToRemove: string) => {
    const updated = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <ClockIcon className="w-4 h-4 text-neutral-400" />;
      case 'trending':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-primary-500" />;
      default:
        return <MagnifyingGlassIcon className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
            if (e.key === 'Escape') {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
        />
        
        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-elevated border border-neutral-200 dark:border-neutral-700 py-2 z-50 max-h-96 overflow-y-auto">
          
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="px-4 py-2">
              <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Recent Searches
              </h4>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg group cursor-pointer"
                  onClick={() => handleSearch(search)}
                >
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{search}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearRecentSearch(search);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-neutral-600 rounded transition-all"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {query && suggestions.length > 0 && (
            <div className="px-4 py-2">
              <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Suggestions
              </h4>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between py-2 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center space-x-3">
                    {getSuggestionIcon(suggestion.type)}
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {suggestion.text}
                    </span>
                    {suggestion.type === 'trending' && (
                      <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                        Trending
                      </span>
                    )}
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-neutral-500">
                      {suggestion.count.toLocaleString()} results
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No suggestions found for "{query}"
              </p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Search anyway
              </button>
            </div>
          )}

          {/* Trending when no query */}
          {!query && (
            <div className="px-4 py-2">
              <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Trending Searches
              </h4>
              {mockSuggestions.filter(s => s.type === 'trending').map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between py-2 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center space-x-3">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-primary-500" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {suggestion.text}
                    </span>
                  </div>
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    #{suggestion.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
