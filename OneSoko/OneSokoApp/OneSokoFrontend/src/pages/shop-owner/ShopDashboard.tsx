import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { shopApi } from '../../services/shopApi';
import type { Product, Order } from '../../types';
import toast from 'react-hot-toast';

const ShopDashboard: React.FC = () => {
  const { user, userProfile } = useAuthStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Get shop data
        const shopData = await shopApi.getMyShop();
        
        if (shopData) {
          // Get shop products
          const products = await shopApi.getProducts(shopData.id);
          setRecentProducts(products.slice(0, 5)); // Get latest 5 products
          
          // Calculate stats from available data
          const totalRevenue = 0; // This would come from orders API
          const totalCustomers = 0; // This would come from analytics API
          
          setStats({
            totalProducts: products.length,
            totalOrders: 0, // This would come from orders API
            totalRevenue,
            totalCustomers
          });
        }
        
        // For now, orders would need to be fetched when that API is available
        setRecentOrders([]);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        
        // Fallback to mock data
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0
        });
        setRecentProducts([]);
        setRecentOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-secondary-900">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage your shop and track your business performance
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/shop/products/new"
              className="flex items-center justify-center p-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Link>
            <Link
              to="/shop/products"
              className="flex items-center justify-center p-4 bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              View Products
            </Link>
            <Link
              to="/shop/orders"
              className="flex items-center justify-center p-4 bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              View Orders
            </Link>
            <Link
              to="/shop/settings"
              className="flex items-center justify-center p-4 bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Shop Settings
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-secondary-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Products */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-secondary-600">Total Products</h3>
                    <p className="text-2xl font-bold text-secondary-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-secondary-600">Total Orders</h3>
                    <p className="text-2xl font-bold text-secondary-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-secondary-600">Total Revenue</h3>
                    <p className="text-2xl font-bold text-secondary-900">
                      ${stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Customers */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-secondary-600">Total Customers</h3>
                    <p className="text-2xl font-bold text-secondary-900">{stats.totalCustomers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-secondary-900">Recent Products</h3>
                <Link
                  to="/shop/products"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="card-body">
              {recentProducts.length > 0 ? (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-secondary-200 rounded-lg flex items-center justify-center">
                          <ShoppingBagIcon className="h-5 w-5 text-secondary-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-secondary-900">{product.name}</p>
                          <p className="text-sm text-secondary-600">${product.price}</p>
                        </div>
                      </div>
                      <span className={`badge ${
                        product.stock_quantity > 10 ? 'badge-success' : 
                        product.stock_quantity > 0 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">No products yet</h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Get started by adding your first product.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/shop/products/new"
                      className="btn-primary"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Product
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-secondary-900">Recent Orders</h3>
                <Link
                  to="/shop/orders"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary-900">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {order.user.first_name} {order.user.last_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-900">
                          ${order.total_amount}
                        </p>
                        <span className={`badge ${
                          order.status === 'delivered' ? 'badge-success' :
                          order.status === 'shipped' ? 'badge-primary' :
                          order.status === 'confirmed' ? 'badge-secondary' :
                          order.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">No orders yet</h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Orders will appear here once customers start buying your products.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shop Performance */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-secondary-900">Shop Performance</h3>
            </div>
            <div className="card-body">
              <div className="text-center py-8">
                <ChartBarIcon className="mx-auto h-12 w-12 text-secondary-400" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900">Analytics Coming Soon</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Detailed analytics and performance metrics will be available here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;
