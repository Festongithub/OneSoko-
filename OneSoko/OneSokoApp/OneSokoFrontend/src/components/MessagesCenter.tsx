import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { messagesAPI } from '../services/api';
import { Message } from '../types';

interface Conversation {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  latest_message: {
    content: string;
    timestamp: string;
    is_from_me: boolean;
  };
  unread_count: number;
}

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const MessagesCenter: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  // Scroll to bottom of messages
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
      const result = await messagesAPI.getConversations();
      setConversations(result);
      addTestResult({
        success: true,
        message: `Successfully fetched ${result.length} conversations`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch conversations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await messagesAPI.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // Fetch messages with a specific user
  const fetchMessagesWithUser = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const result = await messagesAPI.getWithUser(userId);
      setMessages(result);
      addTestResult({
        success: true,
        message: `Successfully fetched ${result.length} messages`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch messages',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const messageData = {
        recipient: selectedConversation.user.id,
        content: newMessage.trim()
      };
      
      const result = await messagesAPI.send(messageData);
      setMessages(prev => [...prev, result]);
      setNewMessage('');
      
      // Update conversations with new message
      await fetchConversations();
      await fetchUnreadCount();
      
      addTestResult({
        success: true,
        message: 'Message sent successfully',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await messagesAPI.delete(messageId);
      
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Update conversations and unread count
      await fetchConversations();
      await fetchUnreadCount();
      
      addTestResult({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to delete message',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Mark all messages as read
  const markAllAsRead = async () => {
    try {
      await messagesAPI.markAllAsRead();
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
      await fetchUnreadCount();
      addTestResult({
        success: true,
        message: 'All messages marked as read'
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to mark all messages as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessagesWithUser(conversation.user.id);
  };

  // Initial data fetch
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchConversations, fetchUnreadCount]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Messages
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Chat with shop owners and customers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    {unreadCount} unread
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  fetchConversations();
                  fetchUnreadCount();
                }}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Conversations ({conversations.length})
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No conversations yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.user.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedConversation?.user.id === conversation.user.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">
                              {conversation.user.first_name.charAt(0)}{conversation.user.last_name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                              {conversation.user.first_name} {conversation.user.last_name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {conversation.latest_message.is_from_me ? 'You: ' : ''}
                              {conversation.latest_message.content}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formatTimestamp(conversation.latest_message.timestamp)}
                            </p>
                          </div>
                        </div>
                        {conversation.unread_count > 0 && (
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                              {conversation.unread_count}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Chat Area */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96 flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {selectedConversation.user.first_name} {selectedConversation.user.last_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{selectedConversation.user.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex group ${message.sender.id === selectedConversation.user.id ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                          message.sender.id === selectedConversation.user.id 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'bg-primary-600 text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs opacity-75">
                              {formatTimestamp(message.timestamp)}
                            </p>
                            <div className="flex items-center space-x-2">
                              {message.sender.id !== selectedConversation.user.id && (
                                <p className="text-xs opacity-75">
                                  {message.is_read ? 'Read' : 'Sent'}
                                </p>
                              )}
                              
                              {/* Delete button - visible on hover */}
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500 hover:bg-opacity-20 rounded"
                                title="Delete message"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Show context if message relates to shop/product */}
                          {(message.shop || message.product) && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 border-opacity-50">
                              <p className="text-xs opacity-75">
                                {message.product && `📦 About: ${message.product.name}`}
                                {message.shop && !message.product && `🏪 Shop: ${message.shop.name}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Welcome State */
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Welcome to Messages
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Select a conversation from the sidebar to start chatting.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      Chat with Users
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Read Messages
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              API Test Results
            </h2>
            <button
              onClick={clearTestResults}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No test results yet. Use the messaging features to see results here.
              </p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-start">
                    {result.success ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {result.message}
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesCenter; 