import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  EyeIcon,
  XMarkIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import AddToCartButton from '../../components/cart/AddToCartButton';
import { productApi, categoryApi } from '../../services/productApi';
import type { Product, Category } from '../../types';
import { useQuery } from '@tanstack/react-query';

// Mock data - replace with real API calls later
const categories = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Beauty',
  'Automotive',
  'Toys',
  'Health'
];

const brands = [
  'Apple',
  'Samsung',
  'Nike',
  'Adidas',
  'Sony',
  'LG',
  'Canon',
  'Nikon',
  'Dell',
  'HP'
];

// Mock products with Product interface structure
const products = [
  {
    productId: '1',
    name: 'Wireless Bluetooth Headphones Premium',
    description: 'High-quality wireless headphones with noise cancellation',
    price: '89.99',
    promotional_price: '129.99',
    quantity: 25,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    discount: '31',
    is_active: true,
    category: { id: 1, name: 'Electronics', created_at: '', updated_at: '' },
    tags: [],
    variants: [],
    reviews: [],
    average_rating: 4.5,
    // Additional display properties
    reviewCount: 128,
    badge: 'Best Seller',
    shop: 'TechWorld Store',
    brand: 'Sony'
  },
  {
    productId: '2',
    name: 'Smart Fitness Watch with Heart Monitor',
    description: 'Advanced fitness tracking with heart rate monitoring',
    price: '199.99',
    promotional_price: '299.99',
    quantity: 15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    discount: '33',
    is_active: true,
    category: { id: 1, name: 'Electronics', created_at: '', updated_at: '' },
    tags: [],
    variants: [],
    reviews: [],
    average_rating: 4.8,
    reviewCount: 89,
    badge: 'Limited Offer',
    shop: 'HealthTech Hub',
    brand: 'Apple'
  },
  {
    productId: '3',
    name: 'Organic Cotton T-Shirt Comfortable',
    description: 'Soft organic cotton t-shirt for everyday wear',
    price: '24.99',
    promotional_price: '39.99',
    quantity: 50,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    discount: '38',
    is_active: true,
    category: { id: 2, name: 'Fashion', created_at: '', updated_at: '' },
    tags: [],
    variants: [],
    reviews: [],
    average_rating: 4.3,
    reviewCount: 67,
    badge: 'Eco-Friendly',
    shop: 'Green Fashion Co',
    brand: 'Nike'
  },
  {
    productId: '4',
    name: 'Professional Camera Lens 50mm',
    description: 'High-quality 50mm lens for professional photography',
    price: '449.99',
    promotional_price: '599.99',
    quantity: 8,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop',
    discount: '25',
    is_active: true,
    category: { id: 1, name: 'Electronics', created_at: '', updated_at: '' },
    tags: [],
    variants: [],
    reviews: [],
    average_rating: 4.9,
    reviewCount: 156,
    badge: 'Professional',
    shop: 'PhotoPro Gear',
    brand: 'Canon'
  },
  {
    productId: '5',
    name: 'Minimalist Desk Lamp LED',
    description: 'Modern LED desk lamp with adjustable brightness',
    price: '79.99',
    promotional_price: '119.99',
    quantity: 20,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    discount: '33',
    is_active: true,
    category: { id: 3, name: 'Home & Garden', created_at: '', updated_at: '' },
    tags: [],
    variants: [],
    reviews: [],
    average_rating: 4.6,
    reviewCount: 94,
    badge: 'Design Award',
    shop: 'Modern Living',
    brand: 'LG'
  },
  {
    productId: '6',
    name: 'Yoga Mat Premium Non-Slip',
    description: 'Premium non-slip yoga mat for all fitness levels',
    price: '34.99',
    promotional_price: '54.99',
    quantity: 35,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    discount: '36',
    is_active: true,
    category: { id: 4, name: 'Sports', created_at: '', updated_at: '' },
    tags: [],
    variants: [],
    reviews: [],
    average_rating: 4.4,
    reviewCount: 203,
    badge: 'Popular',
    shop: 'Wellness Store',
    brand: 'Adidas'
  },
  {
    productId: '7',
    name: 'Smartphone Case Clear Protection',
    description: 'Crystal clear protection for your smartphone',
    price: '19.99',
    promotional_price: '29.99',
    quantity: 100,
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=400&fit=crop',
    discount: '33',
    is_active: true,
    category: { id: 1, name: 'Electronics', created_at: '', updated_at: '' },
    tags: [],
    variants: [],
    reviews: [],
    average_rating: 4.2,
    reviewCount: 45,
    badge: 'New',
    shop: 'Mobile Accessories',
    brand: 'Samsung'
  },
  {
    productId: '8',
    name: 'Running Shoes Lightweight',
    description: 'Lightweight running shoes for optimal performance',
    price: '89.99',
    promotional_price: '139.99',
    quantity: 30,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    discount: '36',
    is_active: true,
    category: { id: 4, name: 'Sports', created_at: '', updated_at: '' },
    tags: [],
    variants: [],
    reviews: [],
    average_rating: 4.7,
    reviewCount: 178,
    badge: 'Sport',
    shop: 'Athletic Store',
    brand: 'Nike'
  }
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' }
];

