import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  PhotoIcon, 
  XMarkIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { productsAPI, adminAPI } from '../../services/api';
import { useCategories, productKeys } from '../../hooks/useProducts';
import { uploadService } from '../../services/uploadAPI';
import toast from 'react-hot-toast';
import ReviewsManager from './ReviewsManager';

const ProductForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();

  // Debug categories loading
  React.useEffect(() => {
    console.log('Categories loading state:', { categories, categoriesLoading, categoriesError });
  }, [categories, categoriesLoading, categoriesError]);

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    stock: '',
    sku: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    gst: {
      rate: '18',
      hsn: '',
      included: false
    },
    images: [],
    tags: '',
    isActive: true,
    isFeatured: false,
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [productData, setProductData] = useState(null);

  // Load product data for edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      loadProduct();
    }
  }, [mode, id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(id);
      const product = response.data.product;
      
      setProductData(product);
      setFormData({
        ...product,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        stock: product.stock.toString(),
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || { length: '', width: '', height: '' },
        gst: product.gst || { rate: '18', hsn: '', included: false },
        tags: product.tags?.join(', ') || '',
        seo: product.seo || { title: '', description: '', keywords: '' }
      });
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product data');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewsUpdate = async () => {
    if (mode === 'edit' && id) {
      // Reload product data to get updated reviews
      try {
        const response = await productsAPI.getProduct(id);
        setProductData(response.data.product);
      } catch (error) {
        console.error('Error reloading product:', error);
      }
    }
  };

  const generateSKU = (productName) => {
    const prefix = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${timestamp}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        };

        // Auto-generate SKU when product name changes (only for new products)
        if (name === 'name' && mode === 'create' && value.trim() && !prev.sku.trim()) {
          newData.sku = generateSKU(value);
        }

        return newData;
      });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const processFiles = async (files) => {
    if (files.length === 0) return;

    setImageUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        const data = await uploadService.uploadImage(file);
        return {
          url: data.url,
          alt: file.name,
          size: file.size
        };
      } catch (error) {
        console.error('Image upload error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        return null;
      }
    });

    try {
      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(img => img !== null);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validImages]
      }));

      if (validImages.length > 0) {
        toast.success(`${validImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      toast.error('Some images failed to upload');
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      );
      await processFiles(files);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };





  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (formData.images.length === 0) newErrors.images = 'At least one product image is required';
    if (!formData.gst.hsn.trim()) newErrors['gst.hsn'] = 'HSN code is required for GST';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        gst: {
          ...formData.gst,
          rate: parseFloat(formData.gst.rate)
        }
      };

      console.log('Submitting product data:', productData);

      let response;
      if (mode === 'edit') {
        console.log('Updating product with ID:', id);
        response = await adminAPI.updateProduct(id, productData);
        toast.success('Product updated successfully');
      } else {
        console.log('Creating new product');
        response = await adminAPI.createProduct(productData);
        toast.success('Product created successfully');
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries(productKeys.all);
      queryClient.invalidateQueries(productKeys.lists());
      queryClient.invalidateQueries(productKeys.featured());
      queryClient.invalidateQueries(productKeys.categories());
      if (id) {
        queryClient.invalidateQueries(productKeys.detail(id));
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && mode === 'edit') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Product SKU (auto-generated)"
              />
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                </option>
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.count || 0})
                    </option>
                  ))
                ) : (
                  // Fallback categories if API fails
                  <>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Books">Books</option>
                    <option value="Toys & Games">Toys & Games</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Viral Picks">Viral Picks</option>
                  </>
                )}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              {categoriesError && (
                <p className="text-yellow-600 text-sm mt-1">
                  ⚠️ Failed to load categories from server. Using fallback options.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brand name"
              />
            </div>
          </div>

          {/* GST Information (India-specific) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">GST Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Rate (%) *
                </label>
                <select
                  name="gst.rate"
                  value={formData.gst.rate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="0">0% (Exempt)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HSN Code *
                </label>
                <input
                  type="text"
                  name="gst.hsn"
                  value={formData.gst.hsn}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors['gst.hsn'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="HSN Code"
                />
                {errors['gst.hsn'] && <p className="text-red-500 text-sm mt-1">{errors['gst.hsn']}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="gst.included"
                  checked={formData.gst.included}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  GST included in price
                </label>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <PhotoIcon className={`mx-auto h-12 w-12 ${dragActive ? 'text-primary-500' : 'text-gray-400'}`} />
                <div className="mt-4">
                  <label htmlFor="product-images" className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {imageUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Choose Images
                      </>
                    )}
                    <input
                      id="product-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={imageUploading}
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {dragActive ? 'Drop images here' : 'Click to select multiple images or drag and drop'}
                  </p>
                </div>
              </div>

              {imageUploading && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Uploading images...
                  </div>
                </div>
              )}

              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
          </div>





          {/* Physical Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (cm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="L"
                />
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="W"
                />
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="H"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* SEO Settings */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seo.title"
                  value={formData.seo.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="SEO optimized title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  name="seo.description"
                  value={formData.seo.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="SEO meta description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  name="seo.keywords"
                  value={formData.seo.keywords}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="SEO keywords separated by commas"
                />
              </div>
            </div>
          </div>

          {/* Status Settings */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active Product
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Featured Product
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {mode === 'edit' ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>



      {/* Reviews Management - Only show in edit mode */}
      {mode === 'edit' && productData && (
        <div className="mt-8">
          <ReviewsManager
            product={productData}
            onReviewsUpdate={handleReviewsUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default ProductForm;
