import React, { useState, useEffect } from 'react';
import ShopReviews from '../components/reviews/ShopReviews';
import { useAuthStore } from '../stores/authStore';

interface Shop {
  shopId: string;
  name: string;
  description: string;
  location: string;
  shopowner: string;
}

const ReviewsTestPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userProfile, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/shops/');
      if (response.ok) {
        const data = await response.json();
        setShops(data.results || data);
        if (data.results && data.results.length > 0) {
          setSelectedShop(data.results[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Shop Reviews & Ratings System Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the comprehensive review system with ratings, customer feedback, and shop owner responses.
          </p>
        </div>

        {/* Authentication Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow">
          <h3 className="font-semibold mb-2">Authentication Status</h3>
          {isAuthenticated ? (
            <div className="text-green-600">
              ✅ Logged in as: {user?.username} 
              {userProfile?.is_shopowner ? ' (Shop Owner)' : ' (Customer)'}
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Not logged in - Please log in to write reviews or respond to them
            </div>
          )}
        </div>

        {/* Shop Selection */}
        {shops.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Select a Shop to View Reviews</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => (
                <div
                  key={shop.shopId}
                  onClick={() => setSelectedShop(shop)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedShop?.shopId === shop.shopId
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <h4 className="font-medium">{shop.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {shop.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Owner: {shop.shopowner}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Shop Reviews */}
        {selectedShop ? (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
              <h2 className="text-2xl font-bold mb-2">{selectedShop.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{selectedShop.description}</p>
              <p className="text-sm text-gray-500">📍 {selectedShop.location}</p>
            </div>
            
            <ShopReviews shopId={selectedShop.shopId} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {shops.length === 0 ? 'No shops available' : 'Select a shop to view its reviews'}
            </p>
          </div>
        )}


      </div>
    </div>
  );
};

export default ReviewsTestPage;
