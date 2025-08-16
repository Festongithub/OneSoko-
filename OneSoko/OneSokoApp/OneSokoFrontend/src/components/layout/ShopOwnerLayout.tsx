import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ShopOwnerSidebar from './ShopOwnerSidebar';
import { useAuthStore } from '../../stores/authStore';
import { useShopSession } from '../../hooks/useShopSession';

const ShopOwnerLayout: React.FC = () => {
  const { isAuthenticated, userProfile } = useAuthStore();
  const { userShop } = useShopSession();

  // Show loading state while checking authentication
  if (!isAuthenticated || !userProfile?.is_shopowner) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading shop dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Header */}
      <Header variant="shop-owner" />
      
      <div className="flex">
        {/* Sidebar */}
        <ShopOwnerSidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {/* Shop Status Banner */}
            {!userShop && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Shop Setup Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>Your shop is not yet configured. Please complete your shop setup to start selling.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page Content */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShopOwnerLayout;
