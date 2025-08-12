import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { inquiryAPI } from '../services/api';

interface Inquiry {
  id: number;
  customer: string;
  product: {
    productId: string;
    name: string;
    price: number;
    image?: string;
  };
  message: string;
  response: string;
  status: 'pending' | 'responded' | 'resolved' | 'closed';
  created_at: string;
  responded_at?: string;
}

const InquiryManagement: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'responded'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [activeTab]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      let data: Inquiry[];
      
      switch (activeTab) {
        case 'pending':
          data = await inquiryAPI.getPendingInquiries();
          break;
        case 'responded':
          data = await inquiryAPI.getReceivedInquiries();
          break;
        default:
          data = await inquiryAPI.getReceivedInquiries();
      }
      
      setInquiries(data);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !response.trim()) return;

    try {
      setResponding(true);
      await inquiryAPI.respond(selectedInquiry.id, response.trim());
      
      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === selectedInquiry.id 
            ? { ...inquiry, response: response.trim(), status: 'responded' }
            : inquiry
        )
      );
      
      setSelectedInquiry(null);
      setResponse('');
    } catch (error) {
      console.error('Failed to respond to inquiry:', error);
      alert('Failed to send response. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  const handleMarkResolved = async (inquiryId: number) => {
    try {
      await inquiryAPI.markResolved(inquiryId);
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, status: 'resolved' }
            : inquiry
        )
      );
    } catch (error) {
      console.error('Failed to mark inquiry as resolved:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'responded':
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case 'resolved':
        return <CheckIcon className="w-4 h-4" />;
      case 'closed':
        return <XMarkIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Product Inquiries
          </h2>
          <div className="flex space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {inquiries.filter(i => i.status === 'pending').length} pending
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { key: 'all', label: 'All Inquiries' },
            { key: 'pending', label: 'Pending' },
            { key: 'responded', label: 'Responded' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No inquiries found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {inquiry.customer}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(inquiry.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                    {getStatusIcon(inquiry.status)}
                    <span>{inquiry.status}</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {inquiry.product.image ? (
                      <img
                        src={inquiry.product.image}
                        alt={inquiry.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-500">
                          {inquiry.product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {inquiry.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${inquiry.product.price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Message */}
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Message:
                  </h5>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {inquiry.message}
                  </p>
                </div>

                {/* Response */}
                {inquiry.response && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Response:
                    </h5>
                    <p className="text-sm text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      {inquiry.response}
                    </p>
                    {inquiry.responded_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Responded: {formatTimestamp(inquiry.responded_at)}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  {inquiry.status === 'pending' && (
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Respond
                    </button>
                  )}
                  {inquiry.status === 'responded' && (
                    <button
                      onClick={() => handleMarkResolved(inquiry.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedInquiry(null)}></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Respond to Inquiry
                </h3>

                <form onSubmit={handleRespond}>
                  <div className="mb-4">
                    <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Response
                    </label>
                    <textarea
                      id="response"
                      rows={4}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Provide information about availability, pricing, or answer their questions..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={responding || !response.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {responding ? 'Sending...' : 'Send Response'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryManagement; 