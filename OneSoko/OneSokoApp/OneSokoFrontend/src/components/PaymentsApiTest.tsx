import React, { useState, useCallback } from 'react';
import { 
  CreditCardIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { paymentsAPI } from '../services/api';
import { Payment, Order } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

const PaymentsApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Test form data
  const [testPaymentData, setTestPaymentData] = useState({
    order_id: 1,
    amount: 99.99,
    payment_method: 'credit_card',
    transaction_id: 'test-txn-' + Date.now(),
    status: 'pending',
    notes: 'Test payment created via API'
  });

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test Functions
  const testGetMyPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentsAPI.getAll();
      setPayments(data);
      addTestResult({
        success: true,
        message: `Successfully fetched ${data.length} payments`,
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch payments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const testCreatePayment = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentsAPI.create(testPaymentData);
      addTestResult({
        success: true,
        message: `Successfully created payment with ID ${data.id}`,
        data: data
      });
      // Refresh payments
      testGetMyPayments();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to create payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [testPaymentData, testGetMyPayments]);

  const testUpdatePaymentStatus = useCallback(async () => {
    if (!selectedPayment) {
      addTestResult({
        success: false,
        message: 'No payment selected',
        error: 'Please select a payment first'
      });
      return;
    }

    setLoading(true);
    try {
      const newStatus = selectedPayment.status === 'pending' ? 'completed' : 'pending';
      const data = await paymentsAPI.updateStatus(selectedPayment.id, newStatus);
      addTestResult({
        success: true,
        message: `Successfully updated payment ${selectedPayment.id} status to ${newStatus}`,
        data: data
      });
      // Refresh payments
      testGetMyPayments();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to update payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPayment, testGetMyPayments]);

  const testGetPaymentById = useCallback(async () => {
    if (!selectedPayment) {
      addTestResult({
        success: false,
        message: 'No payment selected',
        error: 'Please select a payment first'
      });
      return;
    }

    setLoading(true);
    try {
      const data = await paymentsAPI.getById(selectedPayment.id);
      addTestResult({
        success: true,
        message: `Successfully fetched payment ${selectedPayment.id}`,
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch payment by ID',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPayment]);

  const testCreateMultiplePayments = useCallback(async () => {
    setLoading(true);
    try {
      const testPayments = [
        {
          order_id: 1,
          amount: 49.99,
          payment_method: 'credit_card',
          transaction_id: 'test-txn-1-' + Date.now(),
          status: 'completed',
          notes: 'Test payment 1'
        },
        {
          order_id: 2,
          amount: 29.99,
          payment_method: 'debit_card',
          transaction_id: 'test-txn-2-' + Date.now(),
          status: 'pending',
          notes: 'Test payment 2'
        },
        {
          order_id: 3,
          amount: 79.99,
          payment_method: 'bank_transfer',
          transaction_id: 'test-txn-3-' + Date.now(),
          status: 'failed',
          notes: 'Test payment 3'
        }
      ];

      let successCount = 0;
      for (const paymentData of testPayments) {
        try {
          await paymentsAPI.create(paymentData);
          successCount++;
        } catch (error) {
          console.log(`Failed to create payment:`, error);
        }
      }

      addTestResult({
        success: successCount > 0,
        message: `Successfully created ${successCount} out of ${testPayments.length} payments`,
        data: { successCount, totalPayments: testPayments.length }
      });
      // Refresh payments
      testGetMyPayments();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to create multiple payments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [testGetMyPayments]);

  const testPaymentWorkflow = useCallback(async () => {
    setLoading(true);
    try {
      addTestResult({
        success: true,
        message: 'Starting comprehensive payment test workflow',
        data: { step: 'workflow_start' }
      });

      // 1. Create a test payment
      const testPayment = {
        order_id: 999,
        amount: 199.99,
        payment_method: 'credit_card',
        transaction_id: 'workflow-txn-' + Date.now(),
        status: 'pending',
        notes: 'Workflow test payment'
      };

      const createdPayment = await paymentsAPI.create(testPayment);
      addTestResult({
        success: true,
        message: `Created payment with ID ${createdPayment.id}`,
        data: { paymentId: createdPayment.id }
      });

      // 2. Get payment by ID
      const fetchedPayment = await paymentsAPI.getById(createdPayment.id);
      addTestResult({
        success: true,
        message: `Successfully fetched payment ${createdPayment.id}`,
        data: { paymentId: fetchedPayment.id, status: fetchedPayment.status }
      });

      // 3. Update payment status
      const updatedPayment = await paymentsAPI.updateStatus(createdPayment.id, 'completed');
      addTestResult({
        success: true,
        message: `Successfully updated payment ${createdPayment.id} status to completed`,
        data: { paymentId: updatedPayment.id, status: updatedPayment.status }
      });

      // 4. Get all payments
      const allPayments = await paymentsAPI.getAll();
      addTestResult({
        success: true,
        message: `Workflow completed. Total payments: ${allPayments.length}`,
        data: { totalPayments: allPayments.length }
      });

      setPayments(allPayments);
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Workflow test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payments API Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all Payments API endpoints
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={testGetMyPayments}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Get My Payments
            </button>
            <button
              onClick={testCreatePayment}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Create Payment
            </button>
            <button
              onClick={testUpdatePaymentStatus}
              disabled={loading || !selectedPayment}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Update Status
            </button>
            <button
              onClick={testGetPaymentById}
              disabled={loading || !selectedPayment}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Get by ID
            </button>
            <button
              onClick={testCreateMultiplePayments}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Create Multiple
            </button>
            <button
              onClick={testPaymentWorkflow}
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              Test Workflow
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>

          {/* Test Payment Data Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order ID
              </label>
              <input
                type="number"
                value={testPaymentData.order_id}
                onChange={(e) => setTestPaymentData(prev => ({ ...prev, order_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={testPaymentData.amount}
                onChange={(e) => setTestPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={testPaymentData.payment_method}
                onChange={(e) => setTestPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={testPaymentData.status}
                onChange={(e) => setTestPaymentData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                value={testPaymentData.transaction_id}
                onChange={(e) => setTestPaymentData(prev => ({ ...prev, transaction_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={testPaymentData.notes}
                onChange={(e) => setTestPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          )}
        </div>

        {/* Current Payments Display */}
        {payments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Payments ({payments.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payments.map((payment) => (
                <div 
                  key={payment.id} 
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedPayment?.id === payment.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedPayment(payment)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Payment #{payment.id}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{payment.status}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">{formatCurrency(payment.amount)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      <span>{payment.payment_method.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{formatDate(payment.created_at)}</span>
                    </div>
                  </div>

                  {payment.transaction_id && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 font-mono">
                      {payment.transaction_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Results ({testResults.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {result.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.message}
                    </p>
                    {result.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{result.error}</p>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                          View Data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsApiTest; 