import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  ShoppingCartIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
  ShoppingBagIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';

interface XHeaderProps {
  onMobileMenuToggle?: () => void;
  variant?: 'customer' | 'shop-owner';
}

const XHeader: React.FC<XHeaderProps> = ({ 
  onMobileMenuToggle, 
  variant = 'customer' 
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
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
    setIsUserMenuOpen(false);
  };

  const notifications = [
    {
      id: '1',
      type: 'like',
      user: 'TechStore Kenya',
      action: 'liked your post',
      time: '2m',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '2',
      type: 'follow',
      user: 'Fashion Hub',
      action: 'started following you',
      time: '1h',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '3',
      type: 'mention',
      user: 'OneSoko Official',
      action: 'mentioned you in a post',
      time: '3h',
      avatar: '/api/placeholder/32/32'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-full hover:bg-gray-800 transition-colors text-white"
              aria-label="Toggle mobile menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">OS</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-white">
                OS
              </span>
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search OS"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-black transition-all"
                />
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsUserMenuOpen(false);
                    }}
                    className="relative p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                  >
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      3
                    </span>
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-black border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-700">
                        <h3 className="text-lg font-bold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="p-4 hover:bg-gray-900 transition-colors border-b border-gray-800">
                            <div className="flex space-x-3">
                              <img
                                src={notification.avatar}
                                alt={notification.user}
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="flex-1">
                                <p className="text-white text-sm">
                                  <span className="font-medium">{notification.user}</span>{' '}
                                  <span className="text-gray-400">{notification.action}</span>
                                </p>
                                <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-700">
                        <Link
                          to="/notifications"
                          className="text-blue-500 hover:text-blue-400 text-sm font-medium"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          See all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <Link
                  to="/messages"
                  className="relative p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    1
                  </span>
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                >
                  <HeartIcon className="h-5 w-5" />
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    2
                  </span>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={user?.profile?.avatar_url || '/api/placeholder/32/32'}
                      alt="User"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="hidden lg:block text-white font-medium">
                      {user?.username || 'User'}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-black border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-700">
                        <p className="font-medium text-white">{user?.first_name || user?.username || 'User'}</p>
                        <p className="text-gray-400 text-sm">@{user?.username || 'username'}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <UserIcon className="h-4 w-4 mr-3" />
                          Profile
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3" />
                          Settings
                        </Link>
                        
                        {variant === 'shop-owner' && (
                          <Link
                            to="/shop/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ShoppingBagIcon className="h-4 w-4 mr-3" />
                            Shop Dashboard
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Auth Buttons */}
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search OS"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-black transition-all"
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default XHeader;
