import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { productKeys } from '../../hooks/useProducts';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ProductScraper = () => {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [bulkUrls, setBulkUrls] = useState(['']);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [editableData, setEditableData] = useState(null);

  // Validate deodap.in URL
  const isValidDeodapUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('deodap.in') && urlObj.pathname.includes('/products/');
    } catch {
      return false;
    }
  };

  // Scrape single product
  const handleScrapeProduct = useCallback(async () => {
    if (!url.trim()) {
      toast.error('Please enter a product URL');
      return;
    }

    if (!isValidDeodapUrl(url)) {
      toast.error('Please enter a valid deodap.in product URL');
      return;
    }

    setIsLoading(true);
    setScrapedData(null);

    try {
      const response = await fetch('/api/scraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to scrape product');
      }

      setScrapedData(data.data);
      setEditableData({
        ...data.data,
        price: data.data.price || '',
        originalPrice: data.data.originalPrice || ''
      });
      toast.success('Product scraped successfully!');
    } catch (error) {
      console.error('Scraping error:', error);
      toast.error(error.message || 'Failed to scrape product');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  // Save scraped product to database
  const handleSaveProduct = useCallback(async () => {
    if (!editableData) return;

    // Validate required fields
    if (!editableData.price || editableData.price <= 0) {
      toast.error('Please enter a valid price before saving');
      return;
    }

    setIsLoading(true);

    try {
      // Create product directly with edited data
      const productData = {
        ...editableData,
        price: parseFloat(editableData.price),
        originalPrice: parseFloat(editableData.originalPrice) || parseFloat(editableData.price),
        // Ensure required fields are present
        brand: editableData.brand || 'Unknown Brand',
        stock: editableData.stock || 100,
        category: editableData.category || 'Other',
        images: editableData.images && editableData.images.length > 0 ? editableData.images : [
          { url: '/placeholder-image.jpg', alt: 'Product image', isPrimary: true }
        ]
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors specifically
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(data.message || 'Failed to save product');
      }

      toast.success('Product saved successfully!');

      // Invalidate product queries to refresh admin panel
      queryClient.invalidateQueries(productKeys.all);
      queryClient.invalidateQueries(productKeys.lists());
      queryClient.invalidateQueries(productKeys.featured());
      queryClient.invalidateQueries(productKeys.categories());

      setScrapedData(null);
      setEditableData(null);
      setUrl('');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  }, [editableData, queryClient]);

  // Handle bulk URL changes
  const handleBulkUrlChange = (index, value) => {
    const newUrls = [...bulkUrls];
    newUrls[index] = value;
    setBulkUrls(newUrls);
  };

  // Add new bulk URL input
  const addBulkUrl = () => {
    if (bulkUrls.length < 10) {
      setBulkUrls([...bulkUrls, '']);
    }
  };

  // Remove bulk URL input
  const removeBulkUrl = (index) => {
    if (bulkUrls.length > 1) {
      setBulkUrls(bulkUrls.filter((_, i) => i !== index));
    }
  };

  // Bulk scrape products
  const handleBulkScrape = useCallback(async () => {
    const validUrls = bulkUrls.filter(url => url.trim() && isValidDeodapUrl(url.trim()));
    
    if (validUrls.length === 0) {
      toast.error('Please enter at least one valid deodap.in product URL');
      return;
    }

    setIsLoading(true);
    setBulkResults(null);

    try {
      const response = await fetch('/api/scraper/bulk-scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ urls: validUrls })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to bulk scrape products');
      }

      setBulkResults(data);
      toast.success(`Bulk scraping completed! ${data.summary.successful} successful, ${data.summary.failed} failed.`);
    } catch (error) {
      console.error('Bulk scraping error:', error);
      toast.error(error.message || 'Failed to bulk scrape products');
    } finally {
      setIsLoading(false);
    }
  }, [bulkUrls]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
            Product Scraper - Deodap.in
          </h2>
          <p className="text-gray-600 mt-1">
            Scrape product information from deodap.in and add to your catalog
          </p>
        </div>

        <div className="p-6">
          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setBulkMode(false)}
                className={`px-4 py-2 rounded-md font-medium ${
                  !bulkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Single Product
              </button>
              <button
                onClick={() => setBulkMode(true)}
                className={`px-4 py-2 rounded-md font-medium ${
                  bulkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Bulk Scraping
              </button>
            </div>
          </div>

          {!bulkMode ? (
            /* Single Product Mode */
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL
                </label>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://deodap.in/products/..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleScrapeProduct}
                    disabled={isLoading || !url.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Scraping...' : 'Scrape'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enter a deodap.in product URL to scrape product information
                </p>
              </div>

              {/* Scraped Data Preview */}
              {scrapedData && editableData && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Scraped Product Data</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProduct}
                        disabled={isLoading || !editableData.price || editableData.price <= 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Save Product
                      </button>
                      <button
                        onClick={() => {
                          setScrapedData(null);
                          setEditableData(null);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Price Entry Notice */}
                  {editableData.needsPriceEntry && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          <strong>Price Entry Required:</strong> Please enter the product price manually before saving.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                          <input
                            type="text"
                            value={editableData.name}
                            onChange={(e) => setEditableData({...editableData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            maxLength="100"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={editableData.price}
                              onChange={(e) => setEditableData({...editableData, price: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Enter price"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                            <input
                              type="number"
                              value={editableData.originalPrice}
                              onChange={(e) => setEditableData({...editableData, originalPrice: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Enter original price"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p><span className="font-medium">Category:</span> {editableData.category}</p>
                          <p><span className="font-medium">Brand:</span> {editableData.brand || 'N/A'}</p>
                          <p><span className="font-medium">SKU:</span> {editableData.sku || 'Auto-generated'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Images ({editableData.images?.length || 0})</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {editableData.images?.slice(0, 6).map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-16 object-cover rounded border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <textarea
                        value={editableData.description}
                        onChange={(e) => setEditableData({...editableData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        rows="4"
                        maxLength="2000"
                        placeholder="Product description"
                      />
                    </div>

                    {editableData.features?.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {editableData.features.slice(0, 5).map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Bulk Mode */
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product URLs (Max 10)
                </label>
                <div className="space-y-3">
                  {bulkUrls.map((url, index) => (
                    <div key={index} className="flex space-x-3">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleBulkUrlChange(index, e.target.value)}
                        placeholder={`https://deodap.in/products/... (URL ${index + 1})`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                      {bulkUrls.length > 1 && (
                        <button
                          onClick={() => removeBulkUrl(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={addBulkUrl}
                    disabled={bulkUrls.length >= 10 || isLoading}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add URL
                  </button>
                  
                  <button
                    onClick={handleBulkScrape}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Scraping...' : 'Bulk Scrape'}
                  </button>
                </div>
              </div>

              {/* Bulk Results */}
              {bulkResults && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Scraping Results</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{bulkResults.summary.total}</div>
                      <div className="text-sm text-blue-600">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{bulkResults.summary.successful}</div>
                      <div className="text-sm text-green-600">Successful</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{bulkResults.summary.failed}</div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {bulkResults.results?.map((result, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-green-800">{result.data.name}</p>
                          <p className="text-sm text-green-600">₹{result.data.price} - {result.url}</p>
                        </div>
                      </div>
                    ))}
                    
                    {bulkResults.errors?.map((error, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-800">Failed to scrape</p>
                          <p className="text-sm text-red-600">{error.error} - {error.url}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compliance Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-800">Compliance Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This scraper respects robots.txt and implements rate limiting. Please use responsibly and in accordance with deodap.in's terms of service. 
                  Always verify scraped data before publishing products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductScraper;
