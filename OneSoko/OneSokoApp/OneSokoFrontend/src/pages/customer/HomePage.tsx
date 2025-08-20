import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TruckIcon, 
  ShieldCheckIcon,
  HeartIcon,
  EyeIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import AddToCartButton from '../../components/cart/AddToCartButton';
import QuickLinksWidget from '../../components/layout/QuickLinksWidget';
import type { Product } from '../../types';

// Mock data - replace with real API calls later
const featuredCategories = [
  {
    id: 1,
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    productCount: 1250,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    productCount: 890,
    color: 'bg-pink-500'
  },
  {
    id: 3,
    name: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    productCount: 670,
    color: 'bg-green-500'
  },
  {
    id: 4,
    name: 'Sports',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    productCount: 540,
    color: 'bg-orange-500'
  },
  {
    id: 5,
    name: 'Books',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    productCount: 320,
    color: 'bg-purple-500'
  },
  {
    id: 6,
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    productCount: 450,
    color: 'bg-red-500'
  }
];

const featuredProducts: Product[] = [
  {
    productId: 'demo-1',
    name: 'Wireless Bluetooth Headphones',
    price: '89.99',
    promotional_price: '89.99',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    description: 'High-quality wireless headphones with noise cancellation',
    quantity: 25,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '30.00',
    deleted_at: undefined,
    originalPrice: 129.99,
    rating: 4.5,
    badge: 'Best Seller',
    shop: 'TechWorld Store'
  },
  {
    productId: 'demo-2',
    name: 'Smart Fitness Watch',
    price: '199.99',
    promotional_price: '199.99',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    description: 'Advanced fitness tracker with heart rate monitoring',
    quantity: 15,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '33.00',
    deleted_at: undefined,
    originalPrice: 299.99,
    rating: 4.8,
    badge: 'Limited Offer',
    shop: 'HealthTech Hub'
  },
  {
    productId: 'demo-3',
    name: 'Organic Cotton T-Shirt',
    price: '24.99',
    promotional_price: '24.99',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    description: 'Comfortable organic cotton t-shirt, eco-friendly',
    quantity: 50,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '37.00',
    deleted_at: undefined,
    originalPrice: 39.99,
    rating: 4.3,
    badge: 'Eco-Friendly',
    shop: 'Green Fashion Co'
  },
  {
    productId: 'demo-4',
    name: 'Professional Camera Lens',
    price: '449.99',
    promotional_price: '449.99',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop',
    description: 'Professional 50mm lens for DSLR cameras',
    quantity: 8,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '25.00',
    deleted_at: undefined,
    originalPrice: 599.99,
    rating: 4.9,
    badge: 'Professional',
    shop: 'PhotoPro Gear'
  },
  {
    productId: 'demo-5',
    name: 'Minimalist Desk Lamp',
    price: '79.99',
    promotional_price: '79.99',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    description: 'Modern minimalist desk lamp with adjustable brightness',
    quantity: 30,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '33.00',
    deleted_at: undefined,
    originalPrice: 119.99,
    rating: 4.6,
    badge: 'Design Award',
    shop: 'Modern Living'
  },
  {
    productId: 'demo-6',
    name: 'Yoga Mat Premium',
    price: '34.99',
    promotional_price: '34.99',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    description: 'Premium yoga mat with excellent grip and comfort',
    quantity: 40,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '36.00',
    deleted_at: undefined,
    originalPrice: 54.99,
    rating: 4.4,
    badge: 'Popular',
    shop: 'Wellness Store'
  }
];

const features = [
  {
    icon: TruckIcon,
    title: 'Free Shipping',
    description: 'Free delivery on orders over $50'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Payment',
    description: '100% secure and encrypted payments'
  },
  {
    icon: HeartIcon,
    title: 'Quality Products',
    description: 'Handpicked products from trusted sellers'
  },
  {
    icon: SparklesIcon,
    title: 'Best Prices',
    description: 'Competitive prices and amazing deals'
  }
];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const originalPrice = product.originalPrice || parseFloat(product.price);
  const currentPrice = parseFloat(product.promotional_price || product.price);
  const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

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
      
      <div className="card-body">
        <div className="mb-2">
          <p className="text-xs text-secondary-600 mb-1">{product.shop}</p>
          <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-secondary-600 ml-2">
            ({product.reviews?.length || 0})
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-secondary-900">
              ${currentPrice}
            </span>
            {originalPrice > currentPrice && (
              <span className="text-sm text-secondary-500 line-through">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <div className="mt-2">
          <AddToCartButton
            product={product}
            size="sm"
            showQuantitySelector={false}
          />
        </div>
      </div>
    </div>
  );
};

const CategoryCard: React.FC<{ category: typeof featuredCategories[0] }> = ({ category }) => {
  return (
    <Link to={`/categories/${category.id}`} className="group">
      <div className="card overflow-hidden shadow-hover">
        <div className="relative">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300">
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
              <p className="text-sm opacity-90">{category.productCount} products</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate('/cart');
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Enterprise E-commerce Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="block">Scale Your Business</span>
              <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                With OneSoko
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-white/90 leading-relaxed">
              Connect with thousands of businesses and customers. Powerful tools for growth, 
              analytics for insights, and enterprise-grade security for peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button 
                onClick={handleStartShopping}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white hover:bg-neutral-50 rounded-xl transition-all shadow-elevated hover:shadow-xl"
              >
                Start Exploring
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </button>
              <Link 
                to="/register/shop-owner" 
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm"
              >
                Become a Seller
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">10k+</div>
                <div className="text-sm text-white/70">Active Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50k+</div>
                <div className="text-sm text-white/70">Products Listed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-white/70">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-white/70">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
              Quick Access Dashboard
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Access your most important tools and features instantly. Designed for efficiency and productivity.
            </p>
          </div>
          <QuickLinksWidget 
            variant="grid" 
            showTitle={false}
            maxItems={8}
            className="max-w-5xl mx-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Built for scale, designed for efficiency. Our platform provides everything you need 
              to grow your business and serve your customers better.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl mb-6 shadow-enterprise group-hover:shadow-elevated transition-all duration-200">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Business Categories
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Connect with businesses across diverse industries and find the products and services you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/categories" className="btn-outline-primary">
              View All Categories
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-secondary-600">
                Handpicked products just for you
              </p>
            </div>
            <Link to="/products" className="btn-outline-primary hidden md:flex">
              View All Products
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-8 md:hidden">
            <Link to="/products" className="btn-outline-primary">
              View All Products
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-secondary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of successful sellers on OneSoko and grow your business today
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register/shop-owner" className="btn-primary btn-lg">
              Become a Seller
            </Link>
            <Link to="/shops" className="btn-outline-secondary btn-lg border-white text-white hover:bg-white hover:text-secondary-900">
              Browse Shops
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
