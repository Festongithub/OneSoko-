import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  InformationCircleIcon,
  XMarkIcon,
  UserIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { messagesAPI } from '../../services/api';
import { Message } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import MessageTemplates from './MessageTemplates';
import ConversationInfo from './ConversationInfo';

interface Conversation {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile?: {
      avatar?: string;
      is_shopowner?: boolean;
      is_online?: boolean;
      last_seen?: string;
    };
  };
  latest_message: {
    content: string;
    timestamp: string;
    is_from_me: boolean;
    is_read: boolean;
  };
  unread_count: number;
  shop?: {
    shopId: string;
    name: string;
  };
}

const EnhancedMessagesCenter: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [showConversationOptions, setShowConversationOptions] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const data = await messagesAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const data = await messagesAPI.getWithUser(userId);
      setMessages(data);
      
      // Mark messages as read
      const unreadMessages = data.filter(msg => !msg.is_read && msg.recipient.id === user?.id);
      for (const msg of unreadMessages) {
        await messagesAPI.markAsRead(msg.id);
      }
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.user.id === userId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      setError(''); // Clear previous errors
      const messageData = {
        recipient: selectedConversation.user.id,
        content: newMessage.trim(),
        ...(selectedConversation.shop && { shop: selectedConversation.shop.shopId })
      };

      const sentMessage = await messagesAPI.send(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update conversation with new message
      setConversations(prev => 
        prev.map(conv => 
          conv.user.id === selectedConversation.user.id 
            ? {
                ...conv,
                latest_message: {
                  content: sentMessage.content,
                  timestamp: sentMessage.timestamp,
                  is_from_me: true,
                  is_read: false
                }
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: string) => {
    setNewMessage(template);
    setShowTemplates(false);
    messageInputRef.current?.focus();
  };

  // Simulate typing indicator when user is typing
  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    // Simulate adding current user to typing users for demo purposes
    if (value.trim() && selectedConversation) {
      setTypingUsers(prev => {
        if (!prev.includes(selectedConversation.user.id)) {
          // Simulate other user typing when current user types
          const newTypingUsers = [...prev, selectedConversation.user.id];
          
          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(current => current.filter(id => id !== selectedConversation.user.id));
          }, 3000);
          
          return newTypingUsers;
        }
        return prev;
      });
    }
  };

  // Delete conversation function
  const deleteConversation = async (conversationId: number) => {
    try {
      // In a real implementation, you would call an API to delete the conversation
      setConversations(prev => prev.filter(conv => conv.user.id !== conversationId));
      if (selectedConversation?.user.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      setShowConversationOptions(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setError('Failed to delete conversation. Please try again.');
    }
  };

  // Archive conversation function
  const archiveConversation = async (conversationId: number) => {
    try {
      // In a real implementation, you would call an API to archive the conversation
      console.log('Archiving conversation:', conversationId);
      setShowConversationOptions(null);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      setError('Failed to archive conversation. Please try again.');
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchTerm.toLowerCase();
    const userFullName = `${conv.user.first_name} ${conv.user.last_name}`.toLowerCase();
    const username = conv.user.username.toLowerCase();
    const shopName = conv.shop?.name?.toLowerCase() || '';
    
    return userFullName.includes(searchLower) || 
           username.includes(searchLower) || 
           shopName.includes(searchLower) ||
           conv.latest_message.content.toLowerCase().includes(searchLower);
  });

  // Format time with enhanced display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (message: Message) => {
    if (message.sender.id !== user?.id) return null;
    
    if (message.is_read) {
      return <CheckIcon className="w-4 h-4 text-blue-500" />;
    } else {
      return <CheckIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Close conversation options when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowConversationOptions(null);
    };

    if (showConversationOptions !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showConversationOptions]);

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Messages
          </h1>
          
          {/* Error Display */}
          {error && (
            <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center p-8">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.user.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  fetchMessages(conversation.user.id);
                }}
                className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedConversation?.user.id === conversation.user.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    {conversation.user.profile?.avatar ? (
                      <img
                        src={conversation.user.profile.avatar}
                        alt={conversation.user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                    {conversation.user.profile?.is_online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                    )}
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.user.first_name} {conversation.user.last_name}
                        </h3>
                        {conversation.user.profile?.is_shopowner && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            Shop Owner
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.latest_message.timestamp)}
                        </span>
                        {/* Conversation Options */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConversationOptions(
                                showConversationOptions === conversation.user.id ? null : conversation.user.id
                              );
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                          >
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </button>
                          
                          {/* Options Dropdown */}
                          {showConversationOptions === conversation.user.id && (
                            <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveConversation(conversation.user.id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                              >
                                Archive
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(conversation.user.id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {conversation.shop && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        🏪 {conversation.shop.name}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {conversation.latest_message.is_from_me && "You: "}
                        {conversation.latest_message.content}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full min-w-[1.25rem]">
                          {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    {selectedConversation.user.profile?.avatar ? (
                      <img
                        src={selectedConversation.user.profile.avatar}
                        alt={selectedConversation.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                    {selectedConversation.user.profile?.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedConversation.user.first_name} {selectedConversation.user.last_name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedConversation.user.profile?.is_online 
                        ? (
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span>Online</span>
                          </span>
                        )
                        : selectedConversation.user.profile?.last_seen 
                          ? (
                            <span className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>Last seen {formatTime(selectedConversation.user.profile.last_seen)}</span>
                            </span>
                          )
                          : 'Offline'
                      }
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // In a real app, this would initiate a call
                      console.log('Calling user:', selectedConversation.user.first_name);
                      alert(`Calling ${selectedConversation.user.first_name} ${selectedConversation.user.last_name}...`);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Call user"
                  >
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowConversationInfo(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <InformationCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Start a conversation by sending a message
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender.id === user?.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        message.sender.id === user?.id ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <span className="text-xs">
                          {formatTime(message.timestamp)}
                        </span>
                        {getMessageStatusIcon(message)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-end space-x-2">
                {/* Templates Button */}
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Message templates"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </button>

                {/* Message Input */}
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Templates Panel */}
              {showTemplates && (
                <MessageTemplates
                  onSelectTemplate={handleTemplateSelect}
                  onClose={() => setShowTemplates(false)}
                  isShopOwner={selectedConversation.user.profile?.is_shopowner}
                />
              )}
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
                Welcome to Messages
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Select a conversation from the sidebar to start chatting, or send a message from any shop or product page.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Info Modal */}
      {showConversationInfo && selectedConversation && (
        <ConversationInfo
          conversation={selectedConversation}
          onClose={() => setShowConversationInfo(false)}
        />
      )}
    </div>
  );
};

export default EnhancedMessagesCenter;
