import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
  CogIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  TagIcon,
  CubeIcon,
  StarIcon,
  HeartIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isDevOpen, setIsDevOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Primary navigation items (X-style minimal)
  const primaryNavItems = [
    { name: 'Home', path: '/', icon: HomeIcon, description: 'Discover amazing products' },
    { name: 'Explore', path: '/categories', icon: MagnifyingGlassIcon, description: 'Browse categories' },
    { name: 'Messages', path: '/messages', icon: ChatBubbleLeftRightIcon, description: 'Chat with sellers' },
    { name: 'Notifications', path: '/notifications', icon: BellIcon, description: 'Stay updated' },
    { name: 'Profile', path: '/user-profile', icon: UserIcon, description: 'Manage your account' },
  ];

  // Shopping navigation
  const shoppingNavItems = [
    { name: 'Shop', path: '/products', icon: ShoppingBagIcon, description: 'Browse products' },
    { name: 'Cart', path: '/cart', icon: ShoppingCartIcon, description: 'Your shopping cart' },
    { name: 'Wishlist', path: '/wishlist', icon: HeartIcon, description: 'Saved items' },
    { name: 'Orders', path: '/orders', icon: ShoppingBagIcon, description: 'Track orders' },
  ];

  // Shop owner items
  const shopOwnerItems = [
    { name: 'Dashboard', path: '/shop-dashboard', icon: BuildingStorefrontIcon, description: 'Business overview' },
    { name: 'Analytics', path: '/shop/analytics', icon: ChartBarIcon, description: 'Sales insights' },
    { name: 'Products', path: '/shop/products', icon: TagIcon, description: 'Manage inventory' },
    { name: 'Orders', path: '/shop/orders', icon: ShoppingBagIcon, description: 'Process orders' },
    { name: 'Settings', path: '/shop/settings', icon: CogIcon, description: 'Store configuration' },
  ];

  // Development/Test items (collapsible)
  const devItems = [
    { name: 'API Tests', path: '/order-api-test', icon: CogIcon },
    { name: 'Categories Test', path: '/categories-api-test', icon: TagIcon },
    { name: 'Messages Test', path: '/messages-api-test', icon: ChatBubbleLeftRightIcon },
    { name: 'Profile Test', path: '/user-profile-api-test', icon: UserIcon },
    { name: 'Variants Test', path: '/product-variants-api-test', icon: CubeIcon },
    { name: 'Reviews Test', path: '/reviews-api-test', icon: StarIcon },
    { name: 'Wishlist Test', path: '/wishlist-api-test', icon: HeartIcon },
    { name: 'Payments Test', path: '/payments-api-test', icon: CreditCardIcon },
  ];

  const NavItem = ({ item, onClick, isActive, className = "", showDescription = false }: any) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={() => {
          // Only close sidebar on mobile
          if (window.innerWidth < 1024) {
            onClick();
          }
        }}
        className={`
          group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out
          ${isActive 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/25 transform scale-102' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-sm transform hover:scale-101'
          }
          ${className}
        `}
      >
        <div className={`
          p-1.5 rounded-md transition-all duration-200
          ${isActive 
            ? 'bg-white/20 backdrop-blur-sm' 
            : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-white/50 dark:group-hover:bg-gray-700/50'
          }
        `}>
          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
        </div>
        <div className="ml-2 flex-1">
          <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
            {item.name}
          </span>
          {showDescription && item.description && (
            <p className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
              {item.description}
            </p>
          )}
        </div>
        {isActive && (
          <div className="absolute right-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        )}
      </Link>
    );
  };

  const SectionHeader = ({ title, icon: Icon }: { title: string; icon?: any }) => (
    <div className="flex items-center px-3 mb-2">
      {Icon && (
        <div className="p-1 rounded-md bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mr-2">
          <Icon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </div>
      )}
      <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-xl transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        border-r border-gray-200/50 dark:border-gray-700/50
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            <div className="relative flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2 group" onClick={onClose}>
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/25 transform group-hover:scale-105 transition-transform duration-200">
                    <span className="text-white font-bold text-sm">O</span>
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    OneSoko
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Your marketplace</p>
                </div>
              </Link>
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <nav className="px-3 py-4 space-y-4">
              {/* Primary Navigation */}
              <div className="space-y-1">
                <SectionHeader title="Main" />
                {primaryNavItems.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    onClick={onClose}
                    isActive={isActive(item.path)}
                    showDescription={true}
                  />
                ))}
              </div>

              {/* Shopping Section */}
              <div className="space-y-1">
                <SectionHeader title="Shopping" icon={ShoppingBagIcon} />
                {shoppingNavItems.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    onClick={onClose}
                    isActive={isActive(item.path)}
                    showDescription={true}
                  />
                ))}
              </div>

              {/* Shop Owner Section */}
              {isAuthenticated && (
                <div className="space-y-1">
                  <SectionHeader title="Business" icon={BuildingStorefrontIcon} />
                  {shopOwnerItems.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      onClick={onClose}
                      isActive={isActive(item.path)}
                      showDescription={true}
                    />
                  ))}
                </div>
              )}

              {/* Development Section (collapsible) */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsDevOpen(!isDevOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-1 rounded-md bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 mr-2">
                      <CogIcon className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                    </div>
                    Development
                  </div>
                  {isDevOpen ? (
                    <ChevronUpIcon className="w-3 h-3 transition-transform duration-200" />
                  ) : (
                    <ChevronDownIcon className="w-3 h-3 transition-transform duration-200" />
                  )}
                </button>
                <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${isDevOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {devItems.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      onClick={onClose}
                      isActive={isActive(item.path)}
                      className="text-xs py-1.5 ml-3"
                    />
                  ))}
                </div>
              </div>

              {/* Registration for non-authenticated users */}
              {!isAuthenticated && (
                <div className="space-y-2 pt-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Get Started</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Join our community today</p>
                    <div className="space-y-1.5">
                      <Link
                        to="/register"
                        onClick={() => {
                          // Only close sidebar on mobile
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                        className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md shadow-blue-500/25"
                      >
                        <UserIcon className="w-3 h-3 mr-1.5" />
                        Sign Up
                      </Link>
                      <Link
                        to="/register-shop-owner"
                        onClick={() => {
                          // Only close sidebar on mobile
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                        className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <BuildingStorefrontIcon className="w-3 h-3 mr-1.5" />
                        Start Selling
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200 transform hover:scale-102"
              >
                <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 mr-2">
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => {
                  // Only close sidebar on mobile
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200 transform hover:scale-102"
              >
                <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 mr-2">
                  <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 