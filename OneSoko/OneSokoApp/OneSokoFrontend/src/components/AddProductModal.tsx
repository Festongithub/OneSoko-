import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { shopsAPI, categoriesAPI } from '../services/api';
import { Product, Category, Shop } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: Product) => void;
  shop: Shop | null;
}

interface AddProductFormData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  discount: number;
  promotional_price?: number;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  shop
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<AddProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      quantity: 1,
      category: '',
      discount: 0,
      promotional_price: undefined
    }
  });

  const discount = watch('discount');
  const price = watch('price');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoriesAPI.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: AddProductFormData) => {
    if (!shop) {
      alert('No shop selected');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('quantity', data.quantity.toString());
      if (data.category) {
        formData.append('category', data.category);
      }
      formData.append('discount', data.discount.toString());
      if (data.promotional_price) {
        formData.append('promotional_price', data.promotional_price.toString());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const newProduct = await shopsAPI.addProduct(shop.shopId, formData);
      onProductAdded(newProduct);
      onClose();
      reset();
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePromotionalPrice = () => {
    if (discount > 0 && price > 0) {
      return price - (price * discount / 100);
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Product name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe your product"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Discount and Promotional Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                min="0"
                max="100"
                {...register('discount', { 
                  min: { value: 0, message: 'Discount must be 0 or higher' },
                  max: { value: 100, message: 'Discount cannot exceed 100%' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.discount && (
                <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="promotional_price" className="block text-sm font-medium text-gray-700 mb-2">
                Promotional Price (USD)
              </label>
              <input
                type="number"
                id="promotional_price"
                step="0.01"
                min="0"
                {...register('promotional_price', {
                  min: { value: 0, message: 'Promotional price must be positive' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={calculatePromotionalPrice().toFixed(2)}
              />
              {discount > 0 && price > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  Suggested: ${calculatePromotionalPrice().toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-48 w-48 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal; 