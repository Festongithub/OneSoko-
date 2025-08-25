import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import {
  BellIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  CheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  GiftIcon,
  ShoppingCartIcon,
  StarIcon,
  CogIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  data: Record<string, any>;
  created_at: string;
  expires_at: string | null;
}

interface NotificationPreferences {
  email_enabled: boolean;
  email_frequency: string;
  sms_enabled: boolean;
  phone_number: string;
  push_enabled: boolean;
  in_app_enabled: boolean;
  notification_types_enabled: Record<string, boolean>;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'preferences'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);

  const { accessToken } = useAuthStore();

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'order_status', label: 'Order Updates' },
    { value: 'loyalty_points', label: 'Loyalty Points' },
    { value: 'loyalty_tier', label: 'Tier Updates' },
    { value: 'reward_available', label: 'New Rewards' },
    { value: 'reward_redeemed', label: 'Reward Redemptions' },
    { value: 'referral_bonus', label: 'Referral Bonuses' },
    { value: 'new_review', label: 'New Reviews' },
    { value: 'low_stock', label: 'Stock Alerts' },
    { value: 'promotional', label: 'Promotions' },
    { value: 'system', label: 'System' },
  ];

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [selectedTab, selectedType, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });

      if (selectedTab === 'unread') {
        params.append('unread_only', 'true');
      }

      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }

      const response = await fetch(`/api/notifications/my_notifications/?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        
        setUnreadCount(data.unread_count);
        setHasNext(data.has_next);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notification-preferences/my_preferences/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark_as_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark_all_read/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({
            ...notif,
            is_read: true,
            read_at: new Date().toISOString()
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearReadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/clear_read/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setPage(1);
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const updatePreferences = async (updatedPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/notification-preferences/my_preferences/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPreferences),
      });

      if (response.ok) {
        setPreferences(prev => ({ ...prev!, ...updatedPreferences }));
        alert('Preferences updated successfully!');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences');
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'high' || priority === 'urgent'
      ? 'h-6 w-6 text-red-500'
      : 'h-6 w-6 text-blue-500';

    switch (type) {
      case 'order_status':
        return <ShoppingCartIcon className={iconClass} />;
      case 'loyalty_points':
      case 'loyalty_tier':
        return <TrophyIcon className={iconClass} />;
      case 'reward_available':
      case 'reward_redeemed':
        return <GiftIcon className={iconClass} />;
      case 'new_review':
        return <StarIcon className={iconClass} />;
      case 'system':
        return <CogIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Urgent</span>;
      case 'high':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">High</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Medium</span>;
      case 'low':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Low</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-2 text-gray-600">
                Stay updated with your order status, loyalty rewards, and more
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <CheckIcon className="h-5 w-5" />
                  <span>Mark All Read ({unreadCount})</span>
                </button>
              )}
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Preferences</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Tabs */}
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => {
                    setSelectedTab('all');
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    selectedTab === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Notifications
                </button>
                <button
                  onClick={() => {
                    setSelectedTab('unread');
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${
                    selectedTab === 'unread'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Type</h3>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={clearReadNotifications}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-4 w-4 inline mr-2" />
                  Clear Read Notifications
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {showPreferences && preferences ? (
              /* Preferences Panel */
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                
                {/* Delivery Methods */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Delivery Methods</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.in_app_enabled}
                          onChange={(e) => updatePreferences({ in_app_enabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">In-App Notifications</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.email_enabled}
                          onChange={(e) => updatePreferences({ email_enabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">Email Notifications</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.push_enabled}
                          onChange={(e) => updatePreferences({ push_enabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">Push Notifications</span>
                      </label>
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Notification Types</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(preferences.notification_types_enabled).map(([type, enabled]) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => updatePreferences({
                              notification_types_enabled: {
                                ...preferences.notification_types_enabled,
                                [type]: e.target.checked
                              }
                            })}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 capitalize">{type.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Quiet Hours</h4>
                    <label className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        checked={preferences.quiet_hours_enabled}
                        onChange={(e) => updatePreferences({ quiet_hours_enabled: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2">Enable Quiet Hours</span>
                    </label>
                    
                    {preferences.quiet_hours_enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={preferences.quiet_hours_start || '22:00'}
                            onChange={(e) => updatePreferences({ quiet_hours_start: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input
                            type="time"
                            value={preferences.quiet_hours_end || '08:00'}
                            onChange={(e) => updatePreferences({ quiet_hours_end: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-lg shadow">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.notification_type, notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-medium ${
                              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(notification.priority)}
                              {!notification.is_read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mt-2">{notification.message}</p>
                          
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                            
                            {notification.action_url && (
                              <a
                                href={notification.action_url}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Details →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More */}
                  {hasNext && (
                    <div className="p-6 border-t border-gray-200">
                      <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={loading}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
