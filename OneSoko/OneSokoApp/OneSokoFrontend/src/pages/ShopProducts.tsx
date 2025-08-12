import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import MiniCart from '../components/MiniCart';
import { shopsAPI, productsAPI } from '../services/api';
import { Shop, Product } from '../types';
import { config } from '../config/environment';

const ShopProducts: React.FC = () => {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });

  useEffect(() => {
    if (shopSlug) {
      fetchShopAndProducts();
    }
  }, [shopSlug]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, sortBy, priceRange]);

  const fetchShopAndProducts = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch shop details
      const shopData = await shopsAPI.getBySlug(shopSlug!);
      setShop(shopData);

      // Fetch shop products
      const productsData = await shopsAPI.getProducts(shopData.shopId);
      setProducts(productsData);
      
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => {
      const price = product.promotional_price || product.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const priceA = a.promotional_price || a.price;
          const priceB = b.promotional_price || b.price;
          return priceA - priceB;
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const getFullImageUrl = (imageUrl: string | null): string | null => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return `${config.BACKEND_URL}${imageUrl}`;
    }
    
    return `${config.BACKEND_URL}/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {error || 'Shop not found'}
          </h3>
          <Link
            to="/shops"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            ← Back to Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Link
              to="/shops"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Shops
            </Link>
          </div>

          {/* Shop Info */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4 mb-4 lg:mb-0">
              {/* Shop Logo */}
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                {shop.logo ? (
                  <img
                    src={getFullImageUrl(shop.logo) || ''}
                    alt={shop.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {shop.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Shop Details */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {shop.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {shop.description}
                </p>
                
                {/* Shop Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {(shop.city || shop.country) && (
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {shop.city && shop.country ? `${shop.city}, ${shop.country}` : shop.location}
                    </div>
                  )}
                  
                  {shop.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      {shop.phone}
                    </div>
                  )}
                  
                  {shop.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-1" />
                      {shop.email}
                    </div>
                  )}
                  
                  {shop.social_link && (
                    <a
                      href={shop.social_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <GlobeAltIcon className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  )}
                </div>

                {/* Shop Stats */}
                <div className="flex items-center space-x-6 mt-3">
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      4.5 rating
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {shop.total_orders || 0} orders
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {products.length} products
                  </span>
                </div>
              </div>
            </div>

            {/* Cart Icon */}
            <div className="flex items-center space-x-4">
              <MiniCart iconSize="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="newest">Sort by Newest</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ViewColumnsIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <FunnelIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Products ({filteredProducts.length})
          </h2>
          
          {searchQuery && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing results for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search criteria.'
                : 'This shop doesn\'t have any products yet.'
              }
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
          }>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                shop={shop}
                showShopInfo={false}
                size={viewMode === 'grid' ? 'md' : 'lg'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProducts;
