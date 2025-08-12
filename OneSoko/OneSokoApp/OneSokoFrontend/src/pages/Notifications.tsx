import React, { useState, useEffect } from 'react';
import { BellIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Your order #12345 has been shipped and is on its way to you.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false
    },
    {
      id: '2',
      title: 'New Message',
      message: 'You have a new message from Shop ABC regarding your recent purchase.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: false
    },
    {
      id: '3',
      title: 'Payment Failed',
      message: 'Your payment for order #12346 could not be processed. Please try again.',
      type: 'error',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true
    },
    {
      id: '4',
      title: 'Price Drop Alert',
      message: 'An item in your wishlist has dropped in price! Check it out now.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      isRead: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
              <BellIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400">Stay updated with your latest activities</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'read', label: 'Read', count: notifications.length - unreadCount }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {getFilteredNotifications().length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? "You're all caught up! No notifications yet."
                : `No ${filter} notifications to show.`
              }
            </p>
          </div>
        ) : (
          getFilteredNotifications().map((notification) => (
            <div
              key={notification.id}
              className={`relative p-6 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                notification.isRead 
                  ? 'opacity-75' 
                  : 'ring-2 ring-blue-500/20'
              } ${getTypeStyles(notification.type)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        notification.isRead 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                          title="Mark as read"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                        title="Delete notification"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {!notification.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications; 