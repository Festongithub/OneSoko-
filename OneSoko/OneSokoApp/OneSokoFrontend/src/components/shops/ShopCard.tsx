import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  StarIcon, 
  ShoppingBagIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { Shop } from '../../types';

interface ShopCardProps {
  shop: Shop;
  variant?: 'grid' | 'list' | 'compact';
  showActions?: boolean;
}

const ShopCard: React.FC<ShopCardProps> = ({ 
  shop, 
  variant = 'grid',
  showActions = true 
}) => {
  const formatSales = (sales: number) => {
    if (sales >= 1000000) {
      return `$${(sales / 1000000).toFixed(1)}M`;
    } else if (sales >= 1000) {
      return `$${(sales / 1000).toFixed(1)}K`;
    }
    return `$${sales.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (variant === 'list') {
    return (
      <Link
        to={`/shops/${shop.slug}`}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex items-center space-x-4 group"
      >
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary-600">
                {shop.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {shop.name}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shop.status)}`}>
              {shop.status}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {shop.description}
          </p>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {shop.city}, {shop.country}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end mb-2">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm text-gray-600">4.5 (120)</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{shop.total_orders} orders</div>
            <div className="text-primary-600 font-semibold">
              {formatSales(shop.total_sales)}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/shops/${shop.slug}`}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">
                  {shop.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {shop.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {shop.city}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600">
              <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
              <span>4.5</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default grid variant
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
      <Link to={`/shops/${shop.slug}`}>
        <div className="h-48 bg-gray-200 flex items-center justify-center relative">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {shop.name.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shop.status)}`}>
              {shop.status}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-6">
        <Link to={`/shops/${shop.slug}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {shop.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {shop.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {shop.city}, {shop.country}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm text-gray-600">4.5 (120 reviews)</span>
          </div>
          <span className="text-sm text-primary-600 font-semibold">
            {shop.total_orders} orders
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>Total Sales: {formatSales(shop.total_sales)}</span>
          <span>{shop.views} views</span>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/shops/${shop.slug}`}
              className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <ShoppingBagIcon className="w-4 h-4 inline mr-1" />
              View Shop
            </Link>
            <button className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              <ChatBubbleLeftIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopCard; 