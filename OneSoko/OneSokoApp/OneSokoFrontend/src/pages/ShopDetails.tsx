import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  StarIcon,
  ShoppingBagIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { shopsAPI, productsAPI } from '../services/api';
import { Shop, Product } from '../types';
import ProductCard from '../components/products/ProductCard';
import MessageShopOwner from '../components/messaging/MessageShopOwner';

const ShopDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews'>('products');
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchShopDetails();
    }
  }, [slug]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const shopData = await shopsAPI.getBySlug(slug!);
      const productsData = await shopsAPI.getProducts(shopData.shopId);
      setShop(shopData);
      setProducts(productsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch shop details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested shop could not be found.'}</p>
          <Link
            to="/shops"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/shops"
              className="flex items-center text-gray-600 hover:text-primary-600"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Shops
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            {/* Shop Logo */}
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-4 md:mb-0">
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-3xl font-bold text-primary-600">
                  {shop.name.charAt(0)}
                </span>
              )}
            </div>
            
            {/* Shop Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {shop.street && `${shop.street}, `}
                {shop.city}, {shop.country}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.5 (120 reviews)</span>
                </div>
                <span>•</span>
                <span>{shop.total_orders} orders</span>
                <span>•</span>
                <span>{shop.total_sales > 0 ? `$${shop.total_sales.toLocaleString()} sales` : 'New shop'}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button 
                onClick={() => setShowMessageModal(true)}
                className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                Contact Shop Owner
              </button>
              {shop.social_link && (
                <a
                  href={shop.social_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'products', label: 'Products', count: products.length },
              { id: 'about', label: 'About', count: null },
              { id: 'reviews', label: 'Reviews', count: 120 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Products</h2>
              <p className="text-gray-600">Browse products from {shop.name}</p>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    shop={shop}
                    showShopInfo={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-600">This shop hasn't added any products yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* About Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About {shop.name}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {shop.description || 'No description available for this shop.'}
                </p>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Shop Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{shop.total_orders}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        ${shop.total_sales.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{shop.views}</div>
                      <div className="text-sm text-gray-600">Shop Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{products.length}</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  {shop.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{shop.phone}</span>
                    </div>
                  )}
                  
                  {shop.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{shop.email}</span>
                    </div>
                  )}
                  
                  {shop.social_link && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <a 
                        href={shop.social_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div className="text-gray-700">
                      {shop.street && <div>{shop.street}</div>}
                      <div>{shop.city}, {shop.country}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Shop Status</h4>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      shop.status === 'active' ? 'bg-green-400' : 
                      shop.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm text-gray-600 capitalize">{shop.status}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Member since {new Date(shop.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
            <p className="text-gray-600 mb-6">Reviews feature coming soon...</p>
            <div className="text-center py-8">
              <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No reviews yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Shop Owner Modal */}
      {shop && (
        <MessageShopOwner
          shop={shop}
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
};

export default ShopDetails; 