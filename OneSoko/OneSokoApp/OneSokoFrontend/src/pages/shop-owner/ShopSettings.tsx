import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import type { Shop } from '../../types';

const ShopSettings: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { user, accessToken } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    social_link: ''
  });

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/shops/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Find the current user's shop
        const userShop = data.results?.find((s: Shop) => s.shopowner.id === user?.id);
        
        if (userShop) {
          setShop(userShop);
          setFormData({
            name: userShop.name || '',
            description: userShop.description || '',
            location: userShop.location || '',
            phone: userShop.phone || '',
            email: userShop.email || '',
            social_link: userShop.social_link || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      toast.error('Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shop) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`http://127.0.0.1:8000/api/shops/${shop.shopId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedShop = await response.json();
        setShop(updatedShop);
        toast.success('Logo uploaded successfully!');
      } else {
        toast.error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    setSaving(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/shops/${shop.shopId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedShop = await response.json();
        setShop(updatedShop);
        toast.success('Shop settings updated successfully!');
      } else {
        toast.error('Failed to update shop settings');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      toast.error('Failed to update shop settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading shop settings...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-secondary-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <BuildingStorefrontIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">No Shop Found</h2>
          <p className="text-secondary-600">You don't have a shop registered yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h1 className="text-2xl font-bold text-secondary-900">Shop Settings</h1>
            <p className="text-secondary-600 mt-1">Manage your shop information and branding</p>
          </div>

          <div className="p-6">
            {/* Logo Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Shop Logo</h3>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-secondary-200 rounded-lg overflow-hidden flex items-center justify-center">
                  {shop.logo_url ? (
                    <img
                      src={shop.logo_url}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BuildingStorefrontIcon className="w-12 h-12 text-secondary-400" />
                  )}
                </div>
                <div>
                  <label className="block">
                    <span className="sr-only">Choose logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="block w-full text-sm text-secondary-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </label>
                  <p className="text-sm text-secondary-500 mt-1">
                    {uploadingLogo ? 'Uploading...' : 'PNG, JPG up to 5MB'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shop Information Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                  Shop Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell customers about your shop..."
                />
              </div>

              <div>
                <label htmlFor="social_link" className="block text-sm font-medium text-secondary-700 mb-2">
                  Social Media Link
                </label>
                <input
                  type="url"
                  id="social_link"
                  name="social_link"
                  value={formData.social_link}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourshop"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
