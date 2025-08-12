import React, { useState, useEffect } from 'react';
import { 
  PaperAirplaneIcon,
  XMarkIcon,
  UserIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile?: {
      avatar?: string;
      is_shopowner?: boolean;
    };
  };
  shop?: {
    shopId: string;
    name: string;
    description?: string;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  initialMessage?: string;
}

const QuickMessageModal: React.FC<QuickMessageModalProps> = ({
  isOpen,
  onClose,
  recipient,
  shop,
  product,
  initialMessage = ''
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState(initialMessage);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage);
      setSent(false);
    }
  }, [isOpen, initialMessage]);

  const handleSendMessage = async () => {
    if (!message.trim() || !recipient || sending) return;

    try {
      setSending(true);
      
      const messageData = {
        recipient: recipient.id,
        content: message.trim(),
        ...(shop && { shop: shop.shopId }),
        ...(product && { product: product.id })
      };

      await messagesAPI.send(messageData);
      setSent(true);
      
      // Show success and redirect after delay
      setTimeout(() => {
        onClose();
        navigate('/messages');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Login Required
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Please log in to send messages to shop owners and other users.
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Send Message
          </h2>
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
              Message Sent Successfully!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Your message has been delivered. Redirecting to messages...
            </p>
          </div>
        ) : (
          /* Message Form */
          <div className="p-6 space-y-6">
            {/* Recipient Info */}
            {recipient && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Sending to:
                </h3>
                <div className="flex items-center space-x-3">
                  {recipient.profile?.avatar ? (
                    <img
                      src={recipient.profile.avatar}
                      alt={recipient.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {recipient.first_name} {recipient.last_name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{recipient.username}
                      </p>
                      {recipient.profile?.is_shopowner && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          <BuildingStorefrontIcon className="w-3 h-3 mr-1" />
                          Shop Owner
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Context */}
            {shop && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <BuildingStorefrontIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-300">
                      {shop.name}
                    </p>
                    {shop.description && (
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {shop.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Product Context */}
            {product && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-900 dark:text-green-300">
                      {product.name}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>

            {/* Quick Templates */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick templates:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Hi! I'm interested in this product.",
                  "Could you provide more details?",
                  "Is this item still available?",
                  "What are the shipping options?"
                ].map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(template)}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {template}
                  </button>
                ))}
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
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickMessageModal;
