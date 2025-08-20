import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCartIcon,
  HeartIcon,
  TruckIcon,
  UserIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

interface QuickLinksWidgetProps {
  variant?: 'horizontal' | 'vertical' | 'grid';
  showTitle?: boolean;
  maxItems?: number;
  className?: string;
}

const QuickLinksWidget: React.FC<QuickLinksWidgetProps> = ({
  variant = 'horizontal',
  showTitle = true,
  maxItems = 8,
  className = ''
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const { getTotalItems } = useCartStore();

  const quickLinks = [
    {
      id: 'cart',
      title: 'Cart',
      icon: ShoppingCartIcon,
      href: '/cart',
      badge: getTotalItems(),
      color: 'text-blue-600 bg-blue-100',
      show: true
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      icon: HeartIcon,
      href: '/wishlist',
      color: 'text-red-600 bg-red-100',
      show: isAuthenticated
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: TruckIcon,
      href: '/orders',
      color: 'text-green-600 bg-green-100',
      show: isAuthenticated
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: UserIcon,
      href: '/profile',
      color: 'text-purple-600 bg-purple-100',
      show: isAuthenticated
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: BellIcon,
      href: '/notifications',
      badge: 3,
      color: 'text-yellow-600 bg-yellow-100',
      show: isAuthenticated
    },
    {
      id: 'shop',
      title: 'My Shop',
      icon: BuildingStorefrontIcon,
      href: '/shop/dashboard',
      color: 'text-emerald-600 bg-emerald-100',
      show: isAuthenticated && user?.profile?.is_shopowner
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Cog6ToothIcon,
      href: '/settings',
      color: 'text-gray-600 bg-gray-100',
      show: isAuthenticated
    },
    {
      id: 'help',
      title: 'Help',
      icon: QuestionMarkCircleIcon,
      href: '/help',
      color: 'text-orange-600 bg-orange-100',
      show: true
    }
  ];

  const visibleLinks = quickLinks
    .filter(link => link.show)
    .slice(0, maxItems);

  const getLayoutClasses = () => {
    switch (variant) {
      case 'vertical':
        return 'flex flex-col space-y-2';
      case 'grid':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3';
      default:
        return 'flex space-x-4 overflow-x-auto pb-2';
    }
  };

  const getItemClasses = () => {
    switch (variant) {
      case 'vertical':
        return 'flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors';
      case 'grid':
        return 'flex flex-col items-center p-4 rounded-lg border border-secondary-200 dark:border-secondary-600 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-md transition-all';
      default:
        return 'flex flex-col items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors min-w-0 flex-shrink-0';
    }
  };

  return (
    <div className={`bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
          Quick Links
        </h3>
      )}

      <div className={getLayoutClasses()}>
        {visibleLinks.map((link) => {
          const IconComponent = link.icon;
          
          return (
            <Link
              key={link.id}
              to={link.href}
              className={`group ${getItemClasses()}`}
            >
              <div className="relative">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${link.color} group-hover:scale-110 transition-transform`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-xs font-medium text-secondary-700 dark:text-secondary-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${
                variant === 'horizontal' ? 'mt-2 text-center' : 
                variant === 'grid' ? 'mt-2 text-center' : 'ml-3'
              }`}>
                {link.title}
              </span>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      {quickLinks.filter(link => link.show).length > maxItems && (
        <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <Link
            to="/quick-links"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            View all links →
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuickLinksWidget;
