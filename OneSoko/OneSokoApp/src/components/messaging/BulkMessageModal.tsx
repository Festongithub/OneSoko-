import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface BulkMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Customer {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  profile?: {
    avatar?: string;
    last_order_date?: string;
    total_orders?: number;
  };
}

const BulkMessageModal: React.FC<BulkMessageModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendResults, setSendResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // This would be a real API call to get customers who have interacted with the shop
      // For now, we'll simulate it
      const mockCustomers: Customer[] = [
        {
          id: 1,
          username: 'john_doe',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          profile: {
            last_order_date: '2024-01-15',
            total_orders: 5
          }
        },
        {
          id: 2,
          username: 'jane_smith',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          profile: {
            last_order_date: '2024-01-10',
            total_orders: 2
          }
        }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(customer => customer.id));
    }
  };

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const sendBulkMessage = async () => {
    if (!message.trim() || selectedCustomers.length === 0 || sending) return;

    try {
      setSending(true);
      let success = 0;
      let failed = 0;

      // Send messages to each selected customer
      for (const customerId of selectedCustomers) {
        try {
          await messagesAPI.send({
            recipient: customerId,
            content: message.trim()
          });
          success++;
        } catch (error) {
          console.error(`Failed to send message to customer ${customerId}:`, error);
          failed++;
        }
      }

      setSendResults({ success, failed });
      setSent(true);
      
      // Reset form after delay
      setTimeout(() => {
        setMessage('');
        setSelectedCustomers([]);
        setSent(false);
        if (failed === 0) {
          onClose();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Failed to send bulk messages:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    return fullName.includes(searchLower) || 
           customer.username.toLowerCase().includes(searchLower) ||
           customer.email?.toLowerCase().includes(searchLower);
  });

  const messageTemplates = [
    "Thank you for being a valued customer! We have exciting new products in store.",
    "Special discount just for you! Check out our latest offers.",
    "Your favorite items are back in stock!",
    "We miss you! Come back and explore our new collection.",
    "Limited time offer: Get 20% off on your next purchase!",
    "New arrivals are here! Be the first to check them out."
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Send Bulk Message
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
          /* Results Display */
          <div className="p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              sendResults.failed === 0 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              {sendResults.failed === 0 ? (
                <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Message Sending Complete
            </h3>
            
            <div className="space-y-2 mb-6">
              <p className="text-green-600 dark:text-green-400">
                ✅ {sendResults.success} messages sent successfully
              </p>
              {sendResults.failed > 0 && (
                <p className="text-red-600 dark:text-red-400">
                  ❌ {sendResults.failed} messages failed to send
                </p>
              )}
            </div>
            
            {sendResults.failed === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                Closing automatically...
              </p>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Customer Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Select Recipients
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCustomers.length} of {filteredCustomers.length} selected
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    {selectedCustomers.length === filteredCustomers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Customer List */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center p-8">
                    <UserGroupIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No customers found' : 'No customers available'}
                    </p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{customer.username} • {customer.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {customer.profile?.total_orders} orders
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Last: {customer.profile?.last_order_date}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Templates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Quick Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {messageTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(template)}
                    className="text-left p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Will be sent to {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''}
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
                onClick={sendBulkMessage}
                disabled={!message.trim() || selectedCustomers.length === 0 || sending}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                )}
                Send to {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkMessageModal;
