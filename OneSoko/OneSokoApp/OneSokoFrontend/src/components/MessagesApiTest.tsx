import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  EyeIcon,
  CheckIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { messagesAPI } from '../services/api';
import { Message } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const MessagesApiTest: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessageData, setNewMessageData] = useState({
    recipient: '',
    content: ''
  });

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  // Test 1: Get Conversations
  const testGetConversations = useCallback(async () => {
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

  // Test 2: Get Unread Count
  const testGetUnreadCount = async () => {
    try {
      setLoading(true);
      const result = await messagesAPI.getUnreadCount();
      setUnreadCount(result);
      addTestResult({
        success: true,
        message: `Unread messages count: ${result}`,
        data: { unread_count: result }
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch unread count',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Send Message
  const testSendMessage = async () => {
    if (!newMessageData.recipient || !newMessageData.content) {
      addTestResult({
        success: false,
        message: 'Recipient and content are required',
        error: 'Please fill in all required fields'
      });
      return;
    }

    try {
      setLoading(true);
      const messageData = {
        recipient: parseInt(newMessageData.recipient),
        content: newMessageData.content
      };
      
      const result = await messagesAPI.send(messageData);
      addTestResult({
        success: true,
        message: `Message sent successfully to user ${messageData.recipient}`,
        data: result
      });
      
      setNewMessageData({
        recipient: '',
        content: ''
      });
      
      await testGetConversations();
      await testGetUnreadCount();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Mark All Messages as Read
  const testMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await messagesAPI.markAllAsRead();
      addTestResult({
        success: true,
        message: 'All messages marked as read'
      });
      await testGetUnreadCount();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to mark all messages as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    testGetConversations();
    testGetUnreadCount();
  }, [testGetConversations]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Messages API Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all messaging-related API endpoints and monitor results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                API Test Controls
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={testGetConversations}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Test Get Conversations
                </button>

                <button
                  onClick={testGetUnreadCount}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Test Get Unread Count
                </button>

                <button
                  onClick={testMarkAllAsRead}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Test Mark All as Read
                </button>

                <button
                  onClick={() => {
                    testGetConversations();
                    testGetUnreadCount();
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Send Message Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send Message
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recipient User ID *
                  </label>
                  <input
                    type="number"
                    value={newMessageData.recipient}
                    onChange={(e) => setNewMessageData(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="Enter recipient user ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message Content *
                  </label>
                  <textarea
                    value={newMessageData.content}
                    onChange={(e) => setNewMessageData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={testSendMessage}
                  disabled={loading || !newMessageData.recipient || !newMessageData.content}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Test Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Test Results and Data Display */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Test Results
                </h2>
                <button
                  onClick={clearTestResults}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No test results yet. Run some tests to see results here.
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
                          <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
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

            {/* Unread Count Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Unread Messages
              </h2>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {unreadCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Unread Messages
                </div>
              </div>
            </div>

            {/* Conversations Display */}
            {conversations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Conversations ({conversations.length})
                </h2>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {conversations.map((conversation, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {conversation.user?.first_name} {conversation.user?.last_name}
                        </span>
                        {conversation.unread_count > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.latest_message?.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesApiTest; 