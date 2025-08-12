import React from 'react';
import { 
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

interface ConversationInfoProps {
  conversation: {
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      profile?: {
        avatar?: string;
        is_shopowner?: boolean;
        is_online?: boolean;
        last_seen?: string;
        phone?: string;
        email?: string;
        location?: string;
      };
    };
    shop?: {
      shopId: string;
      name: string;
      description?: string;
      location?: string;
      category?: string;
    };
  };
  onClose: () => void;
}

const ConversationInfo: React.FC<ConversationInfoProps> = ({
  conversation,
  onClose
}) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Contact Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Profile */}
          <div className="text-center">
            {conversation.user.profile?.avatar ? (
              <img
                src={conversation.user.profile.avatar}
                alt={conversation.user.username}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-10 h-10 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {conversation.user.first_name} {conversation.user.last_name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              @{conversation.user.username}
            </p>
            
            {conversation.user.profile?.is_shopowner && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mt-2">
                <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                Shop Owner
              </span>
            )}
          </div>

          {/* Status */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                conversation.user.profile?.is_online 
                  ? 'bg-green-400' 
                  : 'bg-gray-400'
              }`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {conversation.user.profile?.is_online ? 'Online' : 'Offline'}
                </p>
                {conversation.user.profile?.last_seen && !conversation.user.profile?.is_online && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last seen {formatDate(conversation.user.profile.last_seen)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Contact Details
            </h4>
            
            {conversation.user.profile?.email && (
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {conversation.user.profile.email}
                  </p>
                </div>
              </div>
            )}
            
            {conversation.user.profile?.phone && (
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {conversation.user.profile.phone}
                  </p>
                </div>
              </div>
            )}
            
            {conversation.user.profile?.location && (
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {conversation.user.profile.location}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Shop Information */}
          {conversation.shop && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Shop Information
              </h4>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <BuildingStorefrontIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h5 className="font-medium text-blue-900 dark:text-blue-300">
                      {conversation.shop.name}
                    </h5>
                    {conversation.shop.description && (
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        {conversation.shop.description}
                      </p>
                    )}
                    {conversation.shop.category && (
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                        Category: {conversation.shop.category}
                      </p>
                    )}
                    {conversation.shop.location && (
                      <div className="flex items-center space-x-1 mt-2">
                        <MapPinIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          {conversation.shop.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Stats */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Conversation
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                User ID
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                #{conversation.user.id}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => {
                // Implement block user functionality
                alert('Block user functionality would be implemented here');
              }}
            >
              Block User
            </button>
            
            <button
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                // Implement report user functionality
                alert('Report user functionality would be implemented here');
              }}
            >
              Report User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationInfo;
