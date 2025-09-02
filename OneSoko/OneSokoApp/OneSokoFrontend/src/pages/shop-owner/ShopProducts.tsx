import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import type { Product, Category } from '../../types';
import { productApi, categoryApi } from '../../services/productApi';
import { shopApi } from '../../services/shopApi';
import { useShopSession } from '../../hooks/useShopSession';
import toast from 'react-hot-toast';

const ShopProducts: React.FC = () => {
  const { userShop, isLoadingShop } = useShopSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (isLoadingShop) return;
      
      setIsLoading(true);
      
      try {
        // Fetch categories
        const categoriesData = await categoryApi.getAll();
        setCategories(categoriesData);
        
        // Get products from the user's shop
        if (userShop) {
          const shopProducts = await shopApi.getProducts(userShop.shopId);
          setProducts(shopProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load products');
        
        // Fallback to empty data if API fails
        setCategories([
          { id: 1, name: 'Electronics', description: 'Electronic devices', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: 2, name: 'Clothing', description: 'Clothing items', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: 3, name: 'Books', description: 'Books and literature', created_at: '2024-01-01', updated_at: '2024-01-01' }
        ]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userShop, isLoadingShop]);

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        // Delete product via API
        await productApi.delete(productId);
        setProducts(prev => prev.filter(p => p.productId !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(product => {
  const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (product.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = selectedCategory === '' || (product.category?.id?.toString() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = typeof a.price === 'number' ? a.price : parseFloat(String(a.price || '0'));
        bValue = typeof b.price === 'number' ? b.price : parseFloat(String(b.price || '0'));
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Manage Products</h1>
                <p className="mt-1 text-sm text-secondary-600">
                  Add, edit, and manage your shop's products
                </p>
              </div>
              <Link
                to="/shop/products/new"
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="input"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="quantity-asc">Stock Low-High</option>
              <option value="quantity-desc">Stock High-Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner w-8 h-8 mx-auto"></div>
            <p className="mt-2 text-sm text-secondary-600">Loading products...</p>
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <div key={product.productId} className="card">
                <div className="card-body">
                  {/* Product Image */}
                  <div className="w-full h-48 bg-secondary-200 rounded-lg mb-4 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-secondary-400">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary-600">
                        ${product.price}
                      </span>
                      <span className={`badge ${
                        (product.stock_quantity ?? product.quantity ?? 0) > 10 ? 'badge-success' : 
                        (product.stock_quantity ?? product.quantity ?? 0) > 0 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {(product.stock_quantity ?? product.quantity ?? 0) > 0 ? `${product.stock_quantity ?? product.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="text-xs text-secondary-500 mb-4">
                      Category: {product.category?.name ?? 'Uncategorized'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/products/${product.productId}`}
                      target="_blank"
                      className="flex-1 btn-outline-secondary text-xs py-2"
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      View
                    </Link>
                    <Link
                      to={`/shop/products/${product.productId}/edit`}
                      className="flex-1 btn-secondary text-xs py-2"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => product.id && handleDeleteProduct(product.id)}
                      className="flex-1 btn-danger text-xs py-2"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-secondary-100 rounded-full flex items-center justify-center mb-4">
              <FunnelIcon className="w-12 h-12 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {searchQuery || selectedCategory ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-secondary-600 mb-6">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first product to your shop.'
              }
            </p>
            {!searchQuery && !selectedCategory && (
              <Link
                to="/shop/products/new"
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Product
              </Link>
            )}
          </div>
        )}

        {/* Pagination would go here for large datasets */}
      </div>
    </div>
  );
};

export default ShopProducts;
