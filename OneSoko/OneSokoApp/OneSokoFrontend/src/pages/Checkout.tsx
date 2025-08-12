import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon,
  CreditCardIcon,
  TruckIcon,
  CheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cartAPI, ordersAPI } from '../services/api';
import { Cart } from '../types';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartAPI.getCart();
      setCart(cartData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'address', 'city', 'country', 'phone', 'email'];
    for (const field of requiredFields) {
      if (!shippingInfo[field as keyof typeof shippingInfo].trim()) {
        setError(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      // Create order from cart
      const orders = await ordersAPI.createFromCart();
      
      setSuccess(true);
      
      // Redirect to order confirmation after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Cart</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCartIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some items to your cart before proceeding to checkout.
            </p>
            <button
              onClick={() => navigate('/shops')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your order has been placed and is being processed.
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to orders page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingCartIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.shop.name}
                      </p>
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
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${cart.total_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-white">$0.00</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">${cart.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Information
              </h2>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </form>

              {/* Payment Method */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Payment Method
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCardIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Pay when you receive your order
                  </p>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="mt-6">
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || !cart || cart.items.length === 0}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <TruckIcon className="w-5 h-5 mr-2" />
                      Place Order - ${cart?.total_price.toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 