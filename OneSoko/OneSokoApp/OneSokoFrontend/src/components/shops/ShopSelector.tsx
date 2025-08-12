import React, { useState } from 'react';
import {
  BuildingStorefrontIcon,
  ChevronDownIcon,
  CheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ShopSelector: React.FC = () => {
  const { userShops, activeShop, setActiveShop, isShopOwner } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!isShopOwner || userShops.length === 0) {
    return null;
  }

  const handleShopChange = (shop: any) => {
    setActiveShop(shop);
    setIsOpen(false);
  };

  const handleCreateShop = () => {
    setIsOpen(false);
    navigate('/create-shop');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <BuildingStorefrontIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {activeShop ? activeShop.name : 'Select Shop'}
          </span>
          {userShops.length > 1 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {userShops.length} shops
            </span>
          )}
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 py-1 mb-1">
              Your Shops
            </div>
            
            {userShops.map((shop) => (
              <button
                key={shop.shopId}
                onClick={() => handleShopChange(shop)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {shop.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {shop.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {shop.location}
                    </div>
                  </div>
                </div>
                
                {activeShop?.shopId === shop.shopId && (
                  <CheckIcon className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
            
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            
            <button
              onClick={handleCreateShop}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Create New Shop
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Start a new business
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopSelector;
