import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CategoryAnalyticsProps {
  categoryStats: any[];
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

interface AnalyticsData {
  revenueOverTime: any;
  topCategories: any[];
  categoryDistribution: any;
  categoryPerformance?: any;
  growthMetrics: any[];
}

const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({
  categoryStats,
  timeRange,
  onTimeRangeChange
}) => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenueOverTime: {
      labels: [],
      datasets: []
    },
    topCategories: [],
    categoryDistribution: {
      labels: [],
      datasets: []
    },
    categoryPerformance: {
      labels: [],
      datasets: []
    },
    growthMetrics: []
  });

  // Mock data generation for demonstration
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const topCategories = categoryStats
        .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
        .slice(0, 10);

      const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Total Revenue',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
        ],
      };

      const categoryDistributionData = {
        labels: topCategories.slice(0, 5).map(cat => cat.name),
        datasets: [
          {
            data: topCategories.slice(0, 5).map(cat => cat.total_revenue || 0),
            backgroundColor: [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          },
        ],
      };

      const categoryPerformanceData = {
        labels: topCategories.map(cat => cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name),
        datasets: [
          {
            label: 'Revenue ($)',
            data: topCategories.map(cat => cat.total_revenue || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
          {
            label: 'Orders',
            data: topCategories.map(cat => (cat.total_orders || 0) * 100), // Scale for visibility
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1,
          },
        ],
      };

      setAnalyticsData({
        revenueOverTime: revenueData,
        topCategories: topCategories,
        categoryDistribution: categoryDistributionData,
        categoryPerformance: categoryPerformanceData,
        growthMetrics: []
      });
      
      setLoading(false);
    }, 1000);
  }, [categoryStats, timeRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotalRevenue = () => {
    return categoryStats.reduce((sum, cat) => sum + (cat.total_revenue || 0), 0);
  };

  const calculateTotalOrders = () => {
    return categoryStats.reduce((sum, cat) => sum + (cat.total_orders || 0), 0);
  };

  const calculateAverageGrowth = () => {
    const validGrowthRates = categoryStats.filter(cat => cat.growth_rate !== undefined);
    if (validGrowthRates.length === 0) return 0;
    const total = validGrowthRates.reduce((sum, cat) => sum + cat.growth_rate, 0);
    return total / validGrowthRates.length;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-3 text-blue-600" />
              Category Performance Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive insights into category performance and trends
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">Time Range:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange(range)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range === '7d' && '7 Days'}
                  {range === '30d' && '30 Days'}
                  {range === '90d' && '90 Days'}
                  {range === '1y' && '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(calculateTotalRevenue())}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {calculateTotalOrders().toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">+8.2%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ShoppingBagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {calculateAverageGrowth().toFixed(1)}%
              </p>
              <div className="flex items-center mt-2">
                {calculateAverageGrowth() >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${calculateAverageGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  vs last period
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {categoryStats.filter(cat => cat.product_count > 0).length}
              </p>
              <div className="flex items-center mt-2">
                <ClockIcon className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600">
                  {categoryStats.length} total
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Trend
            </h3>
            {loading && <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />}
          </div>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Line data={analyticsData.revenueOverTime} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Distribution
            </h3>
            {loading && <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />}
          </div>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Doughnut data={analyticsData.categoryDistribution} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Category Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Categories Performance
          </h3>
          {loading && <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />}
        </div>
        <div className="h-96">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Bar data={analyticsData.categoryPerformance} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Top Performing Categories Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Categories
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Products</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Growth</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rating</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topCategories.map((category, index) => (
                <tr key={category.id} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-yellow-400' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                      }`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {category.product_count}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {category.total_orders || 0}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(category.total_revenue || 0)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center ${
                      (category.growth_rate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(category.growth_rate || 0) >= 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(category.growth_rate || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {category.avg_rating ? category.avg_rating.toFixed(1) : 'N/A'}
                      </span>
                      {category.avg_rating && (
                        <div className="flex ml-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(category.avg_rating) 
                                  ? 'text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryAnalytics;
