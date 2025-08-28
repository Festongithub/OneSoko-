import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  DocumentTextIcon,
  TruckIcon,
  StarIcon,
  PlusIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  color: string;
  category: 'shopping' | 'account' | 'business' | 'support';
  requiresAuth?: boolean;
  shopOwnerOnly?: boolean;
}

const QuickLinks: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const [recentOrders, setRecentOrders] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifications, setNotifications] = useState(3);

  const quickLinks: QuickLink[] = [
    // Shopping Links
    {
      id: 'cart',
      title: 'My Cart',
      description: 'View items in your cart',
      icon: ShoppingCartIcon,
      href: '/cart',
      badge: getTotalItems(),
      color: 'bg-blue-500',
      category: 'shopping'
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      description: 'Saved items for later',
      icon: HeartIcon,
      href: '/wishlist',
      badge: wishlistCount,
      color: 'bg-red-500',
      category: 'shopping',
      requiresAuth: true
    },
    {
      id: 'orders',
      title: 'My Orders',
      description: 'Track your orders',
      icon: TruckIcon,
      href: '/orders',
      badge: recentOrders,
      color: 'bg-green-500',
      category: 'shopping',
      requiresAuth: true
    },
    {
      id: 'track-order',
      title: 'Track Order',
      description: 'Track your delivery',
      icon: ClockIcon,
      href: '/track-order',
      color: 'bg-orange-500',
      category: 'shopping'
    },

    // Account Links
    {
      id: 'profile',
      title: 'My Profile',
      description: 'Manage your account',
      icon: UserIcon,
      href: '/profile',
      color: 'bg-purple-500',
      category: 'account',
      requiresAuth: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View your notifications',
      icon: BellIcon,
      href: '/notifications',
      badge: notifications,
      color: 'bg-yellow-500',
      category: 'account',
      requiresAuth: true
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      description: 'Manage payment options',
      icon: CreditCardIcon,
      href: '/payment-methods',
      color: 'bg-indigo-500',
      category: 'account',
      requiresAuth: true
    },
    {
      id: 'settings',
      title: 'Account Settings',
      description: 'Update your preferences',
      icon: Cog6ToothIcon,
      href: '/settings',
      color: 'bg-gray-500',
      category: 'account',
      requiresAuth: true
    },

    // Business Links
    {
      id: 'shop-dashboard',
      title: 'Shop Dashboard',
      description: 'Manage your shop',
      icon: BuildingStorefrontIcon,
      href: '/shop/dashboard',
      color: 'bg-emerald-500',
      category: 'business',
      requiresAuth: true,
      shopOwnerOnly: true
    },
    {
      id: 'add-product',
      title: 'Add Product',
      description: 'List new products',
      icon: PlusIcon,
      href: '/shop/products/add',
      color: 'bg-teal-500',
      category: 'business',
      requiresAuth: true,
      shopOwnerOnly: true
    },
    {
      id: 'shop-orders',
      title: 'Shop Orders',
      description: 'Manage customer orders',
      icon: DocumentTextIcon,
      href: '/shop/orders',
      color: 'bg-cyan-500',
      category: 'business',
      requiresAuth: true,
      shopOwnerOnly: true
    },
    {
      id: 'shop-analytics',
      title: 'Analytics',
      description: 'View shop performance',
      icon: StarIcon,
      href: '/shop/analytics',
      color: 'bg-pink-500',
      category: 'business',
      requiresAuth: true,
      shopOwnerOnly: true
    },

    // Support Links
    {
      id: 'help',
      title: 'Help Center',
      description: 'Get help and support',
      icon: QuestionMarkCircleIcon,
      href: '/help',
      color: 'bg-amber-500',
      category: 'support'
    },
    {
      id: 'contact',
      title: 'Contact Us',
      description: 'Reach our support team',
      icon: PhoneIcon,
      href: '/contact',
      color: 'bg-rose-500',
      category: 'support'
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with support',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      color: 'bg-violet-500',
      category: 'support'
    }
  ];

  // Filter links based on authentication and user type
  const filteredLinks = quickLinks.filter(link => {
    if (link.requiresAuth && !isAuthenticated) return false;
    if (link.shopOwnerOnly && (!user?.profile?.is_shopowner)) return false;
    return true;
  });

  // Group links by category
  const groupedLinks = filteredLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, QuickLink[]>);

  const categoryNames = {
    shopping: 'Shopping',
    account: 'Account',
    business: 'Business',
    support: 'Support'
  };

  useEffect(() => {
    // Fetch user-specific data
    if (isAuthenticated) {
      // These would be real API calls
      setWishlistCount(5); // Mock data
      setRecentOrders(2); // Mock data
      setNotifications(3); // Mock data
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
          Quick Links
        </h2>
        <ArrowRightIcon className="h-5 w-5 text-secondary-400" />
      </div>

      <div className="space-y-6">
        {Object.entries(groupedLinks).map(([category, links]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 uppercase tracking-wide">
              {categoryNames[category as keyof typeof categoryNames]}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {links.map((link) => {
                const IconComponent = link.icon;
                
                return (
                  <Link
                    key={link.id}
                    to={link.href}
                    className="group flex items-center p-3 rounded-lg border border-secondary-200 dark:border-secondary-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${link.color} text-white mr-3 group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300">
                          {link.title}
                        </p>
                        {link.badge !== undefined && link.badge > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {link.badge > 99 ? '99+' : link.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-secondary-200 dark:border-secondary-700">
        <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 uppercase tracking-wide">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center p-3 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 group">
            <PlusIcon className="h-6 w-6 text-secondary-400 group-hover:text-primary-500 mb-2" />
            <span className="text-xs text-secondary-600 dark:text-secondary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium">
              Quick Order
            </span>
          </button>
          
          <button className="flex flex-col items-center p-3 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 group">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-secondary-400 group-hover:text-primary-500 mb-2" />
            <span className="text-xs text-secondary-600 dark:text-secondary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium">
              Get Help
            </span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {isAuthenticated && (
        <div className="mt-6 pt-6 border-t border-secondary-200 dark:border-secondary-700">
          <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 uppercase tracking-wide">
            Recent Activity
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary-600 dark:text-secondary-400">
              <span>Last order</span>
              <span>2 days ago</span>
            </div>
            <div className="flex items-center justify-between text-secondary-600 dark:text-secondary-400">
              <span>Items in wishlist</span>
              <span>{wishlistCount} items</span>
            </div>
            <div className="flex items-center justify-between text-secondary-600 dark:text-secondary-400">
              <span>Account created</span>
              <span>30 days ago</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickLinks;
