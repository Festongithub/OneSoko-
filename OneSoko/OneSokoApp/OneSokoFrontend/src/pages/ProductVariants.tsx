import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { productVariantsAPI, productsAPI } from '../services/api';
import { ProductVariant, Product } from '../types';

interface VariantStats {
  total_variants: number;
  total_quantity: number;
  low_stock_count: number;
  out_of_stock_count: number;
  variants_by_name: Array<{ name: string; count: number }>;
}

const ProductVariants: React.FC = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // Form states
  const [variantForm, setVariantForm] = useState({
    product: '',
    name: '',
    value: '',
    price_adjustment: 0,
    quantity: 0
  });
  
  const [bulkVariantForm, setBulkVariantForm] = useState({
    product: '',
    variants: [
      { name: '', value: '', price_adjustment: 0, quantity: 0 }
    ]
  });
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Stats
  const [stats, setStats] = useState<VariantStats | null>(null);
  const [lowStockVariants, setLowStockVariants] = useState<ProductVariant[]>([]);
  const [outOfStockVariants, setOutOfStockVariants] = useState<ProductVariant[]>([]);

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productVariantsAPI.getMyProductVariants();
      setVariants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsAPI.getMyProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await productVariantsAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchLowStockVariants = useCallback(async () => {
    try {
      const data = await productVariantsAPI.getLowStock();
      setLowStockVariants(data);
    } catch (err) {
      console.error('Failed to fetch low stock variants:', err);
    }
  }, []);

  const fetchOutOfStockVariants = useCallback(async () => {
    try {
      const data = await productVariantsAPI.getOutOfStock();
      setOutOfStockVariants(data);
    } catch (err) {
      console.error('Failed to fetch out of stock variants:', err);
    }
  }, []);

  useEffect(() => {
    fetchVariants();
    fetchProducts();
    fetchStats();
    fetchLowStockVariants();
    fetchOutOfStockVariants();
  }, [fetchVariants, fetchProducts, fetchStats, fetchLowStockVariants, fetchOutOfStockVariants]);

  const handleCreateVariant = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const selectedProductObj = products.find(p => p.productId === variantForm.product);
      if (!selectedProductObj) {
        throw new Error('Selected product not found');
      }

      const newVariant = await productVariantsAPI.create({
        ...variantForm,
        product: selectedProductObj.productId
      });
      
      setVariants(prev => [...prev, newVariant]);
      setShowCreateModal(false);
      setVariantForm({
        product: '',
        name: '',
        value: '',
        price_adjustment: 0,
        quantity: 0
      });
      setSuccess('Variant created successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stats
      fetchStats();
      fetchLowStockVariants();
      fetchOutOfStockVariants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create variant');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVariant = async () => {
    if (!selectedVariant) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const updateData = {
        name: variantForm.name,
        value: variantForm.value,
        price_adjustment: variantForm.price_adjustment,
        quantity: variantForm.quantity
      };
      
      const updatedVariant = await productVariantsAPI.update(selectedVariant.id, updateData);
      
      setVariants(prev => prev.map(v => v.id === selectedVariant.id ? updatedVariant : v));
      setShowEditModal(false);
      setSelectedVariant(null);
      setVariantForm({
        product: '',
        name: '',
        value: '',
        price_adjustment: 0,
        quantity: 0
      });
      setSuccess('Variant updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stats
      fetchStats();
      fetchLowStockVariants();
      fetchOutOfStockVariants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update variant');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) return;
    
    try {
      setError(null);
      await productVariantsAPI.delete(variantId);
      setVariants(prev => prev.filter(v => v.id !== variantId));
      setSuccess('Variant deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stats
      fetchStats();
      fetchLowStockVariants();
      fetchOutOfStockVariants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete variant');
    }
  };

  const handleBulkCreate = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const selectedProductObj = products.find(p => p.productId === bulkVariantForm.product);
      if (!selectedProductObj) {
        throw new Error('Selected product not found');
      }

      const newVariants = await productVariantsAPI.bulkCreate(
        selectedProductObj.productId,
        bulkVariantForm.variants
      );
      
      setVariants(prev => [...prev, ...newVariants]);
      setShowBulkCreateModal(false);
      setBulkVariantForm({
        product: '',
        variants: [{ name: '', value: '', price_adjustment: 0, quantity: 0 }]
      });
      setSuccess(`${newVariants.length} variants created successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stats
      fetchStats();
      fetchLowStockVariants();
      fetchOutOfStockVariants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create variants');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateQuantity = async (variantId: number, quantity: number) => {
    try {
      const updatedVariant = await productVariantsAPI.updateQuantity(variantId, quantity);
      setVariants(prev => prev.map(v => v.id === variantId ? updatedVariant : v));
      setSuccess('Quantity updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stats
      fetchStats();
      fetchLowStockVariants();
      fetchOutOfStockVariants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
    }
  };

  const handleUpdatePriceAdjustment = async (variantId: number, priceAdjustment: number) => {
    try {
      const updatedVariant = await productVariantsAPI.updatePriceAdjustment(variantId, priceAdjustment);
      setVariants(prev => prev.map(v => v.id === variantId ? updatedVariant : v));
      setSuccess('Price adjustment updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update price adjustment');
    }
  };

  const openEditModal = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setVariantForm({
      product: variant.product.productId,
      name: variant.name,
      value: variant.value,
      price_adjustment: variant.price_adjustment,
      quantity: variant.quantity
    });
    setShowEditModal(true);
  };

  const addBulkVariantRow = () => {
    setBulkVariantForm(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', value: '', price_adjustment: 0, quantity: 0 }]
    }));
  };

  const removeBulkVariantRow = (index: number) => {
    setBulkVariantForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateBulkVariantRow = (index: number, field: string, value: any) => {
    setBulkVariantForm(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  // Filter variants based on search and filters
  const filteredVariants = variants.filter(variant => {
    const matchesSearch = variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variant.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variant.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = !selectedProduct || variant.product.productId === selectedProduct;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = variant.quantity <= 5 && variant.quantity > 0;
    } else if (stockFilter === 'out') {
      matchesStock = variant.quantity === 0;
    }
    
    return matchesSearch && matchesProduct && matchesStock;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Product Variants Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage product variants, stock levels, and pricing adjustments
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <XMarkIcon className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <CubeIcon className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Variants</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_variants}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <ArchiveBoxIcon className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quantity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_quantity}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.low_stock_count}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <XMarkIcon className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.out_of_stock_count}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search variants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {products.map(product => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </select>
              
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Variant
              </button>
              
              <button
                onClick={() => setShowBulkCreateModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Bulk Create
              </button>
            </div>
          </div>
        </div>

        {/* Variants Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price Adjustment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {variant.product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{variant.name}:</span> {variant.value}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${variant.price_adjustment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {variant.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${variant.total_price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {variant.quantity === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Out of Stock
                        </span>
                      ) : variant.quantity <= 5 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(variant)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredVariants.length === 0 && (
            <div className="text-center py-8">
              <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No variants found</p>
            </div>
          )}
        </div>

        {/* Create Variant Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Variant
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product
                  </label>
                  <select
                    value={variantForm.product}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, product: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.productId} value={product.productId}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={variantForm.name}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Size, Color"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variant Value
                  </label>
                  <input
                    type="text"
                    value={variantForm.value}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="e.g., Large, Red"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price Adjustment
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variantForm.price_adjustment}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variantForm.quantity}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVariant}
                  disabled={saving || !variantForm.product || !variantForm.name || !variantForm.value}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Variant'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Variant Modal */}
        {showEditModal && selectedVariant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit Variant
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product
                  </label>
                  <input
                    type="text"
                    value={products.find(p => p.productId === variantForm.product)?.name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={variantForm.name}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variant Value
                  </label>
                  <input
                    type="text"
                    value={variantForm.value}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price Adjustment
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variantForm.price_adjustment}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variantForm.quantity}
                    onChange={(e) => setVariantForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVariant}
                  disabled={saving || !variantForm.name || !variantForm.value}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Variant'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Create Modal */}
        {showBulkCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bulk Create Variants
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product
                  </label>
                  <select
                    value={bulkVariantForm.product}
                    onChange={(e) => setBulkVariantForm(prev => ({ ...prev, product: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.productId} value={product.productId}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Variants</h3>
                    <button
                      onClick={addBulkVariantRow}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Row
                    </button>
                  </div>
                  
                  {bulkVariantForm.variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-5 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateBulkVariantRow(index, 'name', e.target.value)}
                          placeholder="e.g., Size"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Value
                        </label>
                        <input
                          type="text"
                          value={variant.value}
                          onChange={(e) => updateBulkVariantRow(index, 'value', e.target.value)}
                          placeholder="e.g., Large"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price Adj.
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price_adjustment}
                          onChange={(e) => updateBulkVariantRow(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.quantity}
                          onChange={(e) => updateBulkVariantRow(index, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => removeBulkVariantRow(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBulkCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkCreate}
                  disabled={saving || !bulkVariantForm.product || bulkVariantForm.variants.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Variants'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariants; 