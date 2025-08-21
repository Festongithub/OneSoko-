import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  RssIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon,
  BellIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  RssIcon as RssIconSolid,
  GlobeAltIcon as GlobeAltIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid
} from '@heroicons/react/24/solid';
import { useAuthStore } from '../../stores/authStore';

interface EnterpriseLeftNavbarProps {
  onClose: () => void;
}

const EnterpriseLeftNavbar: React.FC<EnterpriseLeftNavbarProps> = ({ onClose }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const isShopOwner = user?.profile?.is_shopowner;

  const mainNavItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      description: 'Dashboard & Overview'
    },
    {
      name: 'Feed',
      href: '/feed',
      icon: RssIcon,
      iconSolid: RssIconSolid,
      description: 'Latest Updates',
      requiresAuth: true
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: GlobeAltIcon,
      iconSolid: GlobeAltIconSolid,
      description: 'Find New Products'
    },
    {
      name: 'Explore',
      href: '/explore',
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassIconSolid,
      description: 'Browse & Search'
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: Squares2X2Icon,
      iconSolid: Squares2X2IconSolid,
      description: 'Product Categories'
    },
    {
      name: 'Shops',
      href: '/shops',
      icon: BuildingStorefrontIcon,
      iconSolid: BuildingStorefrontIconSolid,
      description: 'Browse All Shops'
    }
  ];

  const businessNavItems = [
    {
      name: 'Dashboard',
      href: '/shop/dashboard',
      icon: ChartBarIcon,
      description: 'Business Analytics'
    },
    {
      name: 'Products',
      href: '/shop/products',
      icon: CubeIcon,
      description: 'Manage Inventory'
    },
    {
      name: 'Orders',
      href: '/shop/orders',
      icon: UserGroupIcon,
      description: 'Order Management'
    },
    {
      name: 'Settings',
      href: '/shop/settings',
      icon: CogIcon,
      description: 'Business Settings'
    }
  ];

  const supportNavItems = [
    {
      name: 'Help Center',
      href: '/help',
      icon: QuestionMarkCircleIcon,
      description: 'Get Support'
    },
    {
      name: 'What\'s New',
      href: '/whats-new',
      icon: SparklesIcon,
      description: 'Latest Features'
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const NavItem = ({ item }: { item: any }) => {
    const isActive = isActiveRoute(item.href);
    const IconComponent = isActive && item.iconSolid ? item.iconSolid : item.icon;
    
    // Don't show auth-required items for non-authenticated users
    if (item.requiresAuth && !isAuthenticated) {
      return null;
    }

    return (
      <Link
        to={item.href}
        onClick={() => {
          onClose();
          // Small delay to ensure smooth transition
          setTimeout(() => {}, 100);
        }}
        className={`group nav-item flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <IconComponent 
          className={`h-5 w-5 mr-3 transition-colors ${
            isActive 
              ? 'text-primary-600 dark:text-primary-400' 
              : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
          }`} 
        />
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
          <div className={`text-xs mt-0.5 ${
            isActive 
              ? 'text-primary-600/70 dark:text-primary-400/70' 
              : 'text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-400'
          }`}>
            {item.description}
          </div>
        </div>
        {isActive && (
          <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div className="h-screen w-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-enterprise">
                  <CommandLineIcon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-neutral-900 dark:text-white">Navigation</h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Enterprise Platform</p>
                </div>
              </div>
              
              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sidebar-scrollbar">
            <nav className="space-y-8 pb-4">
              {/* Main Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                  Main Menu
                </h3>
                <div className="space-y-1">
                  {mainNavItems.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>
              </div>

              {/* Business Navigation - Only for Shop Owners */}
              {isAuthenticated && isShopOwner && (
                <div>
                  <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                    Business Tools
                  </h3>
                  <div className="space-y-1">
                    {businessNavItems.map((item) => (
                      <NavItem key={item.name} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions for authenticated users */}
              {isAuthenticated && (
                <div>
                  <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                    Quick Access
                  </h3>
                  <div className="space-y-1">
                    <Link
                      to="/notifications"
                      onClick={onClose}
                      className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-all"
                    >
                      <BellIcon className="h-5 w-5 mr-3 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300" />
                      <div className="flex-1">
                        <div className="font-medium">Notifications</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 mt-0.5">
                          Stay Updated
                        </div>
                      </div>
                      <span className="w-2 h-2 bg-error-500 rounded-full"></span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Support Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                  Support
                </h3>
                <div className="space-y-1">
                  {supportNavItems.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-neutral-200 dark:border-neutral-800 mt-auto">
            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {user?.first_name || user?.username || 'User'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {isShopOwner ? 'Business Account' : 'Customer Account'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg transition-all shadow-enterprise"
                  onClick={onClose}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EnterpriseLeftNavbar;
