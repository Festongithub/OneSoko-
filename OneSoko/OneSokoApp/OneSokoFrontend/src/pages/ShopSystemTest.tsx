import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface BusinessCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

interface PlatformStats {
  total_shops: number;
  verified_shops: number;
  total_categories: number;
  total_reviews: number;
  average_rating: number;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  business_type: string;
  category: {
    id: number;
    name: string;
  };
  email: string;
  phone_number: string;
  website: string;
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_verified: boolean;
  verification_status: string;
  allows_online_orders: boolean;
  delivery_available: boolean;
  pickup_available: boolean;
  is_active: boolean;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

const ShopSystemTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // State for API data
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [userShops, setUserShops] = useState<Shop[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  const [error, setError] = useState<string | null>(null);
  
  // New shop form data
  const [newShop, setNewShop] = useState({
    name: '',
    description: '',
    tagline: '',
    business_type: 'retail',
    category_id: 1,
    email: '',
    phone_number: '',
    website: '',
    street_address: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'United States',
    allows_online_orders: true,
    delivery_available: true,
    pickup_available: true
  });

  // API calls
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/categories/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        setError(null);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/shop-stats/');
      if (response.ok) {
        const data = await response.json();
        setPlatformStats(data);
        setError(null);
      } else {
        setError('Failed to fetch platform stats');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/shops/');
      if (response.ok) {
        const data = await response.json();
        setShops(data.results || data);
        setError(null);
      } else {
        setError('Failed to fetch shops');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShops = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/my-shops/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserShops(data.results || data);
        setError(null);
      } else {
        setError('Failed to fetch user shops');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const createShop = async () => {
    if (!isAuthenticated) {
      setError('Please login to create a shop');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Generate slug from name
      const slug = newShop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const response = await fetch('http://127.0.0.1:8000/api/my-shops/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newShop,
          slug
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserShops([...userShops, data]);
        setError(null);
        // Reset form
        setNewShop({
          name: '',
          description: '',
          tagline: '',
          business_type: 'retail',
          category_id: 1,
          email: '',
          phone_number: '',
          website: '',
          street_address: '',
          city: '',
          state_province: '',
          postal_code: '',
          country: 'United States',
          allows_online_orders: true,
          delivery_available: true,
          pickup_available: true
        });
        alert('Shop created successfully!');
      } else {
        const errorData = await response.json();
        setError('Failed to create shop: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      setError('Error creating shop: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchPlatformStats();
    fetchShops();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserShops();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏪 OneSoko Shop Identification System Test
          </h1>
          <p className="text-lg text-gray-600">
            Testing the comprehensive shop identification system with live API calls
          </p>
          
          {/* User Status */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>User Status:</strong> {isAuthenticated ? `Logged in as ${user?.username}` : 'Not logged in'}
              {isAuthenticated && (
                <span className="ml-4">
                  <strong>User Type:</strong> {user?.profile?.is_shopowner ? 'Shop Owner' : 'Regular User'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {['categories', 'statistics', 'shops', 'my-shops', 'create-shop'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm rounded-lg ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'categories' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Business Categories</h2>
            <button
              onClick={fetchCategories}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Categories
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-3">
                    <i className={`fas ${category.icon} text-2xl text-blue-600 mr-3`}></i>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-500">ID: {category.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Platform Statistics</h2>
            <button
              onClick={fetchPlatformStats}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Refresh Statistics
            </button>
            
            {platformStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h3 className="text-3xl font-bold text-blue-600">{platformStats.total_shops}</h3>
                  <p className="text-gray-600">Total Shops</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h3 className="text-3xl font-bold text-green-600">{platformStats.verified_shops}</h3>
                  <p className="text-gray-600">Verified Shops</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h3 className="text-3xl font-bold text-purple-600">{platformStats.total_categories}</h3>
                  <p className="text-gray-600">Categories</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h3 className="text-3xl font-bold text-orange-600">{platformStats.total_reviews}</h3>
                  <p className="text-gray-600">Total Reviews</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h3 className="text-3xl font-bold text-yellow-600">{platformStats.average_rating.toFixed(1)}</h3>
                  <p className="text-gray-600">Avg Rating</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shops' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Shops</h2>
            <button
              onClick={fetchShops}
              className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Refresh Shops
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <div key={shop.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{shop.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${shop.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {shop.verification_status}
                    </span>
                  </div>
                  
                  {shop.tagline && (
                    <p className="text-sm text-blue-600 italic mb-2">{shop.tagline}</p>
                  )}
                  
                  <p className="text-gray-600 mb-3 text-sm">{shop.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Category:</strong> {shop.category.name}</p>
                    <p><strong>Type:</strong> {shop.business_type}</p>
                    <p><strong>Location:</strong> {shop.city}, {shop.state_province}</p>
                    <p><strong>Email:</strong> {shop.email}</p>
                    
                    {shop.total_reviews > 0 && (
                      <p><strong>Rating:</strong> {shop.average_rating.toFixed(1)} ({shop.total_reviews} reviews)</p>
                    )}
                    
                    <div className="flex space-x-2 mt-3">
                      {shop.allows_online_orders && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Online Orders</span>
                      )}
                      {shop.delivery_available && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Delivery</span>
                      )}
                      {shop.pickup_available && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Pickup</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-shops' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Shops</h2>
            
            {!isAuthenticated ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-700">Please log in to view your shops</p>
              </div>
            ) : (
              <>
                <button
                  onClick={fetchUserShops}
                  className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Refresh My Shops
                </button>
                
                {userShops.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">You don't have any shops yet. Create your first shop!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userShops.map((shop) => (
                      <div key={shop.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                        <h3 className="text-lg font-semibold mb-2">{shop.name}</h3>
                        <p className="text-gray-600 mb-3">{shop.description}</p>
                        <div className="space-y-1 text-sm">
                          <p><strong>Status:</strong> {shop.verification_status}</p>
                          <p><strong>Category:</strong> {shop.category.name}</p>
                          <p><strong>Created:</strong> {new Date(shop.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'create-shop' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Create New Shop</h2>
            
            {!isAuthenticated ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-700">Please log in to create a shop</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name *</label>
                    <input
                      type="text"
                      value={newShop.name}
                      onChange={(e) => setNewShop({...newShop, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="My Awesome Shop"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={newShop.tagline}
                      onChange={(e) => setNewShop({...newShop, tagline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your one-stop shop for..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={newShop.description}
                      onChange={(e) => setNewShop({...newShop, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your shop and what you offer..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={newShop.category_id}
                      onChange={(e) => setNewShop({...newShop, category_id: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <select
                      value={newShop.business_type}
                      onChange={(e) => setNewShop({...newShop, business_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="retail">Retail</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="service">Service</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="online">Online Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newShop.email}
                      onChange={(e) => setNewShop({...newShop, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="shop@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={newShop.phone_number}
                      onChange={(e) => setNewShop({...newShop, phone_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1234567890"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={newShop.website}
                      onChange={(e) => setNewShop({...newShop, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://myshop.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={newShop.street_address}
                      onChange={(e) => setNewShop({...newShop, street_address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={newShop.city}
                      onChange={(e) => setNewShop({...newShop, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="San Francisco"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={newShop.state_province}
                      onChange={(e) => setNewShop({...newShop, state_province: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="California"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={newShop.postal_code}
                      onChange={(e) => setNewShop({...newShop, postal_code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="94105"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-700 mb-3">Shop Features</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newShop.allows_online_orders}
                          onChange={(e) => setNewShop({...newShop, allows_online_orders: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow online orders</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newShop.delivery_available}
                          onChange={(e) => setNewShop({...newShop, delivery_available: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Delivery available</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newShop.pickup_available}
                          onChange={(e) => setNewShop({...newShop, pickup_available: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Pickup available</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={createShop}
                    disabled={loading || !newShop.name || !newShop.description || !newShop.email}
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Shop...' : 'Create Shop'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopSystemTest;
