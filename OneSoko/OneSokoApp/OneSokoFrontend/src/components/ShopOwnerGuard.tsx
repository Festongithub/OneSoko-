import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { shopApi } from '../services/shopApi';
import type { Shop } from '../types';
import toast from 'react-hot-toast';

interface ShopOwnerGuardProps {
  children: React.ReactNode;
  requiresShopAccess?: boolean;
}

const ShopOwnerGuard: React.FC<ShopOwnerGuardProps> = ({ 
  children, 
  requiresShopAccess = false 
}) => {
  const { user, isAuthenticated, userProfile } = useAuthStore();
  const navigate = useNavigate();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userShop, setUserShop] = useState<Shop | null>(null);

  useEffect(() => {
    checkShopAccess();
  }, [user, isAuthenticated, params]);

  const checkShopAccess = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        toast.error('Please log in to access this page');
        navigate('/login');
        return;
      }

      // Check if user is a shop owner
      if (!userProfile?.is_shopowner) {
        toast.error('Access denied. Shop owner account required.');
        navigate('/');
        return;
      }

      // If we need to check shop-specific access
      if (requiresShopAccess) {
        try {
          // Get user's shop information
          const shops = await shopApi.getAll();
          const userOwnedShop = shops.find((shop: Shop) => 
            shop.shopowner.id === user.id || 
            shop.shopowner.username === user.username
          );

          if (!userOwnedShop) {
            toast.error('No shop found for your account. Please contact support.');
            navigate('/');
            return;
          }

          // If accessing a specific shop (e.g., /shop-owner/shop/:shopId)
          const { shopId } = params;
          if (shopId && shopId !== userOwnedShop.shopId) {
            toast.error('Access denied. You can only access your own shop.');
            navigate(`/shop-owner/shop/${userOwnedShop.shopId}`);
            return;
          }

          setUserShop(userOwnedShop);
        } catch (error) {
          console.error('Error checking shop access:', error);
          toast.error('Error verifying shop access. Please try again.');
          navigate('/');
          return;
        }
      }

      setHasAccess(true);
    } catch (error) {
      console.error('Shop access check failed:', error);
      toast.error('Access verification failed');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Navigation will handle redirect
  }

  // Pass shop data to children if needed
  return (
    <>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { userShop } as any)
          : child
      )}
    </>
  );
};

export default ShopOwnerGuard;
