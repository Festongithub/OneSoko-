import React, { useState } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

interface FilterOptions {
  location: string;
  rating: number | null;
  minSales: number | null;
  maxSales: number | null;
  minOrders: number | null;
  maxOrders: number | null;
  status: string[];
  sortBy: 'name' | 'rating' | 'sales' | 'orders' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

interface ShopFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const ShopFilters: React.FC<ShopFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return value !== null;
    return false;
  });

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return value !== null;
    return false;
  }).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <FunnelIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isOpen && (
        <div className="p-4 space-y-6">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              placeholder="City, Country, or Address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <StarIcon className="w-4 h-4 inline mr-1" />
              Minimum Rating
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Star</option>
            </select>
          </div>

          {/* Sales Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
              Sales Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minSales || ''}
                onChange={(e) => updateFilter('minSales', e.target.value ? Number(e.target.value) : null)}
                placeholder="Min Sales"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="number"
                value={filters.maxSales || ''}
                onChange={(e) => updateFilter('maxSales', e.target.value ? Number(e.target.value) : null)}
                placeholder="Max Sales"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Orders Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ShoppingBagIcon className="w-4 h-4 inline mr-1" />
              Orders Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minOrders || ''}
                onChange={(e) => updateFilter('minOrders', e.target.value ? Number(e.target.value) : null)}
                placeholder="Min Orders"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="number"
                value={filters.maxOrders || ''}
                onChange={(e) => updateFilter('maxOrders', e.target.value ? Number(e.target.value) : null)}
                placeholder="Max Orders"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Status
            </label>
            <div className="space-y-2">
              {[
                { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
                { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' }
              ].map(status => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.value)}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...filters.status, status.value]
                        : filters.status.filter(s => s !== status.value);
                      updateFilter('status', newStatus);
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="sales">Sales</option>
                <option value="orders">Orders</option>
                <option value="created_at">Date Created</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilter('sortOrder', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFiltersChange({
                  ...filters,
                  rating: 4,
                  status: ['active']
                })}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
              >
                Top Rated
              </button>
              <button
                onClick={() => onFiltersChange({
                  ...filters,
                  minSales: 1000,
                  status: ['active']
                })}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
              >
                High Sales
              </button>
              <button
                onClick={() => onFiltersChange({
                  ...filters,
                  minOrders: 50,
                  status: ['active']
                })}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200"
              >
                Popular
              </button>
              <button
                onClick={() => onFiltersChange({
                  ...filters,
                  sortBy: 'created_at',
                  sortOrder: 'desc'
                })}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200"
              >
                Newest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFilters; 