const ProductCard: React.FC<{ product: Product & { badge: string; shop: string; brand: string; reviewCount: number }; viewMode: 'grid' | 'list' }> = ({ 
  product, 
  viewMode 
}) => {
  const price = parseFloat(product.price);
  const originalPrice = product.promotional_price ? parseFloat(product.promotional_price) : price;
  const discountPercentage = product.promotional_price ? parseInt(product.discount) : 0;

  if (viewMode === 'list') {
    return (
      <div className="card group cursor-pointer shadow-hover overflow-hidden">
        <div className="flex">
          <div className="relative w-48 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2">
              <span className={`badge px-2 py-1 text-xs font-semibold rounded-full ${
                product.badge === 'Best Seller' ? 'bg-orange-100 text-orange-800' :
                product.badge === 'Limited Offer' ? 'bg-red-100 text-red-800' :
                product.badge === 'Eco-Friendly' ? 'bg-green-100 text-green-800' :
                product.badge === 'Professional' ? 'bg-blue-100 text-blue-800' :
                product.badge === 'Design Award' ? 'bg-purple-100 text-purple-800' :
                'bg-primary-100 text-primary-800'
              }`}>
                {product.badge}
              </span>
            </div>
            {discountPercentage > 0 && (
              <div className="absolute bottom-2 left-2">
                <span className="bg-danger-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{discountPercentage}%
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-xs text-secondary-600 mb-1">{product.shop}</p>
                <Link to={`/products/${product.productId}`}>
                  <h3 className="font-semibold text-lg text-secondary-900 group-hover:text-primary-600 transition-colors mb-2">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-secondary-600 ml-2">
                    ({product.reviewCount})
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl font-bold text-secondary-900">
                    ${price.toFixed(2)}
                  </span>
                  {originalPrice > price && (
                    <span className="text-sm text-secondary-500 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-between h-full min-w-[120px] pl-4">
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-secondary-100 rounded-full hover:bg-secondary-200 transition-colors">
                    <HeartIcon className="w-4 h-4 text-secondary-600" />
                  </button>
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
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className={`badge px-2 py-1 text-xs font-semibold rounded-full ${
            product.badge === 'Best Seller' ? 'bg-orange-100 text-orange-800' :
            product.badge === 'Limited Offer' ? 'bg-red-100 text-red-800' :
            product.badge === 'Eco-Friendly' ? 'bg-green-100 text-green-800' :
            product.badge === 'Professional' ? 'bg-blue-100 text-blue-800' :
            product.badge === 'Design Award' ? 'bg-purple-100 text-purple-800' :
            'bg-primary-100 text-primary-800'
          }`}>
            {product.badge}
          </span>
        </div>
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
          <p className="text-xs text-secondary-600 mb-1">{product.shop}</p>
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
                  i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-secondary-600 ml-2">
            ({product.reviewCount})
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
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedBrands([]);
    setPriceRange([0, 1000]);
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'All Categories' && product.category?.name !== selectedCategory) {
      return false;
    }
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    const productPrice = parseFloat(product.price);
    if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">Products</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Showing {filteredProducts.length} of {products.length} products
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

                {/* Brands */}
                <div>
                  <h4 className="font-medium text-secondary-900 mb-3">Brands</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-secondary-700">{brand}</span>
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
            {(selectedCategory !== 'All Categories' || selectedBrands.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-secondary-600">Active filters:</span>
                {selectedCategory !== 'All Categories' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('All Categories')}
                      className="ml-2"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBrands.map(brand => (
                  <span key={brand} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {brand}
                    <button
                      onClick={() => toggleBrand(brand)}
                      className="ml-2"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
              }>
                {filteredProducts.map(product => (
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
                  Try adjusting your filters or search criteria
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
            {filteredProducts.length > 0 && (
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
