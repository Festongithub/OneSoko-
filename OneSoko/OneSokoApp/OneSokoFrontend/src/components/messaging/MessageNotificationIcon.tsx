import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftIcon, 
  XMarkIcon, 
  PaperAirplaneIcon, 
  UserIcon
} from '@heroicons/react/24/outline';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import QuickMessageModal from './QuickMessageModal';

const MessageNotificationIcon: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shopSearch, setShopSearch] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowQuickMessage(false);
      }
    };

    if (showQuickMessage) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showQuickMessage]);

  useEffect(() => {
    console.log('Authentication status:', isAuthenticated);
    
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const count = await messagesAPI.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    const fetchShops = async () => {
      try {
        console.log('Fetching shops...');
        const shopsData = await import('../../services/api').then(module => module.shopsAPI.getAll());
        console.log('Shops fetched:', shopsData);
        
        // Ensure we always set an array
        if (Array.isArray(shopsData)) {
          setShops(shopsData);
        } else if (shopsData && typeof shopsData === 'object' && 'shops' in shopsData && Array.isArray((shopsData as any).shops)) {
          setShops((shopsData as any).shops);
        } else {
          setShops([]);
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error);
        setShops([]); // Ensure shops is always an array on error
      }
    };

    const fetchRecentConversations = async () => {
      try {
        const conversations = await messagesAPI.getConversations();
        setRecentConversations(conversations.slice(0, 5)); // Get 5 most recent
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };

    fetchUnreadCount();
    fetchShops();
    fetchRecentConversations();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSendMessage = async () => {
    console.log('Send button clicked!');
    console.log('Message text:', messageText);
    console.log('Selected shop:', selectedShop);
    
    if (!messageText.trim() || !selectedShop) {
      console.log('Validation failed - missing message or shop');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending message to API...');
      
      const response = await messagesAPI.send({
        recipient: parseInt(selectedShop),
        content: messageText,
      });
      
      console.log('Message sent successfully:', response);
      setSuccess(true);
      setMessageText('');
      setSelectedShop('');
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setShowQuickMessage(false);
      }, 2000);
      
      // Refresh unread count
      const count = await messagesAPI.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = (recipient: any) => {
    setSelectedRecipient(recipient);
    setShowQuickMessage(false);
    setShowFullModal(true);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowQuickMessage(!showQuickMessage);
    // Reset states when opening
    if (!showQuickMessage) {
      setShopSearch('');
      setMessageText('');
      setSelectedShop('');
      setSelectedRecipient(null);
      setSuccess(false);
    }
  };

  // Filter shops based on search
  const filteredShops = Array.isArray(shops) ? shops.filter(shop => 
    shop.name?.toLowerCase().includes(shopSearch.toLowerCase()) ||
    shop.city?.toLowerCase().includes(shopSearch.toLowerCase()) ||
    shop.location?.toLowerCase().includes(shopSearch.toLowerCase())
  ) : [];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      {/* Message Icon */}
      <button
        onClick={handleIconClick}
        className="relative text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors p-2"
      >
        <ChatBubbleLeftIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[1.25rem] h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Quick Message Modal */}
      {showQuickMessage && (
        <div 
          ref={modalRef}
          className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Message</h3>
              <button
                onClick={() => setShowQuickMessage(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 dark:text-green-400 font-medium">Message sent successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Recent Conversations */}
                {recentConversations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recent Conversations
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {recentConversations.map((conversation) => (
                        <div
                          key={conversation.user.id}
                          onClick={() => handleStartConversation(conversation.user)}
                          className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                            <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {conversation.user.first_name} {conversation.user.last_name}
                            </p>
                            {conversation.unread_count > 0 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                {conversation.unread_count} new
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                  </div>
                )}

                {/* New Message Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Send New Message
                  </h4>
                  
                  {/* Shop Search */}
                  <input
                    type="text"
                    placeholder="Search shops..."
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  
                  {/* Shop Selection Dropdown */}
                  <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a shop to contact...</option>
                    {filteredShops.map((shop) => (
                      <option key={shop.shopId} value={shop.shopowner?.id}>
                        🏪 {shop.name} {shop.city && `• ${shop.city}`} {shop.shopowner && `• Owner: ${shop.shopowner.first_name || shop.shopowner.username}`}
                      </option>
                    ))}
                  </select>
                  
                  {/* Shop Selection Status */}
                  {shops.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Loading available shops...
                    </p>
                  ) : filteredShops.length === 0 && shopSearch ? (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      No shops found matching "{shopSearch}"
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  />
                </div>

                {/* Send Button */}
                <div className="flex justify-between items-center">
                  <Link
                    to="/messages"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    onClick={() => setShowQuickMessage(false)}
                  >
                    View all messages
                  </Link>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || !selectedShop || isLoading}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    type="button"
                  >
                    {isLoading ? (
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
      )}

      {/* Full Message Modal */}
      <QuickMessageModal
        isOpen={showFullModal}
        onClose={() => {
          setShowFullModal(false);
          setSelectedRecipient(null);
        }}
        recipient={selectedRecipient}
      />
    </div>
  );
};

export default MessageNotificationIcon;
