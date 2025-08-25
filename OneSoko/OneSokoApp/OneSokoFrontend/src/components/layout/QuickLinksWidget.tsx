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
  ChartBarIcon,
  CubeIcon,
  DocumentTextIcon,
  PlusIcon
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

  const customerQuickLinks = [
    {
      id: 'cart',
      title: 'Shopping Cart',
      icon: ShoppingCartIcon,
      href: '/cart',
      badge: getTotalItems(),
      color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400',
      show: true,
      category: 'shopping'
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      icon: HeartIcon,
      href: '/wishlist',
      color: 'text-error-600 bg-error-100 dark:bg-error-900/20 dark:text-error-400',
      show: isAuthenticated,
      category: 'shopping'
    },
    {
      id: 'orders',
      title: 'My Orders',
      icon: TruckIcon,
      href: '/orders',
      color: 'text-success-600 bg-success-100 dark:bg-success-900/20 dark:text-success-400',
      show: isAuthenticated,
      category: 'account'
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: UserIcon,
      href: '/profile',
      color: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400',
      show: isAuthenticated,
      category: 'account'
    }
  ];

  const businessQuickLinks = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: ChartBarIcon,
      href: '/shop/dashboard',
      color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400',
      show: true,
      category: 'business'
    },
    {
      id: 'add-product',
      title: 'Add Product',
      icon: PlusIcon,
      href: '/shop/products/add',
      color: 'text-success-600 bg-success-100 dark:bg-success-900/20 dark:text-success-400',
      show: true,
      category: 'business'
    },
    {
      id: 'products',
      title: 'Products',
      icon: CubeIcon,
      href: '/shop/products',
      color: 'text-warning-600 bg-warning-100 dark:bg-warning-900/20 dark:text-warning-400',
      show: true,
      category: 'business'
    },
    {
      id: 'shop-orders',
      title: 'Orders',
      icon: DocumentTextIcon,
      href: '/shop/orders',
      color: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400',
      show: true,
      category: 'business'
    }
  ];

  const generalQuickLinks = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: BellIcon,
      href: '/notifications',
      badge: 3,
      color: 'text-warning-600 bg-warning-100 dark:bg-warning-900/20 dark:text-warning-400',
      show: isAuthenticated,
      category: 'general'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Cog6ToothIcon,
      href: '/settings',
      color: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400',
      show: isAuthenticated,
      category: 'general'
    },
    {
      id: 'help',
      title: 'Help Center',
      icon: QuestionMarkCircleIcon,
      href: '/help',
      color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400',
      show: true,
      category: 'general'
    }
  ];

  const isShopOwner = user?.profile?.is_shopowner;

  // Combine all quick links based on user type
  let allQuickLinks = [...customerQuickLinks, ...generalQuickLinks];
  
  if (isAuthenticated && isShopOwner) {
    allQuickLinks = [...businessQuickLinks, ...customerQuickLinks, ...generalQuickLinks];
  }

  const visibleLinks = allQuickLinks
    .filter(link => link.show)
    .slice(0, maxItems);

  const getLayoutClasses = () => {
    switch (variant) {
      case 'vertical':
        return 'flex flex-col space-y-3';
      case 'grid':
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
      default:
        return 'flex space-x-4 overflow-x-auto pb-2';
    }
  };

  const getItemClasses = () => {
    switch (variant) {
      case 'vertical':
        return 'flex items-center p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-card transition-all duration-200 group';
      case 'grid':
        return 'flex flex-col items-center p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-card transition-all duration-200 group';
      default:
        return 'flex flex-col items-center p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-card transition-all duration-200 min-w-0 flex-shrink-0 group';
    }
  };

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-800 p-6 ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Quick Access
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isAuthenticated && isShopOwner 
              ? 'Business tools and customer features at your fingertips'
              : 'Access your favorite features quickly'
            }
          </p>
        </div>
      )}

      <div className={getLayoutClasses()}>
        {visibleLinks.map((link) => {
          const IconComponent = link.icon;
          
          return (
            <Link
              key={link.id}
              to={link.href}
              className={getItemClasses()}
            >
              <div className="relative">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${link.color} group-hover:scale-105 transition-transform duration-200`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-error-500 rounded-full shadow-enterprise">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${
                variant === 'horizontal' ? 'mt-3 text-center max-w-20' : 
                variant === 'grid' ? 'mt-3 text-center' : 'ml-4 flex-1'
              }`}>
                {link.title}
              </span>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      {allQuickLinks.filter(link => link.show).length > maxItems && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Link
            to="/quick-links"
            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
          >
            View all quick links
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuickLinksWidget;
