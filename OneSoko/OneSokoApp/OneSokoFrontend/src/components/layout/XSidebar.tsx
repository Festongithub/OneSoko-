import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  BookmarkIcon,
  UserIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  FireIcon,
  TagIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BellIcon as BellIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  UserIcon as UserIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid
} from '@heroicons/react/24/solid';
import { useAuthStore } from '../../stores/authStore';

interface XSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'customer' | 'shop-owner';
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  iconSolid: any;
  count?: number;
  requiresAuth?: boolean;
}

const XSidebar: React.FC<XSidebarProps> = ({ 
  isOpen = false, 
  onClose, 
  variant = 'customer' 
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const customerNavItems: NavItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid
    },
    {
      name: 'Explore',
      href: '/explore',
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassIcon
    },
    {
      name: 'Trending',
      href: '/trending',
      icon: FireIcon,
      iconSolid: FireIcon
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: TagIcon,
      iconSolid: TagIcon
    },
    {
      name: 'Shops',
      href: '/shops',
      icon: BuildingStorefrontIcon,
      iconSolid: BuildingStorefrontIconSolid
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: BellIcon,
      iconSolid: BellIconSolid,
      count: 3,
      requiresAuth: true
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: EnvelopeIcon,
      iconSolid: EnvelopeIconSolid,
      count: 1,
      requiresAuth: true
    },
    {
      name: 'Bookmarks',
      href: '/bookmarks',
      icon: BookmarkIcon,
      iconSolid: BookmarkIconSolid,
      requiresAuth: true
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      requiresAuth: true
    }
  ];

  const shopOwnerNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/shop/dashboard',
      icon: ChartBarIcon,
      iconSolid: ChartBarIcon
    },
    {
      name: 'Products',
      href: '/shop/products',
      icon: CubeIcon,
      iconSolid: CubeIcon
    },
    {
      name: 'Orders',
      href: '/shop/orders',
      icon: ShoppingBagIcon,
      iconSolid: ShoppingBagIconSolid
    },
    {
      name: 'Customers',
      href: '/shop/customers',
      icon: UserGroupIcon,
      iconSolid: UserGroupIcon
    },
    {
      name: 'Analytics',
      href: '/shop/analytics',
      icon: ArrowTrendingUpIcon,
      iconSolid: ArrowTrendingUpIcon
    },
    {
      name: 'Messages',
      href: '/shop/messages',
      icon: EnvelopeIcon,
      iconSolid: EnvelopeIconSolid,
      count: 2
    },
    {
      name: 'Settings',
      href: '/shop/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIcon
    }
  ];

  const navItems = variant === 'shop-owner' ? shopOwnerNavItems : customerNavItems;

  const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.href;
    const IconComponent = isActive ? item.iconSolid : item.icon;
    
    // Don't show auth-required items if user is not authenticated
    if (item.requiresAuth && !isAuthenticated) {
      return null;
    }
    
    return (
      <Link
        to={item.href}
        className={`x-nav-item ${isActive ? 'active' : ''}`}
        onClick={onClose}
      >
        <IconComponent className="x-nav-icon" />
        <span className="text-xl font-medium hidden lg:block">{item.name}</span>
        {item.count && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center hidden lg:block">
            {item.count}
          </span>
        )}
      </Link>
    );
  };

  const handleComposeClick = () => {
    if (variant === 'shop-owner') {
      // For shop owners, redirect to add product
      window.location.href = '/shop/products/add';
    } else {
      // For customers, show compose modal (or redirect to create post)
      setIsComposeOpen(true);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-full lg:h-screen w-72 lg:w-64 xl:w-72
        bg-black border-r border-gray-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          <Link to="/" className="flex items-center space-x-3" onClick={onClose}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">OS</span>
            </div>
            <span className="text-2xl font-bold text-white hidden lg:block">OS</span>
          </Link>
          
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-full hover:bg-gray-800 transition-colors text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 lg:px-6 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Action Button */}
        <div className="p-4 lg:p-6">
          <button
            onClick={handleComposeClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden lg:block">
              {variant === 'shop-owner' ? 'Add Product' : 'Create Post'}
            </span>
          </button>
        </div>

        {/* User Profile Section */}
        {isAuthenticated && (
          <div className="p-4 lg:p-6 border-t border-gray-800">
            <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 transition-colors cursor-pointer">
              <img
                src={user?.profile?.avatar_url || '/api/placeholder/40/40'}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0 hidden lg:block">
                <p className="font-medium text-white truncate">
                  {user?.first_name || user?.username || 'User Name'}
                </p>
                <p className="text-gray-500 text-sm truncate">
                  @{user?.username || 'username'}
                </p>
              </div>
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500 hidden lg:block" />
            </div>
          </div>
        )}

        {/* Login Section for Non-authenticated Users */}
        {!isAuthenticated && (
          <div className="p-4 lg:p-6 border-t border-gray-800 space-y-3">
            <Link
              to="/login"
              className="block w-full text-center bg-transparent border border-gray-600 text-white font-medium py-2 px-4 rounded-full hover:bg-gray-800 transition-colors"
              onClick={onClose}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition-colors"
              onClick={onClose}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-gray-700 rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Create Post</h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex space-x-3">
                <img
                  src={user?.profile?.avatar_url || '/api/placeholder/40/40'}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    className="w-full bg-transparent text-xl placeholder-gray-500 resize-none outline-none text-white border-none"
                    placeholder="What's happening?"
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <button className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full transition-colors">
                    <ShoppingBagIcon className="w-5 h-5" />
                  </button>
                </div>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default XSidebar;
