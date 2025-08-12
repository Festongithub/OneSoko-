import React, { useState, useEffect } from 'react';
import {
  BuildingStorefrontIcon,
  CogIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CreditCardIcon,
  TruckIcon,
  DocumentTextIcon,
  StarIcon,
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  BanknotesIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Shop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { shopsAPI } from '../../services/api';

interface ShopProfileManagementProps {
  shop: Shop;
  onShopUpdate?: (updatedShop: Shop) => void;
}

const ShopProfileManagement: React.FC<ShopProfileManagementProps> = ({ 
  shop: initialShop, 
  onShopUpdate 
}) => {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop>(initialShop);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'business' | 'verification' | 'settings' | 'performance'>('basic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editForm, setEditForm] = useState<Partial<Shop>>({});

  useEffect(() => {
    setShop(initialShop);
    setEditForm(initialShop);
  }, [initialShop]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...shop });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedShop = await shopsAPI.updateShop(shop.shopId, editForm);
      setShop(updatedShop);
      setIsEditing(false);
      onShopUpdate?.(updatedShop);
      setMessage({ type: 'success', text: 'Shop profile updated successfully!' });
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error updating shop:', error);
      setMessage({ type: 'error', text: 'Failed to update shop profile. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ ...shop });
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckBadgeIcon className="w-5 h-5" />;
      case 'pending': return <ClockIcon className="w-5 h-5" />;
      case 'rejected': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: BuildingStorefrontIcon },
    { id: 'business', label: 'Business Details', icon: CogIcon },
    { id: 'verification', label: 'Verification', icon: CheckBadgeIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
    { id: 'performance', label: 'Performance', icon: ChartBarIcon },
  ];

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <BuildingStorefrontIcon className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{shop.name}</h2>
            <p className="text-blue-100">{shop.business_category}</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                <span>{shop.average_rating.toFixed(1)} ({shop.total_reviews} reviews)</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(shop.verification_status)}`}>
                <div className="flex items-center space-x-1">
                  {getVerificationIcon(shop.verification_status)}
                  <span className="capitalize">{shop.verification_status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{shop.phone}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{shop.email}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="url"
                  value={editForm.website_url || ''}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <a href={shop.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  {shop.website_url || 'No website'}
                </a>
              )}
            </div>
            <div className="flex items-start space-x-3">
              <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.street || ''}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editForm.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        value={editForm.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Country"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-900 dark:text-white">
                    <div>{shop.street}</div>
                    <div>{shop.city}, {shop.country}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shop Description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
          {isEditing ? (
            <textarea
              value={editForm.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Tell customers about your shop..."
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {shop.description || 'No description provided.'}
            </p>
          )}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{shop.views.toLocaleString()}</p>
            </div>
            <EyeIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{shop.total_orders.toLocaleString()}</p>
            </div>
            <BuildingStorefrontIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${shop.total_sales.toLocaleString()}</p>
            </div>
            <BanknotesIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{shop.response_rate}%</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessDetails = () => (
    <div className="space-y-6">
      {/* Business Registration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Registration</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Type
            </label>
            {isEditing ? (
              <select
                value={editForm.business_type || ''}
                onChange={(e) => handleInputChange('business_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select business type</option>
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="corporation">Corporation</option>
                <option value="llc">LLC</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white capitalize">
                {shop.business_type?.replace('_', ' ') || 'Not specified'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Category
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.business_category || ''}
                onChange={(e) => handleInputChange('business_category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Electronics, Fashion, Food"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{shop.business_category || 'Not specified'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Registration Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.business_registration_number || ''}
                onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Business registration number"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{shop.business_registration_number || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tax ID Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.tax_identification_number || ''}
                onChange={(e) => handleInputChange('tax_identification_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Tax identification number"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{shop.tax_identification_number || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Operating Hours</h3>
        <div className="space-y-3">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day} className="flex items-center justify-between">
              <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {day}
              </span>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={editForm.operating_hours?.[day as keyof typeof editForm.operating_hours]?.open || ''}
                    onChange={(e) => handleInputChange(`operating_hours.${day}.open`, e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={editForm.operating_hours?.[day as keyof typeof editForm.operating_hours]?.close || ''}
                    onChange={(e) => handleInputChange(`operating_hours.${day}.close`, e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.operating_hours?.[day as keyof typeof editForm.operating_hours]?.closed || false}
                      onChange={(e) => handleInputChange(`operating_hours.${day}.closed`, e.target.checked)}
                      className="mr-1"
                    />
                    <span className="text-sm">Closed</span>
                  </label>
                </div>
              ) : (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {shop.operating_hours?.[day as keyof typeof shop.operating_hours]?.closed
                    ? 'Closed'
                    : shop.operating_hours?.[day as keyof typeof shop.operating_hours]?.open && shop.operating_hours?.[day as keyof typeof shop.operating_hours]?.close
                    ? `${shop.operating_hours[day as keyof typeof shop.operating_hours]?.open} - ${shop.operating_hours[day as keyof typeof shop.operating_hours]?.close}`
                    : 'Not set'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment & Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
          {isEditing ? (
            <div className="space-y-2">
              {['Cash', 'Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Mobile Money'].map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.payment_methods?.includes(method) || false}
                    onChange={(e) => {
                      const methods = editForm.payment_methods || [];
                      if (e.target.checked) {
                        handleInputChange('payment_methods', [...methods, method]);
                      } else {
                        handleInputChange('payment_methods', methods.filter(m => m !== method));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{method}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {shop.payment_methods?.map((method) => (
                <span key={method} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded text-sm">
                  {method}
                </span>
              )) || <span className="text-gray-500 dark:text-gray-400">None specified</span>}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Options</h3>
          {isEditing ? (
            <div className="space-y-2">
              {['Pickup', 'Local Delivery', 'National Shipping', 'International Shipping', 'Same Day Delivery'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.delivery_options?.includes(option) || false}
                    onChange={(e) => {
                      const options = editForm.delivery_options || [];
                      if (e.target.checked) {
                        handleInputChange('delivery_options', [...options, option]);
                      } else {
                        handleInputChange('delivery_options', options.filter(o => o !== option));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {shop.delivery_options?.map((option) => (
                <span key={option} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded text-sm">
                  {option}
                </span>
              )) || <span className="text-gray-500 dark:text-gray-400">None specified</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Shop Profile Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your shop information, business details, and verification status
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action Buttons */}
      {isEditing && (
        <div className="mb-6 flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        {activeTab === 'basic' && renderBasicInfo()}
        {activeTab === 'business' && renderBusinessDetails()}
        {activeTab === 'verification' && (
          <div className="text-center py-12">
            <CheckBadgeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Verification Center</h3>
            <p className="text-gray-600 dark:text-gray-400">Business verification features coming soon!</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Shop Settings</h3>
            <p className="text-gray-600 dark:text-gray-400">Advanced settings panel coming soon!</p>
          </div>
        )}
        {activeTab === 'performance' && (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Performance Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">Detailed analytics dashboard coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProfileManagement;
