import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import XHeader from './XHeader';
import XSidebar from './XSidebar';
import { useAuthStore } from '../../stores/authStore';

interface XLayoutProps {
  variant?: 'customer' | 'shop-owner';
}

const XLayout: React.FC<XLayoutProps> = ({ variant = 'customer' }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="x-theme min-h-screen bg-black text-white">
      {/* Sidebar */}
      <XSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleSidebarClose}
        variant={variant}
      />

      {/* Main Content Area */}
      <div className="lg:ml-64 xl:ml-72 min-h-screen flex flex-col">
        {/* Header */}
        <XHeader
          onMobileMenuToggle={handleMobileMenuToggle}
          variant={variant}
        />

        {/* Page Content */}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 min-w-0 border-r border-gray-800">
                <Outlet />
              </div>

              {/* Right Sidebar - Only show on larger screens and when authenticated */}
              {isAuthenticated && (
                <div className="hidden xl:block w-80 p-4 space-y-6">
                  {/* Quick Stats */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Quick Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Products</span>
                        <span className="text-white font-medium">2,547</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shops</span>
                        <span className="text-white font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Orders</span>
                        <span className="text-white font-medium">8,901</span>
                      </div>
                    </div>
                  </div>

                  {/* Trending Products */}
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white">Trending Products</h3>
                    </div>
                    <div className="space-y-0">
                      {[
                        { name: 'iPhone 15 Pro', category: 'Electronics', trend: '+12%' },
                        { name: 'Nike Air Max', category: 'Fashion', trend: '+8%' },
                        { name: 'MacBook Air', category: 'Electronics', trend: '+15%' },
                        { name: 'Coffee Maker', category: 'Home', trend: '+5%' },
                      ].map((product, index) => (
                        <div key={index} className="p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-white text-sm">{product.name}</p>
                              <p className="text-gray-400 text-xs">{product.category}</p>
                            </div>
                            <span className="text-green-500 text-xs font-medium">{product.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    </div>
                    <div className="space-y-0">
                      {[
                        { action: 'New order received', time: '2m ago', user: 'John Doe' },
                        { action: 'Product review posted', time: '5m ago', user: 'Jane Smith' },
                        { action: 'Shop rating updated', time: '10m ago', user: 'Tech Store' },
                        { action: 'Payment confirmed', time: '15m ago', user: 'Alice Johnson' },
                      ].map((activity, index) => (
                        <div key={index} className="p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0">
                          <p className="text-white text-sm">{activity.action}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-gray-400 text-xs">{activity.user}</p>
                            <span className="text-gray-500 text-xs">{activity.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Shops */}
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white">Suggested Shops</h3>
                    </div>
                    <div className="space-y-0">
                      {[
                        { name: 'Tech Hub Kenya', followers: '12.5K', verified: true },
                        { name: 'Fashion Forward', followers: '8.2K', verified: false },
                        { name: 'Home Essentials', followers: '5.7K', verified: true },
                      ].map((shop, index) => (
                        <div key={index} className="p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src="/api/placeholder/32/32"
                                alt={shop.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="flex items-center space-x-1">
                                  <p className="font-medium text-white text-sm">{shop.name}</p>
                                  {shop.verified && (
                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <p className="text-gray-400 text-xs">{shop.followers} followers</p>
                              </div>
                            </div>
                            <button className="bg-white text-black text-xs font-medium px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                              Follow
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default XLayout;
