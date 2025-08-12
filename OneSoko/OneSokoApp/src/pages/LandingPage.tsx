import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BuildingStorefrontIcon, 
  ShoppingBagIcon, 
  StarIcon, 
  UsersIcon,
  MapPinIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const features = [
    {
      icon: BuildingStorefrontIcon,
      title: 'Create Your Shop',
      description: 'Set up your online store in minutes with our easy-to-use platform.'
    },
    {
      icon: ShoppingBagIcon,
      title: 'Browse Products',
      description: 'Discover amazing products from local businesses in your area.'
    },
    {
      icon: StarIcon,
      title: 'Customer Reviews',
      description: 'Read authentic reviews from real customers before making purchases.'
    },
    {
      icon: MapPinIcon,
      title: 'Local Focus',
      description: 'Support local businesses and find products from your community.'
    }
  ];

  const stats = [
    { number: '100+', label: 'Active Shops' },
    { number: '1000+', label: 'Products' },
    { number: '500+', label: 'Happy Customers' },
    { number: '50+', label: 'Cities' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Local Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Connect with local businesses, discover amazing products, and support your community with OneSoko.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shops"
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 transition-colors"
              >
                <ShoppingBagIcon className="w-5 h-5 mr-2" />
                Browse Shops
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-primary-600 transition-colors"
              >
                <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose OneSoko?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy for local businesses to thrive online and for customers to discover amazing products.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome back, {user?.first_name || user?.username}!
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                {user?.profile?.is_shopowner 
                  ? "Manage your shop and connect with more customers."
                  : "Discover amazing products from local businesses."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user?.profile?.is_shopowner ? (
                  <>
                    <button
                      onClick={() => navigate('/shop-dashboard')}
                      className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/messages')}
                      className="inline-flex items-center px-8 py-3 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-primary-600 transition-colors"
                    >
                      View Messages
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/shops')}
                      className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingBagIcon className="w-5 h-5 mr-2" />
                      Explore Shops
                    </button>
                    <button
                      onClick={() => navigate('/wishlist')}
                      className="inline-flex items-center px-8 py-3 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-primary-600 transition-colors"
                    >
                      <StarIcon className="w-5 h-5 mr-2" />
                      My Wishlist
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Join thousands of businesses and customers who trust OneSoko.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
                  Create Your Shop
                </Link>
                <Link
                  to="/shops"
                  className="inline-flex items-center px-8 py-3 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-primary-600 transition-colors"
                >
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Explore Shops
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="text-xl font-bold">OneSoko</span>
              </div>
              <p className="text-gray-400">
                Your local marketplace for discovering and supporting local businesses.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Businesses</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Create Shop</Link></li>
                <li><Link to="/shop-dashboard" className="hover:text-white transition-colors">Shop Dashboard</Link></li>
                <li><Link to="/shops" className="hover:text-white transition-colors">Browse Shops</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/shops" className="hover:text-white transition-colors">Find Shops</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OneSoko. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 