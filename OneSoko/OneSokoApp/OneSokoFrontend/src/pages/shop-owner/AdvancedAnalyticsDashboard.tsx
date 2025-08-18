import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';

interface DashboardMetrics {
  overview: {
    total_revenue: number;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    average_order_value: number;
    conversion_rate: number;
  };
  customers: {
    unique_customers: number;
    returning_customers: number;
    new_customers: number;
    retention_rate: number;
  };
  products: {
    total_products_sold: number;
    top_selling_products: Array<{
      product__name: string;
      total_sold: number;
      total_revenue: number;
    }>;
  };
  trends: {
    revenue_trend: Array<{
      date: string;
      revenue: number;
    }>;
    revenue_growth: number;
    order_growth: number;
  };
}

interface SalesAnalytics {
  sales_timeline: Array<{
    period: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  category_performance: Array<{
    product__category__name: string;
    total_revenue: number;
    total_quantity: number;
  }>;
  order_status_distribution: Array<{
    status: string;
    count: number;
  }>;
}

interface CustomerAnalytics {
  customer_segments: {
    new: number;
    regular: number;
    vip: number;
    at_risk: number;
  };
  top_customers: Array<{
    name: string;
    email: string;
    total_orders: number;
    total_spent: number;
    last_order: string;
  }>;
  total_customers: number;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null);
  const [customerData, setCustomerData] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      // Fetch dashboard overview
      const overviewResponse = await fetch(`/api/analytics/dashboard_overview/?days=${timeRange}`, {
        headers,
      });

      if (!overviewResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const overviewData = await overviewResponse.json();
      setDashboardData(overviewData);

      // Fetch sales analytics
      const salesResponse = await fetch(`/api/analytics/sales_analytics/?days=${timeRange}`, {
        headers,
      });

      if (salesResponse.ok) {
        const salesAnalytics = await salesResponse.json();
        setSalesData(salesAnalytics);
      }

      // Fetch customer analytics
      const customerResponse = await fetch(`/api/analytics/customer_analytics/`, {
        headers,
      });

      if (customerResponse.ok) {
        const customerAnalytics = await customerResponse.json();
        setCustomerData(customerAnalytics);
      }

    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    color: string;
  }> = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
              {formatPercentage(Math.abs(trend))}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardData.overview.total_revenue)}
          icon={CurrencyDollarIcon}
          trend={dashboardData.trends.revenue_growth}
          color="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={dashboardData.overview.total_orders.toLocaleString()}
          icon={ShoppingBagIcon}
          trend={dashboardData.trends.order_growth}
          color="bg-blue-500"
        />
        <StatCard
          title="Unique Customers"
          value={dashboardData.customers.unique_customers.toLocaleString()}
          icon={UsersIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Conversion Rate"
          value={formatPercentage(dashboardData.overview.conversion_rate)}
          icon={TrendingUpIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'sales', name: 'Sales Analytics', icon: TrendingUpIcon },
            { id: 'customers', name: 'Customer Analytics', icon: UsersIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-end space-x-2">
              {dashboardData.trends.revenue_trend.slice(-14).map((day, index) => {
                const maxRevenue = Math.max(...dashboardData.trends.revenue_trend.map(d => d.revenue));
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary-500 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${new Date(day.date).toLocaleDateString()}: ${formatCurrency(day.revenue)}`}
                    />
                    <span className="text-xs text-gray-500 mt-2 transform rotate-45">
                      {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div className="space-y-3">
              {dashboardData.products.top_selling_products.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-medium">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{product.product__name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(product.total_revenue)}</p>
                    <p className="text-sm text-gray-500">{product.total_sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && salesData && (
        <div className="space-y-6">
          {/* Category Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-3">
              {salesData.category_performance.map((category, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="font-medium text-gray-900">
                    {category.product__category__name || 'Uncategorized'}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(category.total_revenue)}</p>
                    <p className="text-sm text-gray-500">{category.total_quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {salesData.order_status_distribution.map((status, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                  <p className="text-sm text-gray-600 capitalize">{status.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && customerData && (
        <div className="space-y-6">
          {/* Customer Segments */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(customerData.customer_segments).map(([segment, count]) => (
                <div key={segment} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{segment.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerData.top_customers.slice(0, 10).map((customer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.total_orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.total_spent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.last_order).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
