import React, { useState } from 'react';
import { 
  ChatBubbleLeftIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon 
} from '@heroicons/react/24/outline';
import EnhancedMessagesCenter from './messaging/EnhancedMessagesCenter';
import QuickMessageModal from './messaging/QuickMessageModal';
import BulkMessageModal from './messaging/BulkMessageModal';
import EnhancedProductInquiry from './messaging/EnhancedProductInquiry';
import { useAuth } from '../contexts/AuthContext';

interface MessagingDemoProps {
  // Demo props for testing
  demoProduct?: any;
  demoShop?: any;
  demoRecipient?: any;
}

const MessagingDemo: React.FC<MessagingDemoProps> = ({
  demoProduct,
  demoShop,
  demoRecipient
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Demo data for testing
  const defaultProduct = demoProduct || {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 149.99,
    description: 'High-quality wireless headphones with noise cancellation',
    image: '/api/placeholder/400/300',
    stock: 25,
    rating: 4.5
  };

  const defaultShop = demoShop || {
    shopId: '1',
    name: 'TechGear Pro',
    description: 'Your one-stop shop for premium tech accessories',
    city: 'Nairobi',
    shopowner: {
      id: 2,
      username: 'techgear_owner',
      first_name: 'John',
      last_name: 'Smith',
      profile: {
        is_shopowner: true,
        is_online: true
      }
    }
  };

  const defaultRecipient = demoRecipient || {
    id: 3,
    username: 'customer123',
    first_name: 'Jane',
    last_name: 'Doe',
    profile: {
      is_shopowner: false,
      is_online: false,
      last_seen: '2024-01-15T14:30:00Z'
    }
  };

  const isShopOwner = user?.profile?.is_shopowner;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Enhanced Messaging System
              </h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isAuthenticated ? `Welcome, ${user?.first_name || user?.username}` : 'Please log in'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Messaging Features Demo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Full Messages Center */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <ChatBubbleLeftIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Messages Center
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Full-featured messaging interface with conversations, real-time chat, and templates.
              </p>
              <button
                onClick={() => setActiveDemo('messages-center')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Messages
              </button>
            </div>

            {/* Product Inquiry */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <ShoppingBagIcon className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Product Inquiry
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Enhanced product inquiry modal with templates and rich product context.
              </p>
              <button
                onClick={() => setActiveDemo('product-inquiry')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Product Inquiry
              </button>
            </div>

            {/* Quick Message */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <BuildingStorefrontIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Message
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Streamlined modal for quick message composition with recipient selection.
              </p>
              <button
                onClick={() => setActiveDemo('quick-message')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Send Quick Message
              </button>
            </div>

            {/* Bulk Messaging (Shop Owners Only) */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 ${
              !isShopOwner ? 'opacity-50' : ''
            }`}>
              <div className="flex items-center mb-4">
                <UserGroupIcon className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bulk Messaging
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Send promotional messages to multiple customers (Shop owners only).
              </p>
              <button
                onClick={() => isShopOwner && setActiveDemo('bulk-message')}
                disabled={!isShopOwner}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isShopOwner ? 'Bulk Message' : 'Shop Owner Feature'}
              </button>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚀 Enhanced Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">User Experience</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Real-time chat interface</li>
                <li>• Message templates</li>
                <li>• Search & filter conversations</li>
                <li>• Mobile-optimized design</li>
                <li>• Dark mode support</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Advanced Features</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Read receipts & status</li>
                <li>• Typing indicators</li>
                <li>• Online presence</li>
                <li>• Message history</li>
                <li>• Product context</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Shop Owner Tools</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Customer management</li>
                <li>• Bulk messaging</li>
                <li>• Professional templates</li>
                <li>• Customer insights</li>
                <li>• Quick responses</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 How to Use
          </h3>
          <div className="text-blue-800 dark:text-blue-300 space-y-2">
            <p>1. <strong>Messages Center:</strong> Click to open the full messaging interface with all conversations</p>
            <p>2. <strong>Product Inquiry:</strong> Test the enhanced product inquiry modal with templates</p>
            <p>3. <strong>Quick Message:</strong> Try the streamlined message composition modal</p>
            <p>4. <strong>Bulk Messaging:</strong> Shop owners can test sending messages to multiple customers</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeDemo === 'messages-center' && (
        <div className="fixed inset-0 z-50">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setActiveDemo(null)}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close Demo
            </button>
          </div>
          <EnhancedMessagesCenter />
        </div>
      )}

      <EnhancedProductInquiry
        product={defaultProduct}
        shop={defaultShop}
        isOpen={activeDemo === 'product-inquiry'}
        onClose={() => setActiveDemo(null)}
      />

      <QuickMessageModal
        isOpen={activeDemo === 'quick-message'}
        onClose={() => setActiveDemo(null)}
        recipient={defaultRecipient}
        shop={defaultShop}
      />

      {isShopOwner && (
        <BulkMessageModal
          isOpen={activeDemo === 'bulk-message'}
          onClose={() => setActiveDemo(null)}
        />
      )}
    </div>
  );
};

export default MessagingDemo;
