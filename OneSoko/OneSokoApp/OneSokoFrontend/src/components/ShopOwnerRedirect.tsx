import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopSession } from '../hooks/useShopSession';
import toast from 'react-hot-toast';

const ShopOwnerRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { userShop, isShopOwner, isLoadingShop } = useShopSession();

  useEffect(() => {
    if (!isLoadingShop) {
      if (!isShopOwner) {
        toast.error('Access denied. Shop owner account required.');
        navigate('/');
        return;
      }

      if (userShop) {
        // Redirect to shop owner dashboard
        navigate(`/shop-owner/dashboard`);
      } else {
        toast.error('No shop found for your account. Please contact support.');
        navigate('/');
      }
    }
  }, [isLoadingShop, isShopOwner, userShop, navigate]);

  if (isLoadingShop) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">Loading your shop...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default ShopOwnerRedirect;
