import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { ordersAPI } from '../services/api';
import { Order } from '../types';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await ordersAPI.getOrderDetails(parseInt(orderId!));
      setOrder(orderData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      case 'paid':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'shipped':
        return <TruckIcon className="w-6 h-6 text-blue-500" />;
      case 'delivered':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />;
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is being processed and will be confirmed soon.';
      case 'paid':
        return 'Payment received! Your order is being prepared for shipping.';
      case 'shipped':
        return 'Your order is on its way! Track your package for delivery updates.';
      case 'delivered':
        return 'Your order has been delivered successfully. Enjoy your purchase!';
      case 'cancelled':
        return 'This order has been cancelled. Please contact support if you have questions.';
      default:
        return 'Order status is being updated.';
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <Link
            to="/orders"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Status</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getStatusDescription(order.status)}
              </p>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingBagIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Price: ${(item.total_price / item.quantity).toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${item.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shop Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shop Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                    {order.shop.logo ? (
                      <img
                        src={order.shop.logo}
                        alt={order.shop.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ShoppingBagIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{order.shop.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.shop.description}</p>
                  </div>
                </div>
                
                {order.shop.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {order.shop.location}
                  </div>
                )}
                
                {order.shop.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {order.shop.phone}
                  </div>
                )}
                
                {order.shop.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    {order.shop.email}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Items ({order.total_items})</span>
                  <span className="text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">$0.00</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Order Placed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                
                {order.status !== 'pending' && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Order Confirmed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payment received</p>
                    </div>
                  </div>
                )}
                
                {['shipped', 'delivered'].includes(order.status) && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Order Shipped</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">On its way to you</p>
                    </div>
                  </div>
                )}
                
                {order.status === 'delivered' && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Order Delivered</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enjoy your purchase!</p>
                    </div>
                  </div>
                )}
                
                {order.status === 'cancelled' && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Order Cancelled</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Order has been cancelled</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 