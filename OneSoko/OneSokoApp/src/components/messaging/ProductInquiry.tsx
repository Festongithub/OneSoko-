import React, { useState } from 'react';
import { 
  ChatBubbleLeftIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { messagesAPI } from '../../services/api';
import { Product, Shop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProductInquiryProps {
  product: Product;
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
}

const ProductInquiry: React.FC<ProductInquiryProps> = ({ 
  product, 
  shop, 
  isOpen, 
  onClose 
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState(`Hi, I'm interested in ${product.name}. Could you provide more details?`);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendInquiry = async () => {
    if (!message.trim() || !isAuthenticated) return;

    try {
      setSending(true);
      
      const messageData = {
        recipient: shop.shopowner.id,
        content: message.trim(),
        shop: shop.shopId,
        product: product.productId
      };

      await messagesAPI.send(messageData);
      setSent(true);
      
      // Redirect to messages after a delay
      setTimeout(() => {
        onClose();
        navigate('/messages');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to send inquiry:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Login Required
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Please log in to send a product inquiry.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Product Inquiry
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Inquiry Sent!
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Your inquiry has been sent to {shop.name}. Redirecting to messages...
              </p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">IMG</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {shop.name}
                    </p>
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      KES {product.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Inquiry
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInquiry}
                    disabled={!message.trim() || sending}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                    )}
                    {sending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInquiry;
