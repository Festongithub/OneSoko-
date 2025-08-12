import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  shop: string;
  inStock: boolean;
  isWishlisted: boolean;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.5,
      reviewCount: 128,
      category: 'Electronics',
      shop: 'TechStore',
      inStock: true,
      isWishlisted: false
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable and eco-friendly cotton t-shirt',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      rating: 4.2,
      reviewCount: 89,
      category: 'Clothing',
      shop: 'EcoFashion',
      inStock: true,
      isWishlisted: true
    },
    {
      id: '3',
      name: 'Smart Fitness Watch',
      description: 'Track your health and fitness with this smart watch',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 256,
      category: 'Electronics',
      shop: 'TechStore',
      inStock: true,
      isWishlisted: false
    },
    {
      id: '4',
      name: 'Handcrafted Ceramic Mug',
      description: 'Beautiful handcrafted ceramic coffee mug',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 67,
      category: 'Home & Garden',
      shop: 'ArtisanCrafts',
      inStock: true,
      isWishlisted: false
    },
    {
      id: '5',
      name: 'Leather Crossbody Bag',
      description: 'Stylish and practical leather crossbody bag',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
      rating: 4.3,
      reviewCount: 142,
      category: 'Fashion',
      shop: 'LuxuryBags',
      inStock: false,
      isWishlisted: true
    },
    {
      id: '6',
      name: 'Natural Face Cream',
      description: 'Hydrating face cream with natural ingredients',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
      rating: 4.6,
      reviewCount: 203,
      category: 'Beauty',
      shop: 'NaturalBeauty',
      inStock: true,
      isWishlisted: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 500]);

  const categories = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Fashion', 'Beauty'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  const toggleWishlist = (productId: string) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, isWishlisted: !product.isWishlisted }
          : product
      )
    );
  };

  const addToCart = (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', productId);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? (
          <StarIconSolid className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600">
            <Squares2X2Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
            <p className="text-gray-600 dark:text-gray-400">Discover amazing products from our sellers</p>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {sortedProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Grid/List */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-8">
          <Squares2X2Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Product Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full object-cover ${viewMode === 'list' ? 'h-32' : 'h-48'}`}
                />
                {!product.inStock && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Out of Stock
                  </div>
                )}
                {product.originalPrice && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className={`p-3 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Shop */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    by {product.shop}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={!product.inStock}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <ShoppingCartIcon className="w-3 h-3" />
                    <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      product.isWishlisted
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 hover:bg-red-100 hover:text-red-600'
                    }`}
                  >
                    <HeartIcon className={`w-3 h-3 ${product.isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products; 