import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  EyeIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import AddToCartButton from '../../components/cart/AddToCartButton';
import { productApi, categoryApi } from '../../services/productApi';
import type { Product } from '../../types';
<<<<<<< HEAD
import { toNumber } from '../../utils/helpers';
=======
import { useQuery } from '@tanstack/react-query';
>>>>>>> 6ff59c0b0e42dec017f8df4c1fa4b08be20c7749

// Sort options
const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' }
];

const ProductCard: React.FC<{ product: Product; viewMode: 'grid' | 'list' }> = ({ 
  product, 
  viewMode 
}) => {
  const price = toNumber(product.price);
  const originalPrice = product.promotional_price ? toNumber(product.promotional_price) : price;
  const discountPercentage = product.promotional_price ? parseInt(String(product.discount || '0')) : 0;

  // Calculate review stats
  const rating = product.average_rating || 0;
  const reviewCount = product.reviews?.length || 0;

  // Get first shop info
  const firstShop = product.shops && product.shops.length > 0 ? product.shops[0] : null;
  const totalShops = product.shops?.length || 0;

  if (viewMode === 'list') {
    return (
      <div className="card group cursor-pointer shadow-hover overflow-hidden">
        <div className="flex">
          <div className="relative w-48 flex-shrink-0">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
              alt={product.name}
              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2">
                <span className="bg-danger-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{discountPercentage}%
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between h-full">
              <div className="flex flex-col flex-1">
                <div className="mb-2">
                  <Link to={`/products/${product.productId}`}>
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-secondary-600 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>
                
                {/* Shop Information */}
                {firstShop && (
                  <div className="flex items-center text-sm text-secondary-600 mb-3">
                    <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                    <span className="font-medium text-primary-600">{firstShop.name}</span>
                    {totalShops > 1 && (
                      <span className="ml-1">+{totalShops - 1} more shops</span>
                    )}
                    {firstShop.city && (
                      <>
                        <MapPinIcon className="w-3 h-3 ml-2 mr-1" />
                        <span>{firstShop.city}</span>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-secondary-600 ml-2">
                    ({reviewCount} reviews)
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-secondary-900">
                      ${price.toFixed(2)}
                    </span>
                    {originalPrice > price && (
                      <span className="text-sm text-secondary-500 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button className="p-2 text-secondary-400 hover:text-red-500 transition-colors">
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col justify-between items-end ml-4">
                <div className="flex space-x-2">
                  <button className="p-2 bg-secondary-100 rounded-full hover:bg-secondary-200 transition-colors">
                    <EyeIcon className="w-4 h-4 text-secondary-600" />
                  </button>
                </div>
                <div className="w-full mt-auto pt-2">
                  <AddToCartButton product={product} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group cursor-pointer shadow-hover overflow-hidden">
      <div className="relative">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col space-y-2">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
              <HeartIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
              <EyeIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        {discountPercentage > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-danger-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              -{discountPercentage}%
            </span>
          </div>
        )}
      </div>
      
      <div className="card-body p-4">
        <div className="mb-3">
          {/* Shop Information */}
          {firstShop && (
            <div className="flex items-center text-xs text-secondary-600 mb-2">
              <BuildingStorefrontIcon className="w-3 h-3 mr-1" />
              <span className="font-medium text-primary-600">{firstShop.name}</span>
              {totalShops > 1 && (
                <span className="ml-1">+{totalShops - 1}</span>
              )}
            </div>
          )}
          <Link to={`/products/${product.productId}`}>
            <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-secondary-600 ml-2">
            ({reviewCount})
          </span>
        </div>
        
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col space-y-1 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-secondary-900">
                ${price.toFixed(2)}
              </span>
              {originalPrice > price && (
                <span className="text-sm text-secondary-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Shops indicator */}
            {firstShop && firstShop.city && (
              <div className="flex items-center text-xs text-secondary-500">
                <MapPinIcon className="w-3 h-3 mr-1" />
                <span>{firstShop.city}</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 min-w-[90px]">
            <AddToCartButton product={product} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products from API
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll
  });

  // Fetch categories from API
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll
  });

  // Build categories list with "All Categories" option
  const categories = ['All Categories', ...categoriesData.map(cat => cat.name)];

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setPriceRange([0, 1000]);
  };

  // Filter products based on selected criteria
  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'All Categories' && product.category?.name !== selectedCategory) {
      return false;
    }
    const productPrice = parseFloat(product.price);
    if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
      return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'newest':
        // Assuming products have a created_at field, otherwise use random
        return Math.random() - 0.5;
      default:
        return 0;
    }
  });

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products. Please try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">
            All Products
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Discover products from shops across our marketplace
          </p>
          <p className="text-sm text-secondary-500 dark:text-secondary-500">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold text-secondary-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>
              
              <div className="card-body space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-medium text-secondary-900 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-secondary-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-secondary-900 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-secondary-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary lg:hidden"
                >
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Filters
                </button>
                
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

              <div className="flex items-center space-x-4">
                <span className="text-sm text-secondary-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-auto"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {selectedCategory !== 'All Categories' && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-secondary-600">Active filters:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('All Categories')}
                    className="ml-2"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}

            {/* Products Grid/List */}
            {sortedProducts.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
              }>
                {sortedProducts.map(product => (
                  <ProductCard key={product.productId} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-secondary-400 mb-4">
                  <FunnelIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  No products found
                </h3>
                <p className="text-secondary-600 mb-4">
                  Try adjusting your filters or check back later for new products
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination - placeholder */}
            {sortedProducts.length > 0 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  <button className="px-3 py-2 text-sm border border-secondary-300 rounded hover:bg-secondary-50">
                    Previous
                  </button>
                  <button className="px-3 py-2 text-sm bg-primary-600 text-white rounded">
                    1
                  </button>
                  <button className="px-3 py-2 text-sm border border-secondary-300 rounded hover:bg-secondary-50">
                    2
                  </button>
                  <button className="px-3 py-2 text-sm border border-secondary-300 rounded hover:bg-secondary-50">
                    3
                  </button>
                  <button className="px-3 py-2 text-sm border border-secondary-300 rounded hover:bg-secondary-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
