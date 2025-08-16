import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CogIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useShopSession } from '../../hooks/useShopSession';
import { useAuthStore } from '../../stores/authStore';

const ShopOwnerSidebar: React.FC = () => {
  const location = useLocation();
  const { userShop } = useShopSession();
  const { user } = useAuthStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/shop/dashboard',
      icon: HomeIcon,
      description: 'Overview and stats'
    },
    {
      name: 'Products',
      href: '/shop/products',
      icon: ShoppingBagIcon,
      description: 'Manage your products'
    },
    {
      name: 'Add Product',
      href: '/shop/products/add',
      icon: PlusIcon,
      description: 'Add new product'
    },
    {
      name: 'Orders',
      href: '/shop/orders',
      icon: ClipboardDocumentListIcon,
      description: 'View and manage orders'
    },
    {
      name: 'Analytics',
      href: '/shop/analytics',
      icon: ChartBarIcon,
      description: 'Sales and performance'
    },
    {
      name: 'Settings',
      href: '/shop/settings',
      icon: CogIcon,
      description: 'Shop configuration'
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 pt-5 pb-4 overflow-y-auto">
          {/* Shop Info */}
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                  {userShop?.name || 'My Shop'}
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                  {user?.first_name || 'Shop Owner'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${active
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                      : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 hover:text-secondary-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                      ${active
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-secondary-400 dark:text-secondary-500 group-hover:text-secondary-500 dark:group-hover:text-secondary-400'
                      }
                    `}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                    </div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Shop Status */}
          <div className="flex-shrink-0 px-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${userShop ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-xs text-secondary-500 dark:text-secondary-400">
                {userShop ? 'Shop Active' : 'Setup Required'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerSidebar;
