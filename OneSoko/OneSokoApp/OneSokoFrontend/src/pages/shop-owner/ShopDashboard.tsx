import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { useShopSession } from '../../hooks/useShopSession';
import { shopApi } from '../../services/shopApi';
import { productApi } from '../../services/productApi';
import type { Product, Order } from '../../types';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  monthlyGrowth: {
    products: number;
    orders: number;
    revenue: number;
    customers: number;
  };
}

const ShopDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { userShop, isLoadingShop } = useShopSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    monthlyGrowth: {
      products: 0,
      orders: 0,
      revenue: 0,
      customers: 0
    }
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isLoadingShop) return;
      
      setIsLoading(true);
      
      try {
        if (userShop) {
          // Get shop products
          const shopId = userShop.shopId;
          let products: Product[] = [];
          if (shopId) {
            products = await shopApi.getProducts(shopId);
            setRecentProducts(products.slice(0, 5));
          }

          // Calculate stats
          setStats({
            totalProducts: products.length,
            totalOrders: 0, // Will come from orders API
            totalRevenue: 0, // Will come from orders API
            totalCustomers: 0, // Will come from analytics API
            monthlyGrowth: {
              products: 12,
              orders: 8,
              revenue: 15,
              customers: 5
            }
          });
        } else {
          // No shop setup yet
          setStats({
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            monthlyGrowth: {
              products: 0,
              orders: 0,
              revenue: 0,
              customers: 0
            }
          });
          setRecentProducts([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userShop, isLoadingShop]);

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.delete(parseInt(productId));
        setRecentProducts(prev => prev.filter(p => p.productId !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-1">
          {userShop ? `Managing ${userShop.name}` : 'Set up your shop to start selling'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/shop/products/add"
            className="flex items-center justify-center p-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </Link>
          <Link
            to="/shop/products"
            className="flex items-center justify-center p-4 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-600 transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Manage Products
          </Link>
          <Link
            to="/shop/orders"
            className="flex items-center justify-center p-4 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-600 transition-colors"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            View Orders
          </Link>
          <Link
            to="/shop/settings"
            className="flex items-center justify-center p-4 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-600 transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Shop Settings
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Products</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stats.totalProducts}</p>
                <div className={`ml-2 flex items-center text-xs ${stats.monthlyGrowth.products >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.monthlyGrowth.products >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.monthlyGrowth.products)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Orders</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stats.totalOrders}</p>
                <div className={`ml-2 flex items-center text-xs ${stats.monthlyGrowth.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.monthlyGrowth.orders >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.monthlyGrowth.orders)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Revenue</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <div className={`ml-2 flex items-center text-xs ${stats.monthlyGrowth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.monthlyGrowth.revenue >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.monthlyGrowth.revenue)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Customers</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stats.totalCustomers}</p>
                <div className={`ml-2 flex items-center text-xs ${stats.monthlyGrowth.customers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.monthlyGrowth.customers >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.monthlyGrowth.customers)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent Products</h3>
              <Link
                to="/shop/products"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentProducts.length > 0 ? (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-secondary-200 dark:bg-secondary-700 rounded-lg flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <ShoppingBagIcon className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">${product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (product.quantity ?? product.stock_quantity ?? 0) > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        (product.quantity ?? product.stock_quantity ?? 0) > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {(product.quantity ?? product.stock_quantity ?? 0) > 0 ? `${product.quantity ?? product.stock_quantity} in stock` : 'Out of stock'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/shop/products/edit/${product.productId}`}
                          className="p-1 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => product.productId && handleDeleteProduct(product.productId)}
                          className="p-1 text-secondary-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-secondary-400 dark:text-secondary-600" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">No products yet</h3>
                <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                  Get started by adding your first product.
                </p>
                <div className="mt-6">
                  <Link
                    to="/shop/products/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
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
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent Orders</h3>
              <Link
                to="/shop/orders"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {order.user.first_name} {order.user.last_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">
                        ${order.total_amount}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="mx-auto h-12 w-12 text-secondary-400 dark:text-secondary-600" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">No orders yet</h3>
                <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                  Orders will appear here once customers start buying.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;
