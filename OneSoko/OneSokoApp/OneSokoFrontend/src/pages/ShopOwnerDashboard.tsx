import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  PhotoIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CogIcon,
  CheckBadgeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Shop, Product } from '../types';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import ShopOrderManagement from '../components/ShopOrderManagement';
import ShopProfileManagement from '../components/shops/ShopProfileManagement';
import BusinessVerification from '../components/shops/BusinessVerification';
import { shopsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { createMockShop } from '../utils/mockData';

const ShopOwnerDashboard: React.FC = () => {
  const { activeShop, userShops, user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'settings' | 'profile' | 'verification'>('overview');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);

  // Use active shop from context
  useEffect(() => {
    if (activeShop) {
      setSelectedShop(activeShop);
    } else if (userShops.length > 0) {
      setSelectedShop(userShops[0]);
    }
    setShops(userShops);
  }, [activeShop, userShops]);

  const loadUserShops = async () => {
    setShopsLoading(true);
    try {
      const userShops = await shopsAPI.getMyShops();
      setShops(userShops);
      
      // Auto-select the first shop if available
      if (userShops.length > 0) {
        setSelectedShop(userShops[0]);
      }
    } catch (error) {
      console.error('Error loading user shops:', error);
      // For demo purposes, add some mock shops if API fails
      const mockShops: Shop[] = [
        createMockShop({
          shopId: "1",
          name: "My Awesome Shop",
          description: "A fantastic shop with amazing products",
          shopowner: {
            id: 1,
            username: "shopowner",
            email: "shop@example.com",
            first_name: "Shop",
            last_name: "Owner",
            date_joined: "2024-01-01T00:00:00Z"
          }
        })
      ];
      setShops(mockShops);
      setSelectedShop(mockShops[0]);
    } finally {
      setShopsLoading(false);
      setLoading(false);
    }
  };

  // Load user's shops
  useEffect(() => {
    loadUserShops();
  }, []);

  const loadProducts = useCallback(async () => {
    if (!selectedShop) return;
    
    setProductsLoading(true);
    try {
      const shopProducts = await shopsAPI.getProducts(selectedShop.shopId);
      setProducts(shopProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      // For demo purposes, add some mock products if API fails
      setProducts([
        {
          productId: "1",
          name: "Sample Product 1",
          description: "This is a sample product description for demonstration purposes.",
          price: 29.99,
          quantity: 50,
          image: null,
          category: null,
          tags: [],
          discount: 10,
          promotional_price: 26.99,
          is_active: true,
          shops: []
        },
        {
          productId: "2",
          name: "Sample Product 2",
          description: "Another sample product for testing the dashboard functionality.",
          price: 49.99,
          quantity: 25,
          image: null,
          category: null,
          tags: [],
          discount: 0,
          promotional_price: null,
          is_active: true,
          shops: []
        }
      ]);
    } finally {
      setProductsLoading(false);
    }
  }, [selectedShop]);

  // Load products when a shop is selected
  useEffect(() => {
    if (selectedShop) {
      loadProducts();
    }
  }, [selectedShop, loadProducts]);

  const handleAddProduct = () => {
    setIsAddProductModalOpen(true);
  };

  const handleProductAdded = (newProduct: Product) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
    // Refresh products from API to ensure we have the latest data
    loadProducts();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.productId === updatedProduct.productId ? updatedProduct : p)
    );
    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!selectedShop || !window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeletingProduct(productId);
    try {
      await shopsAPI.deleteProduct(selectedShop.shopId, productId);
      setProducts(prevProducts => prevProducts.filter(p => p.productId !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingProduct(null);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    if (!selectedShop) return;

    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price.toString());
      formData.append('quantity', product.quantity.toString());
      if (product.category) {
        formData.append('category', product.category.id.toString());
      }
      formData.append('discount', product.discount.toString());
      if (product.promotional_price) {
        formData.append('promotional_price', product.promotional_price.toString());
      }
      formData.append('is_active', (!product.is_active).toString());

      const updatedProduct = await shopsAPI.updateProduct(selectedShop.shopId, product.productId, formData);
      setProducts(prevProducts => 
        prevProducts.map(p => p.productId === product.productId ? updatedProduct : p)
      );
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update product status. Please try again.');
    }
  };

  const stats = [
    {
      title: 'Total Sales',
      value: `$${selectedShop?.total_sales.toLocaleString() || '0'}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: CogIcon
    },
    {
      title: 'Total Orders',
      value: (selectedShop?.total_orders ?? 0).toString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingBagIcon
    },
    {
      title: 'Shop Views',
      value: (selectedShop?.views ?? 0).toString(),
      change: '+15.3%',
      changeType: 'positive',
      icon: ChartBarIcon
    },
    {
      title: 'Average Rating',
      value: '4.5',
      change: '+0.2',
      changeType: 'positive',
      icon: CogIcon
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingStorefrontIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shops Found</h2>
          <p className="text-gray-600 mb-6">You don't have any shops yet. Create your first shop to get started.</p>
          <button
            onClick={() => window.location.href = '/create-shop'}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your shop, products, and orders</p>
              </div>
              
              {/* Shop Selector */}
              {shops.length > 1 && (
                <div className="ml-6">
                  <label htmlFor="shop-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Shop
                  </label>
                  <select
                    id="shop-select"
                    value={selectedShop?.shopId || ''}
                    onChange={(e) => {
                      const shop = shops.find(s => s.shopId === e.target.value);
                      setSelectedShop(shop || null);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {shops.map((shop) => (
                      <option key={shop.shopId} value={shop.shopId}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleAddProduct}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2 inline" />
                Add Product
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <CogIcon className="w-4 h-4 mr-2 inline" />
                Settings
              </button>
            </div>
          </div>
          
          {/* Selected Shop Info */}
          {selectedShop && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                {selectedShop.logo ? (
                  <img
                    src={selectedShop.logo}
                    alt={selectedShop.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-6 h-6 text-primary-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedShop.name}</h3>
                  <p className="text-sm text-gray-600">{selectedShop.location}</p>
                  <p className="text-xs text-gray-500">Status: {selectedShop.status}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'products', label: 'Products', icon: ShoppingBagIcon },
              { id: 'orders', label: 'Orders', icon: CogIcon },
              { id: 'profile', label: 'Shop Profile', icon: UserIcon },
              { id: 'verification', label: 'Verification', icon: CheckBadgeIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
              { id: 'settings', label: 'Settings', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <stat.icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #{1000 + i}</p>
                        <p className="text-sm text-gray-600">Customer Name</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">$150</p>
                        <p className="text-sm text-green-600">Completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">P{i}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Product {i}</p>
                        <p className="text-sm text-gray-600">{20 + i * 5} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${50 + i * 10}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                <button 
                  onClick={handleAddProduct}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2 inline" />
                  Add Product
                </button>
              </div>
            </div>
            <div className="p-6">
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">Loading products...</h3>
                  <p className="mt-1 text-sm text-gray-500">Please wait while we fetch your products</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first product.</p>
                  <div className="mt-6">
                    <button
                      onClick={handleAddProduct}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Product
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product.productId} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                          <PhotoIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        
                        {/* Price and Discount */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {product.promotional_price && product.promotional_price < product.price ? (
                              <>
                                <span className="text-lg font-bold text-primary-600">
                                  ${product.promotional_price.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.price.toFixed(2)}
                                </span>
                                {product.discount > 0 && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                    -{product.discount}%
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Quantity and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Qty: {product.quantity}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.is_active 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.productId)}
                              disabled={deletingProduct === product.productId}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Product"
                            >
                              {deletingProduct === product.productId ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <TrashIcon className="w-4 h-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => toggleProductStatus(product)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title={product.is_active ? 'Deactivate Product' : 'Activate Product'}
                            >
                              {product.is_active ? (
                                <XMarkIcon className="w-4 h-4" />
                              ) : (
                                <CheckIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            </div>
            <div className="p-6">
              <ShopOrderManagement shopId={selectedShop?.shopId || ''} />
            </div>
          </div>
        )}

        {activeTab === 'profile' && selectedShop && (
          <ShopProfileManagement
            shop={selectedShop}
            onShopUpdate={(updatedShop) => {
              setSelectedShop(updatedShop);
              // Update the shop in the shops list
              setShops(shops.map(shop => 
                shop.shopId === updatedShop.shopId ? updatedShop : shop
              ));
            }}
          />
        )}

        {activeTab === 'verification' && selectedShop && (
          <BusinessVerification
            shop={selectedShop}
            onVerificationUpdate={(updatedShop) => {
              setSelectedShop(updatedShop);
              // Update the shop in the shops list
              setShops(shops.map(shop => 
                shop.shopId === updatedShop.shopId ? updatedShop : shop
              ));
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Shop Settings</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Settings management coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
        shop={selectedShop}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        onProductUpdated={handleProductUpdated}
        shop={selectedShop}
      />
    </div>
  );
};

export default ShopOwnerDashboard; 