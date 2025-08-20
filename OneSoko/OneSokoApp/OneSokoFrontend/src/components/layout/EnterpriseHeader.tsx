import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  PlusIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useTheme } from '../../contexts/ThemeContext';

interface EnterpriseHeaderProps {
  onMobileMenuToggle?: () => void;
}

const EnterpriseHeader: React.FC<EnterpriseHeaderProps> = ({ onMobileMenuToggle }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const cartItemsCount = getTotalItems();
  const isShopOwner = user?.profile?.is_shopowner;

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden menu-toggle p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center ml-2 md:ml-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-enterprise">
                  <CommandLineIcon className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  OneSoko
                </span>
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full">
                  Enterprise
                </span>
              </div>
            </Link>
          </div>

          {/* Enhanced Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="block w-full pl-12 pr-12 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white dark:focus:bg-neutral-700 transition-all shadow-sm hover:shadow-md focus:shadow-elevated"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Quick Actions for Shop Owners */}
            {isAuthenticated && isShopOwner && (
              <div className="hidden lg:flex items-center space-x-2 mr-4 pl-4 border-l border-neutral-200 dark:border-neutral-700">
                <Link
                  to="/shop/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/shop/products/add"
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg transition-all shadow-enterprise"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  3
                </span>
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-enterprise">
                    <span className="text-white text-sm font-medium">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-800 rounded-xl shadow-elevated border border-neutral-200 dark:border-neutral-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-enterprise">
                          <span className="text-white font-semibold text-lg">
                            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {user?.first_name && user?.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user?.username || 'User'
                            }
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {user?.email}
                          </p>
                          {isShopOwner && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 mt-1">
                              <BuildingStorefrontIcon className="w-3 h-3 mr-1" />
                              Shop Owner
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3 text-neutral-500" />
                        Profile Settings
                      </Link>
                      
                      {isShopOwner && (
                        <>
                          <Link
                            to="/shop/dashboard"
                            className="flex items-center px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ChartBarIcon className="h-4 w-4 mr-3 text-neutral-500" />
                            Business Dashboard
                          </Link>
                          <Link
                            to="/shop/settings"
                            className="flex items-center px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <CogIcon className="h-4 w-4 mr-3 text-neutral-500" />
                            Business Settings
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg transition-all shadow-enterprise"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, shops..."
                className="block w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Backdrop for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default EnterpriseHeader;
