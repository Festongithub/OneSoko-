import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const SignupSelection: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">OneSoko</h1>
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Join OneSoko
          </h2>
          <p className="mt-2 text-lg text-secondary-600 dark:text-secondary-400">
            Choose how you want to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Customer Signup */}
          <Link 
            to="/register/customer"
            className="group bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-secondary-200 dark:border-secondary-700 overflow-hidden"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
                  <UserIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
                  I'm a Customer
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-6 text-base leading-relaxed">
                  Shop from local stores, discover amazing products, and enjoy convenient shopping experiences.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-secondary-600 dark:text-secondary-400">
                    <ShoppingBagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">Browse thousands of products</span>
                  </div>
                  <div className="flex items-center text-secondary-600 dark:text-secondary-400">
                    <CurrencyDollarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">Get the best deals and offers</span>
                  </div>
                  <div className="flex items-center text-secondary-600 dark:text-secondary-400">
                    <BuildingStorefrontIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">Support local businesses</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                  <span>Start Shopping</span>
                  <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>

          {/* Shop Owner Signup */}
          <Link 
            to="/register/shop-owner"
            className="group bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-secondary-200 dark:border-secondary-700 overflow-hidden"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors duration-300">
                  <BuildingStorefrontIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
                  I'm a Shop Owner
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-6 text-base leading-relaxed">
                  Sell your products online, reach more customers, and grow your business with our platform.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-secondary-600 dark:text-secondary-400">
                    <BuildingStorefrontIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">Create your online store</span>
                  </div>
                  <div className="flex items-center text-secondary-600 dark:text-secondary-400">
                    <ShoppingBagIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">Manage products & inventory</span>
                  </div>
                  <div className="flex items-center text-secondary-600 dark:text-secondary-400">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">Track sales & analytics</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-semibold group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  <span>Start Selling</span>
                  <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 text-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="text-xs text-secondary-500 dark:text-secondary-400 space-y-1">
            <p>
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSelection;
