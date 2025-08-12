import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  CreditCardIcon,
  UserIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { notificationAPI } from '../services/api';
import { Notification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'cart' | 'products'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let data: Notification[];
      
      switch (activeTab) {
        case 'orders':
          data = await notificationAPI.getOrderNotifications();
          break;
        case 'cart':
          data = await notificationAPI.getCartNotifications();
          break;
        case 'products':
          data = await notificationAPI.getProductNotifications();
          break;
        default:
          data = await notificationAPI.getAll();
      }
      
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationAPI.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'order_created': <ShoppingBagIcon className="w-5 h-5" />,
      'order_status_updated': <TruckIcon className="w-5 h-5" />,
      'order_delivered': <CheckIcon className="w-5 h-5" />,
      'order_cancelled': <XMarkIcon className="w-5 h-5" />,
      'cart_item_added': <ShoppingBagIcon className="w-5 h-5" />,
      'cart_updated': <ShoppingBagIcon className="w-5 h-5" />,
      'cart_cleared': <TrashIcon className="w-5 h-5" />,
      'product_inquiry': <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      'product_inquiry_response': <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      'product_low_stock': <ExclamationTriangleIcon className="w-5 h-5" />,
      'product_out_of_stock': <ExclamationTriangleIcon className="w-5 h-5" />,
      'new_order_received': <BellIcon className="w-5 h-5" />,
      'order_completed': <CheckIcon className="w-5 h-5" />,
      'welcome': <StarIcon className="w-5 h-5" />,
      'account_updated': <UserIcon className="w-5 h-5" />,
      'payment_successful': <CreditCardIcon className="w-5 h-5" />,
      'payment_failed': <ExclamationTriangleIcon className="w-5 h-5" />,
    };
    
    return iconMap[type] || <BellIcon className="w-5 h-5" />;
  };

  const getNotificationColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'order_created': 'text-blue-600 bg-blue-50',
      'order_status_updated': 'text-yellow-600 bg-yellow-50',
      'order_delivered': 'text-green-600 bg-green-50',
      'order_cancelled': 'text-red-600 bg-red-50',
      'cart_item_added': 'text-green-600 bg-green-50',
      'cart_updated': 'text-blue-600 bg-blue-50',
      'cart_cleared': 'text-gray-600 bg-gray-50',
      'product_inquiry': 'text-purple-600 bg-purple-50',
      'product_inquiry_response': 'text-blue-600 bg-blue-50',
      'product_low_stock': 'text-yellow-600 bg-yellow-50',
      'product_out_of_stock': 'text-red-600 bg-red-50',
      'new_order_received': 'text-green-600 bg-green-50',
      'order_completed': 'text-green-600 bg-green-50',
      'welcome': 'text-purple-600 bg-purple-50',
      'account_updated': 'text-blue-600 bg-blue-50',
      'payment_successful': 'text-green-600 bg-green-50',
      'payment_failed': 'text-red-600 bg-red-50',
    };
    
    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-4">
              {[
                { key: 'all', label: 'All' },
                { key: 'orders', label: 'Orders' },
                { key: 'cart', label: 'Cart' },
                { key: 'products', label: 'Products' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.is_read
                          ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            notification.is_read
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white font-medium'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                            
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                          
                          {/* Additional data */}
                          {notification.data && Object.keys(notification.data).length > 0 && (
                            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                              <pre className="text-gray-600 dark:text-gray-300">
                                {JSON.stringify(notification.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter; 