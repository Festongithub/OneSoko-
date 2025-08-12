import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { ordersAPI } from '../services/api';
import { Order } from '../types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await ordersAPI.getAll();
      setOrders(ordersData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your orders and view order history
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start shopping to see your orders here.
            </p>
            <Link
              to="/shops"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Order #{order.id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${order.total.toFixed(2)}
                        </div>
                      </div>
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ShoppingBagIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${item.total_price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          +{order.items.length - 3} more items
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(order.created_at)}
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                          {order.total_items} items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.shop.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 