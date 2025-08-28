import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  items_count: number;
  estimated_delivery?: string;
  can_cancel: boolean;
  can_return: boolean;
}

interface OrderStats {
  total_orders: number;
  pending_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  total_revenue: number;
  recent_orders: Order[];
}

// Order Status Badge Component
const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' },
    paid: { color: 'bg-blue-100 text-blue-800', icon: CurrencyDollarIcon, text: 'Paid' },
    shipped: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon, text: 'Shipped' },
    delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Cancelled' }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <IconComponent className="w-3 h-3 mr-1" />
      {config.text}
    </span>
  );
};

// Stats Card Component
const StatsCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ 
  title, value, icon: Icon, color 
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-md ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Order Card Component
const OrderCard: React.FC<{ order: Order; onStatusUpdate?: (orderId: number, newStatus: string) => void }> = ({ 
  order, onStatusUpdate 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusUpdate) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
          <p className="text-sm text-gray-500">{order.customer_name} • {order.customer_email}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-semibold text-green-600">${parseFloat(order.total).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Items</p>
          <p className="font-semibold">{order.items_count} items</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Order Date</p>
          <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        {order.estimated_delivery && (
          <div>
            <p className="text-sm text-gray-500">Est. Delivery</p>
            <p className="font-medium">{new Date(order.estimated_delivery).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Status Update Actions */}
      <div className="flex gap-2 pt-4 border-t">
        {order.status === 'pending' && (
          <button
            onClick={() => handleStatusUpdate('paid')}
            disabled={isUpdating}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Mark as Paid
          </button>
        )}
        {order.status === 'paid' && (
          <button
            onClick={() => handleStatusUpdate('shipped')}
            disabled={isUpdating}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Mark as Shipped
          </button>
        )}
        {order.status === 'shipped' && (
          <button
            onClick={() => handleStatusUpdate('delivered')}
            disabled={isUpdating}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Mark as Delivered
          </button>
        )}
        {order.can_cancel && order.status !== 'cancelled' && (
          <button
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={isUpdating}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

// Main Order Management Dashboard Component
export const OrderManagementDashboard: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');

  // Load order data (this would connect to your enhanced order API)
  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would use your enhanced order API endpoints
      // const response = await fetch('/api/enhanced-orders/dashboard_summary/');
      // const statsData = await response.json();
      // setStats(statsData);
      
      // Mock data for demonstration
      const mockStats: OrderStats = {
        total_orders: 156,
        pending_orders: 23,
        shipped_orders: 45,
        delivered_orders: 88,
        total_revenue: 89750.50,
        recent_orders: [
          {
            id: 1001,
            status: 'pending',
            total: '125.99',
            created_at: '2025-08-19T10:30:00Z',
            customer_name: 'John Doe',
            customer_email: 'john@example.com',
            items_count: 3,
            can_cancel: true,
            can_return: false
          },
          {
            id: 1002,
            status: 'shipped',
            total: '89.50',
            created_at: '2025-08-18T14:15:00Z',
            customer_name: 'Jane Smith',
            customer_email: 'jane@example.com',
            items_count: 2,
            estimated_delivery: '2025-08-22T00:00:00Z',
            can_cancel: false,
            can_return: false
          }
        ]
      };
      
      setStats(mockStats);
      setOrders(mockStats.recent_orders);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load order data');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle order status updates
  const handleOrderStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      // This would call your enhanced order API
      // await fetch(`/api/enhanced-orders/${orderId}/update_status/`, {
      //   method: 'POST',
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as Order['status'] }
          : order
      ));
      
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrderData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the order management dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadOrderData}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management Dashboard</h1>
          <p className="text-gray-600">Track and manage your orders efficiently</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Total Orders" 
              value={stats.total_orders} 
              icon={ShoppingBagIcon} 
              color="bg-blue-500" 
            />
            <StatsCard 
              title="Pending Orders" 
              value={stats.pending_orders} 
              icon={ClockIcon} 
              color="bg-yellow-500" 
            />
            <StatsCard 
              title="Shipped Orders" 
              value={stats.shipped_orders} 
              icon={TruckIcon} 
              color="bg-purple-500" 
            />
            <StatsCard 
              title="Total Revenue" 
              value={`$${stats.total_revenue.toLocaleString()}`} 
              icon={CurrencyDollarIcon} 
              color="bg-green-500" 
            />
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'pending', label: 'Pending' },
              { key: 'shipped', label: 'Shipped' },
              { key: 'delivered', label: 'Delivered' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {activeTab === 'all' ? 'No orders to display' : `No ${activeTab} orders to display`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusUpdate={handleOrderStatusUpdate} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagementDashboard;
