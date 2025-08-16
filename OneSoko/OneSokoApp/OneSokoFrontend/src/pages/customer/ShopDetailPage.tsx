import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { shopApi } from '../../services/shopApi';
import type { Shop, Product } from '../../types';
import toast from 'react-hot-toast';

const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock categories for filtering
  const categories = [
    'All Categories',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Health & Beauty'
  ];

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low-High' },
    { value: 'price_desc', label: 'Price High-Low' },
    { value: 'created_at', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    if (id) {
      fetchShopData();
    }
  }, [id]);

  const fetchShopData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const shopData = await shopApi.getById(parseInt(id));
      setShop(shopData);
      
      const productsData = await shopApi.getProducts(parseInt(id));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching shop data:', error);
      toast.error('Failed to load shop details');
      
      // Fallback to mock data
      const mockShop: Shop = {
        id: parseInt(id),
        name: 'TechHub Electronics',
        description: 'Your one-stop shop for the latest electronics and gadgets. We specialize in premium quality products at competitive prices. From smartphones and laptops to smart home devices and gaming equipment, we have everything you need to stay connected and entertained.',
        address: 'Plot 123, Victoria Island, Lagos State, Nigeria',
        phone_number: '+234 801 234 5678',
        email: 'info@techhub.ng',
        shopowner: {
          id: 1,
          username: 'techhub_owner',
          email: 'owner@techhub.ng',
          first_name: 'John',
          last_name: 'Doe'
        },
        products: [],
        logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
        banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&crop=center',
        is_verified: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      };
      
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'iPhone 15 Pro Max',
          description: 'Latest iPhone with A17 Pro chip and titanium design',
          price: '1299.99',
          stock_quantity: 15,
          category: { id: 1, name: 'Electronics', description: 'Electronic devices', created_at: '2024-01-01', updated_at: '2024-01-01' },
          tags: [{ id: 1, name: 'smartphone' }, { id: 2, name: 'premium' }],
          image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T15:30:00Z',
          variants: []
        },
        {
          id: 2,
          name: 'MacBook Pro 16"',
          description: 'Powerful laptop for professionals with M3 chip',
          price: '2499.99',
          stock_quantity: 8,
          category: { id: 1, name: 'Electronics', description: 'Electronic devices', created_at: '2024-01-01', updated_at: '2024-01-01' },
          tags: [{ id: 3, name: 'laptop' }, { id: 2, name: 'premium' }],
          image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-21T15:30:00Z',
          variants: []
        },
        {
          id: 3,
          name: 'AirPods Pro',
          description: 'Wireless earbuds with active noise cancellation',
          price: '249.99',
          stock_quantity: 25,
          category: { id: 1, name: 'Electronics', description: 'Electronic devices', created_at: '2024-01-01', updated_at: '2024-01-01' },
          tags: [{ id: 4, name: 'audio' }, { id: 5, name: 'wireless' }],
          image_url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
          created_at: '2024-01-17T10:00:00Z',
          updated_at: '2024-01-22T15:30:00Z',
          variants: []
        }
      ];
      
      setShop(mockShop);
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || selectedCategory === '' ||
                           product.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price_desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating':
        return Math.random() - 0.5; // Random for demo
      default:
        return 0;
    }
  });

  const ProductCard: React.FC<{ product: Product; viewMode: 'grid' | 'list' }> = ({ product, viewMode }) => {
    const rating = 4.2 + Math.random() * 0.8;
    const reviewCount = Math.floor(Math.random() * 50) + 10;
    
    if (viewMode === 'list') {
      return (
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-secondary-200 rounded-lg overflow-hidden flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBagIcon className="w-8 h-8 text-secondary-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-secondary-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-secondary-500 mb-3">
                      <div className="flex items-center">
                        <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                        {rating.toFixed(1)} ({reviewCount})
                      </div>
                      <span className={`badge ${
                        product.stock_quantity > 10 ? 'badge-success' : 
                        product.stock_quantity > 0 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary-600 mb-2">
                      ${product.price}
                    </div>
                    <div className="space-x-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn-secondary btn-sm"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      <button className="btn-primary btn-sm">
                        <ShoppingBagIcon className="w-4 h-4 mr-1" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
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
          <div className="w-full h-48 bg-secondary-200 rounded-lg mb-4 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBagIcon className="w-12 h-12 text-secondary-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              {product.name}
            </h3>
            <p className="text-sm text-secondary-600 line-clamp-3 mb-4">
              {product.description}
            </p>
            
            <div className="flex items-center text-sm text-secondary-500 mb-4">
              <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
              {rating.toFixed(1)} ({reviewCount})
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-primary-600">
                ${product.price}
              </div>
              <span className={`badge ${
                product.stock_quantity > 10 ? 'badge-success' : 
                product.stock_quantity > 0 ? 'badge-warning' : 'badge-danger'
              }`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>
            
            <div className="space-y-2">
              <Link
                to={`/products/${product.id}`}
                className="btn-secondary w-full"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </Link>
              <button className="btn-primary w-full">
                <ShoppingBagIcon className="w-4 h-4 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingStorefrontIcon className="w-16 h-16 mx-auto text-secondary-400 mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Shop not found</h2>
          <p className="text-secondary-600 mb-4">The shop you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/shops')}
            className="btn-primary"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Shops
          </button>
        </div>
      </div>
    );
  }

  const rating = 4.2 + Math.random() * 0.8;
  const reviewCount = Math.floor(Math.random() * 200) + 50;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Shop Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/shops')}
              className="mr-4 p-2 text-secondary-600 hover:text-secondary-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <nav className="text-sm">
              <Link to="/shops" className="text-primary-600 hover:text-primary-700">
                Shops
              </Link>
              <span className="mx-2 text-secondary-400">/</span>
              <span className="text-secondary-900">{shop.name}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shop Logo */}
            <div className="lg:col-span-1">
              <div className="w-full h-64 bg-secondary-200 rounded-lg overflow-hidden">
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-24 h-24 text-secondary-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Shop Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-secondary-900">
                      {shop.name}
                    </h1>
                    {shop.is_verified && (
                      <span className="badge badge-primary">Verified Shop</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-secondary-500 mb-4">
                    <div className="flex items-center">
                      <StarIconSolid className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="font-medium">{rating.toFixed(1)}</span>
                      <span className="ml-1">({reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <BuildingStorefrontIcon className="w-5 h-5 mr-1" />
                      {products.length} products
                    </div>
                    <div>
                      Member since {new Date(shop.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-secondary-700 mb-6 leading-relaxed">
                {shop.description}
              </p>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shop.address && (
                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-secondary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-secondary-900">Address</div>
                      <div className="text-sm text-secondary-600">{shop.address}</div>
                    </div>
                  </div>
                )}
                
                {shop.phone_number && (
                  <div className="flex items-start">
                    <PhoneIcon className="w-5 h-5 text-secondary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-secondary-900">Phone</div>
                      <div className="text-sm text-secondary-600">{shop.phone_number}</div>
                    </div>
                  </div>
                )}
                
                {shop.email && (
                  <div className="flex items-start">
                    <EnvelopeIcon className="w-5 h-5 text-secondary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-secondary-900">Email</div>
                      <div className="text-sm text-secondary-600">{shop.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Products</h2>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
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
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-secondary-600">
              {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
            </span>

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
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }>
            {sortedProducts.map(product => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-secondary-400 mb-4">
              <ShoppingBagIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No products found
            </h3>
            <p className="text-secondary-600">
              {searchQuery || selectedCategory !== 'All Categories'
                ? 'Try adjusting your search or filter criteria'
                : 'This shop doesn\'t have any products yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetailPage;
