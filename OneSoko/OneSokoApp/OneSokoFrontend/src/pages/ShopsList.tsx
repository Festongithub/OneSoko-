import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  StarIcon,
  FunnelIcon,
  ViewColumnsIcon,
  MapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { shopsAPI } from '../services/api';
import { Shop } from '../types';
import { config } from '../config/environment';

// Utility function to convert relative URLs to full URLs
const getFullImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL, prepend the backend URL
  if (imageUrl.startsWith('/')) {
    return `${config.BACKEND_URL}${imageUrl}`;
  }
  
  // If it doesn't start with /, assume it's relative to the backend
  return `${config.BACKEND_URL}/${imageUrl}`;
};

const ShopsList: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'orders' | 'newest'>('name');

  // Popular search suggestions
  const searchSuggestions = [
    'Electronics', 'Fashion', 'Food', 'Books', 'Sports', 'Home', 'Beauty', 'Toys',
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'
  ];

  // Quick filter categories
  const quickCategories = [
    { name: 'All Shops', value: '', icon: '🏪' },
    { name: 'Electronics', value: 'electronics', icon: '📱' },
    { name: 'Fashion', value: 'fashion', icon: '👗' },
    { name: 'Food & Drinks', value: 'food', icon: '🍕' },
    { name: 'Home & Garden', value: 'home', icon: '🏠' },
    { name: 'Sports', value: 'sports', icon: '⚽' },
    { name: 'Beauty', value: 'beauty', icon: '💄' },
    { name: 'Books', value: 'books', icon: '📚' }
  ];

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      console.log('Fetching all shops from database...');
      
      // Use public endpoint - no authentication required
      const response = await shopsAPI.getAll();
      console.log('Shops API response:', response);
      console.log('Shops found:', Array.isArray(response) ? response.length : 0);
      
      if (Array.isArray(response) && response.length > 0) {
        console.log('✅ Successfully loaded shops from database');
        // Handle direct array response
        setShops(response);
        return; // Success - exit early
      } else {
        console.log('⚠️ API returned empty results, checking if backend is running...');
        
        // Try to test if the backend is actually running
        try {
          const testResponse = await fetch(`${config.BACKEND_URL}/api/health/` || `${config.API_BASE_URL}/health/`);
          if (testResponse.ok) {
            console.log('✅ Backend is running but no shops found');
            setShops([]);
            setError('No shops found in database. Please create some shops first.');
          } else {
            throw new Error('Backend health check failed');
          }
        } catch (healthError) {
          console.log('❌ Backend connection failed, using mock data');
          throw new Error('Database connection failed');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching shops from database:', error);
      
      // Only use mock data if we can't connect to the database
      if (error instanceof Error && error.message.includes('Database connection failed')) {
        console.log('🔄 Using mock data as fallback');
        const mockShops: Shop[] = [
          {
            shopId: '1',
            name: 'Tech Haven Electronics',
            description: 'Your one-stop shop for all electronics and gadgets. We offer the latest smartphones, laptops, and accessories.',
            location: 'Nairobi, Kenya',
            logo: null,
            created_at: '2024-01-15T10:00:00Z',
            status: 'active',
            phone: '+254700123456',
            email: 'info@techhaven.co.ke',
            social_link: 'https://facebook.com/techhaven',
            slug: 'tech-haven-electronics',
            views: 1250,
            total_sales: 45000,
            total_orders: 89,
            latitude: -1.2921,
            longitude: 36.8219,
            street: 'Kimathi Street',
            city: 'Nairobi',
            country: 'Kenya',
            shopowner: {
              id: 1,
              username: 'techowner',
              email: 'owner@techhaven.co.ke',
              first_name: 'John',
              last_name: 'Kamau',
              date_joined: '2024-01-10T00:00:00Z'
            }
          },
          {
            shopId: '2',
            name: 'Fashion Forward Boutique',
            description: 'Trendy clothing and accessories for men and women. Latest fashion trends at affordable prices.',
            location: 'Mombasa, Kenya',
            logo: null,
            created_at: '2024-01-20T14:30:00Z',
            status: 'active',
            phone: '+254700654321',
            email: 'info@fashionforward.co.ke',
            social_link: 'https://instagram.com/fashionforward',
            slug: 'fashion-forward-boutique',
            views: 890,
            total_sales: 32000,
            total_orders: 67,
            latitude: -4.0435,
            longitude: 39.6682,
            street: 'Moi Avenue',
            city: 'Mombasa',
            country: 'Kenya',
            shopowner: {
              id: 2,
              username: 'fashionista',
              email: 'owner@fashionforward.co.ke',
              first_name: 'Sarah',
              last_name: 'Johnson',
              date_joined: '2024-01-10T00:00:00Z'
            }
          },
          {
            shopId: '3',
            name: 'Fresh Market Groceries',
            description: 'Premium grocery store offering fresh produce, organic foods, and household essentials. Quality guaranteed.',
            location: 'Kisumu, Kenya',
            logo: null,
            created_at: '2024-02-01T09:15:00Z',
            status: 'active',
            phone: '+254700789012',
            email: 'info@freshmarket.co.ke',
            social_link: 'https://facebook.com/freshmarket',
            slug: 'fresh-market-groceries',
            views: 567,
            total_sales: 18000,
            total_orders: 45,
            latitude: -0.1022,
            longitude: 34.7617,
            street: 'Oginga Odinga Street',
            city: 'Kisumu',
            country: 'Kenya',
            shopowner: {
              id: 3,
              username: 'freshmarket',
              email: 'owner@freshmarket.co.ke',
              first_name: 'Michael',
              last_name: 'Ochieng',
              date_joined: '2024-01-25T00:00:00Z'
            }
          }
        ];
        setShops(mockShops);
        setError('⚠️ Database connection failed - showing demo data. Please ensure your backend server is running.');
      } else {
        // Other errors (network, etc.)
        setShops([]);
        setError(`Failed to fetch shops: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query: string, location: string) => {
      if (!query.trim() && !location.trim()) {
        fetchShops();
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Searching database for:', { query, location });
        
        // Try API search first (database search)
        const results = await shopsAPI.search(query, location);
        console.log('📊 Database search results:', results);
        
        if (results && results.length > 0) {
          console.log('✅ Found shops in database');
          setShops(results);
        } else {
          console.log('🔍 No database results, trying client-side filtering');
          
          // If no database results, try filtering all shops
          const allShops = await shopsAPI.getAll();
          const filteredResults = allShops.filter(shop => {
            const matchesSearch = shop.name.toLowerCase().includes(query.toLowerCase()) ||
                                 shop.description.toLowerCase().includes(query.toLowerCase());
            const matchesLocation = !location || 
                                   (shop.city && shop.city.toLowerCase().includes(location.toLowerCase())) ||
                                   (shop.country && shop.country.toLowerCase().includes(location.toLowerCase()));
            return matchesSearch && matchesLocation;
          });
          
          console.log('✅ Found shops using client-side filtering');
          setShops(filteredResults);
        }
      } catch (error) {
        console.error('❌ Database search error:', error);
        setError('Failed to search shops. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300),
    [fetchShops]
  );

  // Effect for real-time search
  useEffect(() => {
    debouncedSearch(searchQuery, locationFilter);
  }, [searchQuery, locationFilter, debouncedSearch]);

  // Helper function to filter shops by category
  const filterShopsByCategory = (shops: Shop[], category: string): Shop[] => {
    if (!category) return shops;
    
    return shops.filter(shop => {
      const shopName = shop.name.toLowerCase();
      const shopDesc = shop.description.toLowerCase();
      const categoryLower = category.toLowerCase();
      
      return shopName.includes(categoryLower) || shopDesc.includes(categoryLower);
    });
  };

  // Helper function to sort shops
  const sortShops = (shops: Shop[], sortBy: string): Shop[] => {
    const sortedShops = [...shops];
    
    switch (sortBy) {
      case 'name':
        return sortedShops.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return sortedShops.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'orders':
        return sortedShops.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));
      case 'newest':
        return sortedShops.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return sortedShops;
    }
  };

  // Get filtered and sorted shops
  const getFilteredShops = (): Shop[] => {
    let filtered = shops;
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filterShopsByCategory(filtered, selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(shop => {
        const query = searchQuery.toLowerCase();
        return shop.name.toLowerCase().includes(query) ||
               shop.description.toLowerCase().includes(query) ||
               shop.city?.toLowerCase().includes(query) ||
               shop.country?.toLowerCase().includes(query);
      });
    }
    
    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(shop => {
        const location = locationFilter.toLowerCase();
        return shop.city?.toLowerCase().includes(location) ||
               shop.country?.toLowerCase().includes(location);
      });
    }
    
    // Apply sorting
    return sortShops(filtered, sortBy);
  };

  // Handle quick category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when category is selected
  };

  // Handle search suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSelectedCategory(''); // Clear category when search is used
  };

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Shops</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Find amazing local businesses in your area</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ViewColumnsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`p-2 rounded-lg ${
                  showMap 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Main Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search for shops, products, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Search Suggestions */}
            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {searchSuggestions
                  .filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Quick Category Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Filters</h3>
            <div className="flex flex-wrap gap-2">
              {quickCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategorySelect(category.value)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Location Filter */}
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Popularity</option>
                <option value="orders">Sort by Orders</option>
                <option value="newest">Sort by Newest</option>
              </select>
            </div>

            {/* View Toggle and Clear Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('');
                  setSelectedCategory('');
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Clear All
              </button>
              
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <ViewColumnsIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <FunnelIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Database Connection Status */}
      {error && error.includes('demo data') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Demo Mode Active
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>You're currently viewing demo data. To search real shops from the database:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Ensure your Django backend server is running on {config.BACKEND_URL}</li>
                  <li>Check that the database has shops created</li>
                  <li>Verify the API endpoints are accessible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Connected Status */}
      {!error && shops.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Database Connected
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Successfully loaded {shops.length} shops from the database. Search functionality is fully operational.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Database Connection Troubleshooting */}
      {error && error.includes('Database connection failed') && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Database Connection Failed
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p className="font-semibold mb-2">To fix this issue, follow these steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li><strong>Start Django Backend:</strong> Open terminal and run:</li>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono ml-4 my-1">
                    cd /path/to/your/django/project<br/>
                    python manage.py runserver
                  </code>
                  <li><strong>Check Backend URL:</strong> Ensure it's running on {config.BACKEND_URL}</li>
                  <li><strong>Test API Endpoint:</strong> Visit {config.API_BASE_URL}/shops/ in browser</li>
                  <li><strong>Create Shops:</strong> Add shops through Django admin or API</li>
                  <li><strong>Refresh Page:</strong> Click "Refresh Shops" button above</li>
                </ol>
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> If your Django backend is running on a different port, update the API_BASE_URL in src/config/environment.ts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Required Message */}
      {error && error.includes('Authentication required') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Login Required
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>To view real shops from the database, please log in to your account.</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shops Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Counter */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getFilteredShops().length} {getFilteredShops().length === 1 ? 'Shop' : 'Shops'} Found
              </h2>
              {(searchQuery || locationFilter || selectedCategory) && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (filtered from {shops.length} total)
                </span>
              )}
            </div>
            
            {getFilteredShops().length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {getFilteredShops().length} of {shops.length} shops
              </div>
            )}
          </div>
        </div>

        {/* Search Results Summary */}
        {(searchQuery || locationFilter || selectedCategory) && getFilteredShops().length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Active Filters:
                </span>
                {searchQuery && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {locationFilter && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                    Location: "{locationFilter}"
                    <button
                      onClick={() => setLocationFilter('')}
                      className="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                    Category: "{selectedCategory}"
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('');
                  setSelectedCategory('');
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {getFilteredShops().length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4">
              <MagnifyingGlassIcon className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No shops found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || locationFilter || selectedCategory 
                ? 'Try adjusting your search criteria or filters.'
                : 'No shops are currently available.'
              }
            </p>
            {(searchQuery || locationFilter || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('');
                  setSelectedCategory('');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Shops Grid/List */}
        {getFilteredShops().length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {getFilteredShops().map((shop) => (
              viewMode === 'grid' ? (
                <ShopCard key={shop.shopId} shop={shop} />
              ) : (
                <ShopListItem key={shop.shopId} shop={shop} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Shop Card Component
const ShopCard: React.FC<{ shop: Shop }> = ({ shop }) => (
  <Link
    to={`/shops/${shop.slug}`}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group border border-gray-200 dark:border-gray-700"
  >
    <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      {shop.logo ? (
        <img
          src={getFullImageUrl(shop.logo) || ''}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div className={`w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center ${shop.logo ? 'hidden' : ''}`}>
        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {shop.name.charAt(0)}
        </span>
      </div>
    </div>
    
    <div className="p-6">
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {shop.name}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
        {shop.description}
      </p>
      
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
        <MapPinIcon className="w-4 h-4 mr-1" />
        {shop.city && shop.country 
          ? `${shop.city}, ${shop.country}`
          : shop.location || 'Location not specified'
        }
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
          <span className="text-sm text-gray-600 dark:text-gray-400">4.5 (120 reviews)</span>
        </div>
        <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
          {shop.total_orders} orders
        </span>
      </div>
    </div>
  </Link>
);

// Shop List Item Component
const ShopListItem: React.FC<{ shop: Shop }> = ({ shop }) => (
  <Link
    to={`/shops/${shop.slug}`}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex items-center space-x-4 group border border-gray-200 dark:border-gray-700"
  >
    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
      {shop.logo ? (
        <img
          src={getFullImageUrl(shop.logo) || ''}
          alt={shop.name}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div className={`w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center ${shop.logo ? 'hidden' : ''}`}>
        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
          {shop.name.charAt(0)}
        </span>
      </div>
    </div>
    
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {shop.name}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
        {shop.description}
      </p>
      
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        <MapPinIcon className="w-4 h-4 mr-1" />
        {shop.city && shop.country 
          ? `${shop.city}, ${shop.country}`
          : shop.location || 'Location not specified'
        }
      </div>
    </div>
    
    <div className="text-right">
      <div className="flex items-center justify-end mb-2">
        <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
        <span className="text-sm text-gray-600 dark:text-gray-400">4.5 (120)</span>
      </div>
      <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
        {shop.total_orders} orders
      </span>
    </div>
  </Link>
);

export default ShopsList; 