import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { shopApi } from '../services/shopApi';
import type { Shop } from '../types';

interface UseShopSessionReturn {
  userShop: Shop | null;
  isShopOwner: boolean;
  isLoadingShop: boolean;
  hasShopAccess: (shopId: string) => boolean;
  refreshShopData: () => Promise<void>;
}

export const useShopSession = (): UseShopSessionReturn => {
  const { user, userProfile, isAuthenticated } = useAuthStore();
  const [userShop, setUserShop] = useState<Shop | null>(null);
  const [isLoadingShop, setIsLoadingShop] = useState(false);

  const isShopOwner = Boolean(userProfile?.is_shopowner && isAuthenticated);

  const fetchUserShop = async () => {
    if (!isShopOwner || !user) return;
    
    try {
      setIsLoadingShop(true);
      const shops = await shopApi.getAll();
      const userOwnedShop = shops.find((shop: Shop) => 
        shop.shopowner.id === user.id || 
        shop.shopowner.username === user.username
      );
      
      setUserShop(userOwnedShop || null);
    } catch (error) {
      console.error('Error fetching user shop:', error);
      setUserShop(null);
    } finally {
      setIsLoadingShop(false);
    }
  };

  const hasShopAccess = (shopId: string): boolean => {
    if (!isShopOwner || !userShop) return false;
    return userShop.shopId === shopId;
  };

  const refreshShopData = async () => {
    await fetchUserShop();
  };

  useEffect(() => {
    if (isShopOwner) {
      fetchUserShop();
    } else {
      setUserShop(null);
    }
  }, [isShopOwner, user]);

  return {
    userShop,
    isShopOwner,
    isLoadingShop,
    hasShopAccess,
    refreshShopData,
  };
};
