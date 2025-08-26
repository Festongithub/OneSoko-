import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { Product, Category, Tag } from '../../types';
import { productApi, categoryApi, tagApi } from '../../services/productApi';
import toast from 'react-hot-toast';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    tags: [] as string[],
    image_url: '',
    variants: [] as Array<{ id?: number; name: string; value: string; price_adjustment: string; stock_quantity: string }>
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingProduct(true);
      
      try {
        // Fetch categories and tags from API
        const [categoriesData, tagsData] = await Promise.all([
          categoryApi.getAll(),
          tagApi.getAll()
        ]);
        
        setCategories(categoriesData);
        setAvailableTags(tagsData);

        // Fetch product data from API
        if (id) {
          const productData = await productApi.getById(parseInt(id));
          setProduct(productData);
          
          setFormData({
              name: productData.name ?? '',
              description: productData.description ?? '',
              price: String(productData.price ?? ''),
              stock_quantity: String(productData.stock_quantity ?? 0),
              category_id: productData.category?.id?.toString() ?? '',
              tags: (productData.tags ?? []).map(tag => tag.name),
            image_url: productData.image_url || '',
            variants: productData.variants.map(variant => ({
              id: variant.id,
              name: variant.name,
              value: variant.value,
              price_adjustment: variant.price_adjustment || '0',
              stock_quantity: variant.stock_quantity?.toString() || '0'
            }))
          });
          
          // Set initial image preview
          if (productData.image_url) {
            setImagePreview(productData.image_url);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load product data');
        
        // Fallback to mock data if API fails
        setCategories([
          { id: 1, name: 'Electronics', description: 'Electronic devices', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: 2, name: 'Clothing', description: 'Clothing items', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: 3, name: 'Books', description: 'Books and literature', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: 4, name: 'Home & Garden', description: 'Home and garden items', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: 5, name: 'Sports', description: 'Sports equipment', created_at: '2024-01-01', updated_at: '2024-01-01' }
        ]);
        
        setAvailableTags([
          { id: 1, name: 'new' },
          { id: 2, name: 'popular' },
          { id: 3, name: 'sale' },
          { id: 4, name: 'featured' },
          { id: 5, name: 'bestseller' }
        ]);
        
        // Navigate back to products list if product fetch fails
        if (id) {
          navigate('/shop/products');
        }
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    
    // Clear file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    // This is a placeholder for actual cloud storage integration
    // Replace with your preferred cloud storage service (Cloudinary, AWS S3, etc.)
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset'); // Configure in your cloud service
    
    try {
      // Example for Cloudinary
      // const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // return data.secure_url;
      
      // Mock implementation - replace with actual service
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `https://example.com/uploads/${file.name}`;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', value: '', price_adjustment: '0', stock_quantity: '0' }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.stock_quantity) {
      newErrors.stock_quantity = 'Stock quantity is required';
    } else if (parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Stock quantity cannot be negative';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      let imageUrl = formData.image_url;
      
      // Handle file upload if a new file is selected
      if (selectedFile) {
        try {
          imageUrl = await uploadImageToCloudinary(selectedFile);
        } catch (uploadError) {
          toast.error('Failed to upload image. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      // Update product using API
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock_quantity: parseInt(formData.stock_quantity),
        category: parseInt(formData.category_id), // Backend might expect 'category' instead of 'category_id'
        tag_names: formData.tags, // Send as tag names for backend processing
        image_url: imageUrl || undefined,
        variants: formData.variants.filter(v => v.name && v.value).map(v => ({
          id: v.id,
          name: v.name,
          value: v.value,
          price_adjustment: v.price_adjustment,
          stock_quantity: parseInt(v.stock_quantity) || 0
        }))
      };

      console.log('Updating product:', productData);
      
      // Update product via API
      await productApi.update(parseInt(id!), productData as any);
      
      toast.success('Product updated successfully!');
      navigate('/shop/products');
      
    } catch (error: any) {
      console.error('Product update error:', error);
      toast.error('Failed to update product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto"></div>
          <p className="mt-2 text-sm text-secondary-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900">Product not found</h2>
          <Link to="/shop/products" className="mt-4 btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <Link
                to="/shop/products"
                className="mr-4 p-2 text-secondary-600 hover:text-secondary-900"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Edit Product</h1>
                <p className="mt-1 text-sm text-secondary-600">
                  Update your product information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-secondary-900">Basic Information</h3>
            </div>
            <div className="card-body space-y-6">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="label">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'input-error' : 'input'}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="label">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className={errors.description ? 'input-error' : 'input'}
                  placeholder="Describe your product in detail"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="label">
                    Price ($) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className={errors.price ? 'input-error' : 'input'}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="stock_quantity" className="label">
                    Stock Quantity *
                  </label>
                  <input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    min="0"
                    required
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className={errors.stock_quantity ? 'input-error' : 'input'}
                    placeholder="0"
                  />
                  {errors.stock_quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="label">
                  Category *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className={errors.category_id ? 'input-error' : 'input'}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-secondary-900">Product Images</h3>
            </div>
            <div className="card-body space-y-6">
              {/* File Upload */}
              <div>
                <label htmlFor="image-upload" className="label">
                  Upload Product Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 border-dashed rounded-md hover:border-primary-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <PhotoIcon className="mx-auto h-12 w-12 text-secondary-400" />
                    )}
                    <div className="flex text-sm text-secondary-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>{imagePreview ? 'Change image' : 'Upload a file'}</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-secondary-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>

              {/* URL Input (Alternative) */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-secondary-500">Or provide image URL</span>
                </div>
              </div>

              <div>
                <label htmlFor="image_url" className="label">
                  Image URL (Optional)
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value) {
                      setImagePreview(e.target.value);
                      setSelectedFile(null);
                    }
                  }}
                  className="input"
                  placeholder="https://example.com/image.jpg"
                  disabled={!!selectedFile}
                />
                <p className="mt-1 text-sm text-secondary-600">
                  {selectedFile 
                    ? 'File upload takes priority over URL input'
                    : 'Enter a direct link to your product image, or upload a file above'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-secondary-900">Tags (Optional)</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="input flex-1"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="badge badge-primary flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-sm text-secondary-600 mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => !formData.tags.includes(tag.name))
                      .map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tags: [...prev.tags, tag.name] }))}
                          className="badge badge-secondary hover:badge-primary transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-secondary-900">Product Variants (Optional)</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="btn-secondary btn-sm"
                >
                  Add Variant
                </button>
              </div>
            </div>
            <div className="card-body">
              {formData.variants.length > 0 ? (
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-secondary-900">
                          Variant {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="label">Variant Name</label>
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            className="input"
                            placeholder="Size, Color, etc."
                          />
                        </div>
                        <div>
                          <label className="label">Value</label>
                          <input
                            type="text"
                            value={variant.value}
                            onChange={(e) => updateVariant(index, 'value', e.target.value)}
                            className="input"
                            placeholder="Large, Red, etc."
                          />
                        </div>
                        <div>
                          <label className="label">Price Adjustment ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price_adjustment}
                            onChange={(e) => updateVariant(index, 'price_adjustment', e.target.value)}
                            className="input"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="label">Stock</label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stock_quantity}
                            onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                            className="input"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary-600">
                  Add variants if your product comes in different sizes, colors, or other variations.
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              to="/shop/products"
              className="btn-outline-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? 'Updating Product...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
