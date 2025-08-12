import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { shopsAPI } from '../services/api';

const CreateShop: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    street: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    social_link: '',
    logo: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Shop name is required');
      setLoading(false);
      return;
    }

    // Check if at least one location component is provided
    const hasLocation = formData.street.trim() || formData.city.trim() || formData.country.trim();
    if (!hasLocation) {
      setError('Please provide at least one location component (street, city, or country)');
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && key !== 'logo') {
          submitData.append(key, value);
        }
      });
      
      // Add logo if present
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }
      
      // Create location string from address components
      const locationParts = [formData.street, formData.city, formData.country].filter(Boolean);
      if (locationParts.length > 0) {
        submitData.append('location', locationParts.join(', '));
      }

      // Create the shop
      const createdShop = await shopsAPI.create(submitData);
      
      // Show success message
      alert(`Shop "${createdShop.name}" created successfully! You now have shop owner privileges.`);
      
      // Redirect to shop details page
      navigate(`/shops/${createdShop.slug}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create shop');
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'Ethiopia', 'Somalia',
    'South Sudan', 'Sudan', 'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco',
    'Mauritania', 'Senegal', 'Gambia', 'Guinea-Bissau', 'Guinea', 'Sierra Leone',
    'Liberia', 'Ivory Coast', 'Ghana', 'Togo', 'Benin', 'Nigeria', 'Cameroon',
    'Central African Republic', 'Chad', 'Niger', 'Mali', 'Burkina Faso'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <BuildingStorefrontIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Shop</h1>
          <p className="text-gray-600">
            Start selling your products online. Set up your shop profile and start connecting with customers.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Shop Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your shop name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your shop and what you sell..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      {formData.logo ? (
                        <img
                          src={URL.createObjectURL(formData.logo)}
                          alt="Logo preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Choose File
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+254700000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="shop@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    name="social_link"
                    value={formData.social_link}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <MapPinIcon className="w-5 h-5 inline mr-2" />
                Address Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nairobi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="ml-3 text-sm text-gray-700">
                  I agree to the{' '}
                  <button type="button" className="text-primary-600 hover:text-primary-700 underline">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-primary-600 hover:text-primary-700 underline">
                    Privacy Policy
                  </button>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/shops')}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-8 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Shop...' : 'Create Shop'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@onesoko.com" className="text-primary-600 hover:text-primary-700">
              support@onesoko.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateShop; 