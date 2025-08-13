import React, { useState, useEffect } from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { shopsAPI } from '../../services/api';

interface SearchFilters {
  city: string;
  country: string;
  status: string;
}

interface Location {
  city: string;
  country: string;
  shop_count: number;
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
  className = '',
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Load available locations
  useEffect(() => {
    const loadLocations = async () => {
      setLoadingLocations(true);
      try {
        const result = await shopsAPI.searchByLocation();
        setLocations(result.locations);
      } catch (error) {
        console.error('Failed to load locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      city: '',
      country: '',
      status: 'active',
    });
  };

  const hasActiveFilters = filters.city || filters.country || filters.status !== 'active';

  // Get unique cities and countries
  const cities = Array.from(new Set(locations.map(l => l.city))).filter(Boolean);
  const countries = Array.from(new Set(locations.map(l => l.country))).filter(Boolean);

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors
          ${hasActiveFilters
            ? 'border-primary-500 text-primary-700 bg-primary-50 dark:border-primary-400 dark:text-primary-300 dark:bg-primary-900/20'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700'
          }
        `}
      >
        <FunnelIcon className="h-4 w-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full">
            {[filters.city, filters.country, filters.status !== 'active' ? filters.status : ''].filter(Boolean).length}
          </span>
        )}
        <ChevronDownIcon className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Shops
              </h3>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onToggle}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPinIcon className="inline h-4 w-4 mr-1" />
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loadingLocations}
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loadingLocations}
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <BuildingStorefrontIcon className="inline h-4 w-4 mr-1" />
                  Shop Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'pending', label: 'Pending Approval' },
                  ].map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={filters.status === status.value}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {loadingLocations && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Loading locations...
                  </p>
                </div>
              )}

              {/* Location Stats */}
              {!loadingLocations && locations.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Popular Locations
                  </h4>
                  <div className="space-y-1">
                    {locations.slice(0, 3).map((location) => (
                      <button
                        key={`${location.city}-${location.country}`}
                        onClick={() => {
                          handleFilterChange('city', location.city);
                          handleFilterChange('country', location.country);
                        }}
                        className="block w-full text-left px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <span className="font-medium">{location.city}</span>
                        {location.country && (
                          <span>, {location.country}</span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({location.shop_count} shops)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchFilters;
