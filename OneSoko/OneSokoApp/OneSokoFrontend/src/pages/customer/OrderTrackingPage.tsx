import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';

interface TrackingEntry {
  timestamp: string;
  status: string;
  description: string;
  location: string;
}

interface OrderItem {
  id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  total_price: string;
}

interface OrderTracking {
  order_id: number;
  current_status: string;
  tracking_entries: TrackingEntry[];
  estimated_delivery: string;
  order_date: string;
  customer_info: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: string;
}

const CustomerOrderTrackingPage: React.FC = () => {
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { orderId } = useParams<{ orderId: string }>();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (orderId) {
      fetchTrackingInfo();
    }
  }, [orderId]);

  const fetchTrackingInfo = async () => {
    try {
      const response = await fetch(`/api/enhanced-orders/${orderId}/tracking/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTracking(data);
      } else if (response.status === 404) {
        setError('Order not found');
      } else {
        setError('Failed to load order tracking information');
      }
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      setError('Failed to load order tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isActive: boolean = false) => {
    const iconClass = `w-8 h-8 ${isActive ? 'text-green-600' : 'text-gray-400'}`;
    
    switch (status.toLowerCase()) {
      case 'pending':
      case 'order_placed':
        return <ClockIcon className={iconClass} />;
      case 'paid':
      case 'payment_confirmed':
        return <CheckCircleIcon className={iconClass} />;
      case 'shipped':
      case 'processing':
      case 'packed':
        return <TruckIcon className={iconClass} />;
      case 'delivered':
        return <CheckCircleIcon className={iconClass} />;
      case 'cancelled':
        return <XCircleIcon className={iconClass} />;
      default:
        return <ClockIcon className={iconClass} />;
    }
  };

  const getStatusStep = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'order_placed':
        return 1;
      case 'paid':
      case 'payment_confirmed':
        return 2;
      case 'shipped':
      case 'processing':
      case 'packed':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const orderSteps = [
    { id: 1, name: 'Order Placed', description: 'Your order has been placed successfully' },
    { id: 2, name: 'Payment Confirmed', description: 'Payment has been processed' },
    { id: 3, name: 'Shipped', description: 'Your order is on its way' },
    { id: 4, name: 'Delivered', description: 'Order has been delivered' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Order</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600">We couldn't find the order you're looking for.</p>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(tracking.current_status);
  const isCancelled = tracking.current_status.toLowerCase() === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{tracking.order_id}</h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(tracking.order_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${parseFloat(tracking.total).toFixed(2)}</div>
              {tracking.estimated_delivery && !isCancelled && (
                <div className="text-sm text-gray-600 flex items-center mt-1">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Est. delivery: {new Date(tracking.estimated_delivery).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Progress */}
        {!isCancelled ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h2>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-5 w-full h-0.5 bg-gray-200">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (orderSteps.length - 1)) * 100}%` }}
                />
              </div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {orderSteps.map((step) => {
                  const isCompleted = currentStep >= step.id;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center
                        ${isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircleIcon className="w-6 h-6" />
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="mt-3 text-center max-w-xs">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <XCircleIcon className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Order Cancelled</h3>
                <p className="text-red-600 mt-1">This order has been cancelled.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Details */}
        {tracking.tracking_entries && tracking.tracking_entries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <TruckIcon className="w-5 h-5 mr-2" />
              Tracking Details
            </h2>
            
            <div className="space-y-6">
              {tracking.tracking_entries.map((entry, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(entry.status, index === 0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{entry.status}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                    {entry.location && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        {entry.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>
          
          <div className="space-y-4">
            {tracking.items?.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${parseFloat(item.total_price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <a
              href="mailto:support@onesoko.com"
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            >
              Email Support
            </a>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            >
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderTrackingPage;
