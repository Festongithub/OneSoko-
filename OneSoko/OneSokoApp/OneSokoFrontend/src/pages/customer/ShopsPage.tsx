import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  EyeIcon,
  BuildingStorefrontIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { shopApi } from '../../services/shopApi';
import type { Shop } from '../../types';
import toast from 'react-hot-toast';

const ShopsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<string[]>(['All Locations']);

  // Dynamically generate locations from shop data as fallback with counts
  const dynamicLocations = React.useMemo(() => {
    const allLocations = ['All Locations'];
    const locationCounts = new Map<string, number>();
    
    shops.forEach(shop => {
      const addLocation = (loc: string) => {
        if (loc && loc.trim()) {
          const trimmedLoc = loc.trim();
          locationCounts.set(trimmedLoc, (locationCounts.get(trimmedLoc) || 0) + 1);
        }
      };
      
      // Add location field
      if (shop.location) {
        addLocation(shop.location);
        
        // Extract city from location field (e.g., "Victoria Island, Lagos" -> "Lagos")
        if (shop.location.includes(',')) {
          const parts = shop.location.split(',').map(part => part.trim());
          parts.forEach(addLocation);
        }
      }
      
      // Add city field
      if (shop.city) {
        addLocation(shop.city);
      }
      
      // Add country field
      if (shop.country) {
        addLocation(shop.country);
      }
    });
    
    // Sort locations alphabetically and add to array
    const sortedLocations = Array.from(locationCounts.keys()).sort();
    allLocations.push(...sortedLocations);
    return allLocations;
  }, [shops]);

  // Use API locations if available, otherwise use dynamic locations
  const locations = availableLocations.length > 1 ? availableLocations : dynamicLocations;

  // Function to get shop count for a location
  const getShopCountForLocation = (location: string): number => {
    if (location === 'All Locations') {
      return shops.length;
    }
    
    return shops.filter(shop => {
      return (shop.location && shop.location.toLowerCase().includes(location.toLowerCase())) ||
             (shop.city && shop.city.toLowerCase().includes(location.toLowerCase())) ||
             (shop.country && shop.country.toLowerCase().includes(location.toLowerCase()));
    }).length;
  };

  const sortOptions = [
    { value: 'name', label: 'Shop Name A-Z' },
    { value: 'name_desc', label: 'Shop Name Z-A' },
    { value: 'created_at', label: 'Newest First' },
    { value: 'created_at_desc', label: 'Oldest First' },
    { value: 'products_count', label: 'Most Products' },
    { value: 'views', label: 'Most Popular' },
    { value: 'total_sales', label: 'Highest Sales' }
  ];

  useEffect(() => {
    fetchShops();
    fetchLocations();
  }, [searchQuery, selectedLocation, sortBy]);

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      let shopsData: Shop[];
      
      // Use search API if there are filters, otherwise get all shops
      if (searchQuery || (selectedLocation && selectedLocation !== 'All Locations')) {
        shopsData = await shopApi.search({
          q: searchQuery,
          location: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
          sort: sortBy
        });
      } else {
        shopsData = await shopApi.getAll();
      }
      
      setShops(shopsData);
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to load shops');
      setShops([]); // Set empty array instead of mock data
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await shopApi.getLocations();
      setAvailableLocations(['All Locations', ...locationsData]);
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Will fall back to dynamicLocations
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All Locations');
    setSortBy('name');
  };

  // Since filtering is now done on the backend, we can use the shops directly
  // But keep local sorting for client-side responsiveness
  const sortedShops = [...shops].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'created_at_desc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'products_count':
        return (b.products_count || b.products.length) - (a.products_count || a.products.length);
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const ShopCard: React.FC<{ shop: Shop; viewMode: 'grid' | 'list' }> = ({ shop, viewMode }) => {
    // Mock rating data (would come from reviews API)
    const rating = 4.2 + Math.random() * 0.8; // Random rating between 4.2-5.0
    const reviewCount = Math.floor(Math.random() * 100) + 20;
    
    if (viewMode === 'list') {
      return (
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="flex items-start space-x-4">
              {/* Shop Logo */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-secondary-200 rounded-lg overflow-hidden">
                  {shop.logo ? (
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BuildingStorefrontIcon className="w-8 h-8 text-secondary-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Shop Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900 truncate">
                        {shop.name}
                      </h3>
                      {shop.status === 'active' && (
                        <span className="badge badge-success text-xs">Active</span>
                      )}
                      {shop.status === 'pending' && (
                        <span className="badge badge-warning text-xs">Pending</span>
                      )}
                      {!shop.is_active && (
                        <span className="badge badge-secondary text-xs">Inactive</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-secondary-600 line-clamp-2 mb-3">
                      {shop.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-secondary-500">
                      {shop.location && (
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {shop.location}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                        {rating.toFixed(1)} ({reviewCount})
                      </div>
                      
                      <div className="flex items-center">
                        <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                        {shop.products_count || shop.products.length} products
                      </div>
                      
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {shop.views} views
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/shops/${shop.shopId}`}
                    className="btn-primary btn-sm ml-4"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    Visit Shop
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card hover:shadow-lg transition-shadow">
        <div className="card-body">
          {/* Shop Logo */}
          <div className="w-full h-32 bg-secondary-200 rounded-lg mb-4 overflow-hidden">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BuildingStorefrontIcon className="w-12 h-12 text-secondary-400" />
              </div>
            )}
          </div>

          {/* Shop Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-secondary-900 truncate">
                {shop.name}
              </h3>
              {shop.status === 'active' && (
                <span className="badge badge-success text-xs">Active</span>
              )}
              {shop.status === 'pending' && (
                <span className="badge badge-warning text-xs">Pending</span>
              )}
              {!shop.is_active && (
                <span className="badge badge-secondary text-xs">Inactive</span>
              )}
            </div>
            
            <p className="text-sm text-secondary-600 line-clamp-3 mb-4">
              {shop.description}
            </p>
            
            <div className="space-y-2 mb-4">
              {shop.location && (
                <div className="flex items-center text-sm text-secondary-500">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  {shop.location}
                </div>
              )}
              
              <div className="flex items-center text-sm text-secondary-500">
                <StarIconSolid className="w-4 h-4 text-yellow-400 mr-2" />
                {rating.toFixed(1)} ({reviewCount} reviews)
              </div>
              
              <div className="flex items-center text-sm text-secondary-500">
                <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
                {shop.products_count || shop.products.length} products
              </div>
              
              <div className="flex items-center text-sm text-secondary-500">
                <EyeIcon className="w-4 h-4 mr-2" />
                {shop.views} views
              </div>
            </div>
            
            <Link
              to={`/shops/${shop.shopId}`}
              className="btn-primary w-full"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Visit Shop
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">Discover Shops</h1>
          <p className="text-secondary-600">
            Explore {shops.length} amazing shops and discover unique products from local sellers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search shops by name, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {locations.map(location => {
                  const count = getShopCountForLocation(location);
                  return (
                    <option key={location} value={location}>
                      {location} {count > 0 && location !== 'All Locations' ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedLocation !== 'All Locations' || sortBy !== 'name') && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-secondary-600">
                Showing {sortedShops.length} of {shops.length} shops
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* View Mode Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary lg:hidden"
                >
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Filters
                </button>
                
                <span className="text-sm text-secondary-600">
                  {sortedShops.length} shop{sortedShops.length !== 1 ? 's' : ''} found
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Shops Grid/List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="spinner w-8 h-8 mx-auto"></div>
                <p className="mt-2 text-sm text-secondary-600">Loading shops...</p>
              </div>
            ) : sortedShops.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }>
                {sortedShops.map(shop => (
                  <ShopCard key={shop.shopId} shop={shop} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-secondary-400 mb-4">
                  <BuildingStorefrontIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  No shops found
                </h3>
                <p className="text-secondary-600 mb-4">
                  {searchQuery || selectedLocation !== 'All Locations' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No shops are currently available'
                  }
                </p>
                {(searchQuery || selectedLocation !== 'All Locations') && (
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination placeholder */}
            {sortedShops.length > 0 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">
                    Showing all {sortedShops.length} shops
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopsPage;
