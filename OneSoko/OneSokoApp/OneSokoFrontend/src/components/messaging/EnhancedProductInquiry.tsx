import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChatBubbleLeftIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ShoppingBagIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { messagesAPI } from '../../services/api';
import { Product, Shop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface EnhancedProductInquiryProps {
  product: Product;
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedProductInquiry: React.FC<EnhancedProductInquiryProps> = ({ 
  product, 
  shop, 
  isOpen, 
  onClose
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Pre-written inquiry templates
  const inquiryTemplates = [
    `Hi! I'm interested in "${product?.name}". Could you provide more details about this product?`,
    `Hello! Is "${product?.name}" currently in stock and available for immediate shipping?`,
    `I'd like to know more about the specifications and features of "${product?.name}".`,
    `What's the warranty/return policy for "${product?.name}"?`,
    `Do you offer any discounts for bulk purchases of "${product?.name}"?`,
    `Can you provide additional photos or videos of "${product?.name}"?`,
    `What are the available sizes/colors for "${product?.name}"?`,
    `Is the price for "${product?.name}" negotiable?`
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || !isAuthenticated || sending) return;

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
      
      // Clear message after a delay and redirect to messages
      setTimeout(() => {
        setMessage('');
        setSent(false);
        onClose();
        navigate('/messages');
      }, 2500);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setMessage(template);
    setSelectedTemplate(template);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Login Required
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Please log in to send product inquiries to shop owners.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Product Inquiry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {sent ? (
          /* Success State */
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Inquiry Sent Successfully!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Your product inquiry has been sent to the shop owner. They will respond to your message soon.
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              Redirecting to your messages...
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Product Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Product Details
              </h3>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </h4>
                  <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                    ${product.price?.toFixed(2)}
                  </p>
                  {product.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  {/* Product Stats */}
                  <div className="flex items-center space-x-4 mt-2">
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {product.rating}
                        </span>
                      </div>
                    )}
                    {product.stock !== undefined && (
                      <span className={`text-sm ${
                        product.stock > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Shop Information
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                    {shop.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-300">
                    {shop.name}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Owner: {shop.shopowner?.first_name} {shop.shopowner?.last_name}
                  </p>
                  {shop.city && (
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      📍 {shop.city}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Quick Inquiry Templates
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {inquiryTemplates.slice(0, 4).map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleTemplateSelect(template)}
                    className={`text-left p-3 rounded-lg transition-colors text-sm ${
                      selectedTemplate === template
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-300 dark:border-primary-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {template}
                    </span>
                  </button>
                ))}
              </div>
              
              {inquiryTemplates.length > 4 && (
                <button
                  onClick={() => {
                    // Show all templates in a modal or expand
                    console.log('Show more templates');
                  }}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-2"
                >
                  Show {inquiryTemplates.length - 4} more templates...
                </button>
              )}
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your inquiry here, or select a template above..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Press Enter to send, Shift+Enter for new line
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {message.length}/500
                </p>
              </div>
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
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                )}
                Send Inquiry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProductInquiry;
