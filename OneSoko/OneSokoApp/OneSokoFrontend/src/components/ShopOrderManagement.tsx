import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBagIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ordersAPI, shopsAPI } from '../services/api';
import { Order, Shop } from '../types';

interface ShopOrderStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_revenue: number;
  shop_stats: Array<{
    shop_id: string;
    shop_name: string;
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    total_revenue: number;
  }>;
}

interface ShopOrderManagementProps {
  shopId?: string;
}

const ShopOrderManagement: React.FC<ShopOrderManagementProps> = ({ shopId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState<ShopOrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    shop_id: shopId || ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, shopsData, statsData] = await Promise.all([
        ordersAPI.getShopOrders(filters),
        shopsAPI.getMyShops(),
        ordersAPI.getShopOrderStats()
      ]);
      setOrders(ordersData);
      setShops(shopsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (shopId) {
      setFilters(prev => ({ ...prev, shop_id: shopId }));
    }
  }, [shopId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCompleteOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const updatedOrder = await ordersAPI.completeOrder(orderId);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      // Refresh stats after completing order
      const newStats = await ordersAPI.getShopOrderStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to complete order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: 'status' | 'shop_id', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserDisplayName = (user: any) => {
    if (typeof user === 'string') {
      return user;
    }
    if (user && typeof user === 'object') {
      return user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
    }
    return 'Unknown User';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shop Order Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage orders for your shops and track performance
          </p>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <ShoppingBagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_orders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_orders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed_orders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.total_revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shop Statistics */}
        {stats?.shop_stats && stats.shop_stats.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Shop Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.shop_stats.map((shopStat) => (
                <div key={shopStat.shop_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{shopStat.shop_name}</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Total Orders: {shopStat.total_orders}</p>
                    <p>Pending: {shopStat.pending_orders}</p>
                    <p>Completed: {shopStat.completed_orders}</p>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      Revenue: ${shopStat.total_revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </h2>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shop
              </label>
              <select
                value={filters.shop_id}
                onChange={(e) => handleFilterChange('shop_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Shops</option>
                {shops.map(shop => (
                  <option key={shop.shopId} value={shop.shopId}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Orders ({orders.length})
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No orders found. {filters.status || filters.shop_id ? 'Try adjusting your filters.' : ''}
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Order #{order.id}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <EyeIcon className="w-3 h-3 mr-1" />
                      Details
                    </button>
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        disabled={loading}
                        className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Shop: {order.shop.name}</p>
                    <p>Customer: {getUserDisplayName(order.user)}</p>
                    <p>Items: {order.total_items}</p>
                    <p>Created: {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Order Details */}
        {selectedOrder && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Details - #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Information</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                  <p><strong>Items:</strong> {selectedOrder.total_items}</p>
                  <p><strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Customer:</strong> {getUserDisplayName(selectedOrder.user)}</p>
                  <p><strong>Shop:</strong> {selectedOrder.shop.name}</p>
                  <p><strong>Location:</strong> {selectedOrder.shop.location}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Items</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${item.total_price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOrderManagement; 