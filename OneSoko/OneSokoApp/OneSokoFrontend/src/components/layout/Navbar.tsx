import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TagIcon,
  UserIcon,
  BellIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import CartBadge from '../cart/CartBadge';
import MessageNotificationIcon from '../messaging/MessageNotificationIcon';
import ShopSelector from '../shops/ShopSelector';

interface NavbarProps {
  onSidebarToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle }) => {
  const { isAuthenticated, user, isShopOwner } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Only shops in main navigation
  const navItems = [
    { name: 'Shops', path: '/shops', icon: TagIcon },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Sidebar toggle and logo */}
          <div className="flex items-center">
            {/* Sidebar Toggle */}
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-2"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">OneSoko</span>
            </Link>

            {/* Desktop Navigation - Only Shops */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Shop selector, user menu and notifications */}
          <div className="flex items-center space-x-4">
            {/* Shop Selector - for shop owners */}
            {isAuthenticated && isShopOwner && <ShopSelector />}
            
            {/* Cart Badge */}
            {isAuthenticated && <CartBadge />}
            
            {/* Messages */}
            <MessageNotificationIcon />
            
            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <BellIcon className="h-6 w-6" />
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <Link
                  to="/user-profile"
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.first_name || user?.username || 'Profile'}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 