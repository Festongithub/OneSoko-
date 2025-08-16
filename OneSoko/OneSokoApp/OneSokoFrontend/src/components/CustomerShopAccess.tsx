import React from 'react';
import { useParams } from 'react-router-dom';
import { useShopSession } from '../hooks/useShopSession';

interface CustomerShopAccessProps {
  children: React.ReactNode;
}

const CustomerShopAccess: React.FC<CustomerShopAccessProps> = ({ children }) => {
  const { shopId } = useParams();
  const { isShopOwner, hasShopAccess } = useShopSession();

  // If user is a shop owner and trying to access their own shop
  // they should be redirected to the shop owner interface
  if (isShopOwner && shopId && hasShopAccess(shopId)) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏪</span>
          </div>
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
            This is Your Shop
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            You're viewing your own shop. Use the shop owner dashboard to manage your store.
          </p>
          <div className="space-y-3">
            <a
              href={`/shop-owner/dashboard`}
              className="block w-full btn-primary text-center"
            >
              Go to Shop Dashboard
            </a>
            <a
              href="/"
              className="block w-full btn-secondary text-center"
            >
              Continue as Customer
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Regular customer access - allow viewing shop
  return <>{children}</>;
};

export default CustomerShopAccess;
