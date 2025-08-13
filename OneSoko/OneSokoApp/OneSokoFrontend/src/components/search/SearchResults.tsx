import React, { useMemo } from 'react';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  EyeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Shop } from '../../types';

interface SearchResultsProps {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  query?: string;
  onShopClick?: (shop: Shop) => void;
  showStats?: boolean;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  shops,
  loading,
  error,
  totalCount,
  query,
  onShopClick,
  showStats = true,
  className = '',
}) => {
  // Performance optimization: memoize shop cards
  const shopCards = useMemo(() => {
    return shops.map((shop) => (
      <ShopCard
        key={shop.shopId}
        shop={shop}
        onClick={() => onShopClick?.(shop)}
        query={query}
      />
    ));
  }, [shops, onShopClick, query]);

  // Loading state
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Search Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (shops.length === 0 && !loading) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No shops found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {query ? (
              <>We couldn't find any shops matching "<span className="font-medium">{query}</span>"</>
            ) : (
              'Try adjusting your search criteria or explore trending shops.'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Results Stats */}
      {showStats && totalCount > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {query ? (
              <>
                Found <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> shops
                {query && (
                  <> for "<span className="font-medium">{query}</span>"</>
                )}
              </>
            ) : (
              <>
                Showing <span className="font-semibold text-gray-900 dark:text-white">{shops.length}</span> shops
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopCards}
      </div>

      {/* Load More Indicator */}
      {shops.length < totalCount && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {shops.length} of {totalCount} shops
          </p>
        </div>
      )}
    </div>
  );
};

// Memoized ShopCard component for better performance
const ShopCard: React.FC<{
  shop: Shop;
  onClick?: () => void;
  query?: string;
}> = React.memo(({ shop, onClick, query }) => {
  // Highlight matching text
  const highlightText = (text: string, highlight?: string) => {
    if (!highlight || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 
        transition-all duration-200 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start space-x-4">
        {/* Shop Logo */}
        <div className="flex-shrink-0">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <BuildingStorefrontIcon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Shop Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {highlightText(shop.name, query)}
          </h3>
          
          {shop.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {highlightText(shop.description, query)}
            </p>
          )}

          {/* Location */}
          {(shop.city || shop.country) && (
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                {shop.city}
                {shop.city && shop.country && ', '}
                {shop.country}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {shop.views !== undefined && (
                <div className="flex items-center">
                  <EyeIcon className="h-3 w-3 mr-1" />
                  {shop.views}
                </div>
              )}
              
              {shop.created_at && (
                <div className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatDate(shop.created_at)}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <span
              className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${shop.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : shop.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }
              `}
            >
              {shop.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ShopCard.displayName = 'ShopCard';

export default SearchResults;
