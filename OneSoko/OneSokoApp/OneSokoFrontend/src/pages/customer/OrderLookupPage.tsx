import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, TruckIcon } from '@heroicons/react/24/outline';

const OrderLookupPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!orderId.trim()) {
      setError('Please enter an order ID');
      setIsLoading(false);
      return;
    }

    try {
      // Validate order exists and belongs to the email (if provided)
      const response = await fetch(`/api/enhanced-orders/${orderId}/tracking/`);
      
      if (response.ok) {
        // Navigate to the tracking page
        navigate(`/customer/orders/${orderId}/track`);
      } else if (response.status === 404) {
        setError('Order not found. Please check your order ID.');
      } else {
        setError('Unable to find order. Please try again.');
      }
    } catch (err) {
      setError('Unable to find order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <TruckIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
            <p className="text-gray-600">Enter your order details to track your delivery</p>
          </div>

          <form onSubmit={handleLookup} className="space-y-6">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                Order ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your order ID (e.g., 12345)"
                  required
                />
                <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter the email used for the order"
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps us verify your order
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                'Track Order'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Need help?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Your order ID can be found in your confirmation email</p>
              <p>• If you can't find your order, contact customer support</p>
              <p>• Orders typically appear within 10-15 minutes of placement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderLookupPage;
