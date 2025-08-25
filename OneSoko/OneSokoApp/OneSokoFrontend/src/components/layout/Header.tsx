import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useShopSession } from '../../hooks/useShopSession';
import ThemeToggle from '../ThemeToggle';
import AboutIcon from '../icons/AboutIcon';

interface HeaderProps {
  variant?: 'customer' | 'shop-owner';
  onMenuToggle?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }> | null;
}

const Header: React.FC<HeaderProps> = ({ variant = 'customer', onMenuToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleCart, getTotalItems } = useCartStore();
  const { userShop, isShopOwner } = useShopSession();
  
  const totalItems = getTotalItems();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const customerNavItems: NavItem[] = [
    { name: 'Reviews Demo', href: '/reviews-demo', icon: null },
    { name: 'About', href: '/about', icon: AboutIcon },
  ];

  const shopOwnerNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/shop/dashboard', icon: null },
    { name: 'Products', href: '/shop/products', icon: null },
    { name: 'Orders', href: '/shop/orders', icon: null },
    { name: 'Analytics', href: '/shop/analytics', icon: null },
  ];

  const navItems = variant === 'shop-owner' ? shopOwnerNavItems : customerNavItems;

  return (
    <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-400"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Shop Information - Shop Owner Only */}
          {variant === 'shop-owner' && isShopOwner && userShop && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-primary-900 dark:text-primary-100">{userShop.name}</span>
                <span className="text-xs text-primary-600 dark:text-primary-300">Shop Owner</span>
              </div>
            </div>
          )}

          {/* Search Bar - Customer Only */}
          {variant === 'customer' && (
            <div className="flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="nav-link flex items-center space-x-2"
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Customer Actions */}
            {variant === 'customer' && (
              <>
                {/* Wishlist */}
                {isAuthenticated && (
                  <Link to="/wishlist" className="p-2 text-secondary-600 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400">
                    <HeartIcon className="h-6 w-6" />
                  </Link>
                )}

                {/* Cart */}
                <button
                  onClick={toggleCart}
                  className="relative p-2 text-secondary-600 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <button className="p-2 text-secondary-600 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400">
                <BellIcon className="h-6 w-6" />
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle size="md" />

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-secondary-700">
                    {user?.first_name || user?.username}
                  </span>
                </button>
                
                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-md shadow-lg border border-secondary-200 dark:border-secondary-700 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {variant === 'customer' && (
                        <>
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Orders
                          </Link>
                          <Link
                            to="/wishlist"
                            className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Wishlist
                          </Link>
                        </>
                      )}
                      {variant === 'shop-owner' && (
                        <Link
                          to="/shop/settings"
                          className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Shop Settings
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/register/shop-owner"
                  className="hidden md:block btn-success text-sm"
                >
                  Become Seller
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-secondary-600 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-secondary-600"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 py-4">
            {/* Search - Mobile */}
            {variant === 'customer' && (
              <div className="mb-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth Actions */}
            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-secondary-200 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
