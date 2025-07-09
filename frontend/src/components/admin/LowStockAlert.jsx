import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  AdjustmentsHorizontalIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { ProductImage } from '../common/OptimizedImage';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const LowStockAlert = ({ threshold = 10, showAsWidget = false }) => {
  const queryClient = useQueryClient();
  const [customThreshold, setCustomThreshold] = useState(threshold);
  const [editingStock, setEditingStock] = useState({});
  const [bulkUpdates, setBulkUpdates] = useState({});

  const { 
    data: lowStockData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['low-stock-products', customThreshold],
    queryFn: () => adminAPI.getLowStockProducts(customThreshold),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const products = lowStockData?.products || [];
  const alertCount = products.length;

  const handleThresholdChange = (newThreshold) => {
    setCustomThreshold(newThreshold);
  };

  const handleStockEdit = (productId, currentStock) => {
    setEditingStock({
      ...editingStock,
      [productId]: currentStock
    });
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const updates = [{ productId, stock: parseInt(newStock) }];
      await adminAPI.bulkUpdateStock(updates);
      
      toast.success('Stock updated successfully');
      
      // Remove from editing state
      const newEditingStock = { ...editingStock };
      delete newEditingStock[productId];
      setEditingStock(newEditingStock);
      
      // Refetch data
      refetch();
      queryClient.invalidateQueries(['products']);
    } catch (error) {
      console.error('Stock update error:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleCancelEdit = (productId) => {
    const newEditingStock = { ...editingStock };
    delete newEditingStock[productId];
    setEditingStock(newEditingStock);
  };

  const handleBulkStockChange = (productId, change) => {
    setBulkUpdates({
      ...bulkUpdates,
      [productId]: (bulkUpdates[productId] || 0) + change
    });
  };

  const applyBulkUpdates = async () => {
    const updates = Object.entries(bulkUpdates)
      .filter(([_, change]) => change !== 0)
      .map(([productId, change]) => {
        const product = products.find(p => p._id === productId);
        return {
          productId,
          stock: Math.max(0, product.stock + change)
        };
      });

    if (updates.length === 0) {
      toast.error('No changes to apply');
      return;
    }

    try {
      await adminAPI.bulkUpdateStock(updates);
      toast.success(`Updated stock for ${updates.length} products`);
      setBulkUpdates({});
      refetch();
      queryClient.invalidateQueries(['products']);
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update stock');
    }
  };

  const getStockLevel = (stock) => {
    if (stock === 0) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= 5) return { level: 'very-low', color: 'text-red-500', bg: 'bg-red-50' };
    if (stock <= customThreshold) return { level: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'normal', color: 'text-green-600', bg: 'bg-green-100' };
  };

  if (showAsWidget) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          {alertCount > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {alertCount} items
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : alertCount > 0 ? (
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => {
              const stockLevel = getStockLevel(product.stock);
              return (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ProductImage
                      product={product}
                      className="w-10 h-10 rounded-lg object-cover"
                      width={40}
                      height={40}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${stockLevel.color}`}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              );
            })}
            {alertCount > 5 && (
              <p className="text-sm text-gray-500 text-center">
                +{alertCount - 5} more items need attention
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">All products are well stocked!</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
            Low Stock Management
          </h1>
          <p className="text-gray-600">Monitor and manage products with low inventory</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
            <label className="text-sm text-gray-700">Threshold:</label>
            <select
              value={customThreshold}
              onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={5}>5 items</option>
              <option value={10}>10 items</option>
              <option value={15}>15 items</option>
              <option value={20}>20 items</option>
              <option value={25}>25 items</option>
            </select>
          </div>
          {Object.keys(bulkUpdates).length > 0 && (
            <button
              onClick={applyBulkUpdates}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
            >
              Apply Changes ({Object.keys(bulkUpdates).length})
            </button>
          )}
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Critical (0 stock)</p>
              <p className="text-lg font-bold text-red-900">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">Very Low (1-5)</p>
              <p className="text-lg font-bold text-yellow-900">
                {products.filter(p => p.stock > 0 && p.stock <= 5).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">Low Stock</p>
              <p className="text-lg font-bold text-orange-900">
                {products.filter(p => p.stock > 5 && p.stock <= customThreshold).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Total Items</p>
              <p className="text-lg font-bold text-blue-900">{alertCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-800">Failed to load low stock products</p>
          </div>
        ) : alertCount > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quick Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Update Stock
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const stockLevel = getStockLevel(product.stock);
                  const isEditing = editingStock.hasOwnProperty(product._id);
                  const bulkChange = bulkUpdates[product._id] || 0;
                  
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ProductImage
                            product={product}
                            className="h-12 w-12 rounded-lg object-cover"
                            width={48}
                            height={48}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockLevel.bg} ${stockLevel.color}`}>
                            {product.stock + bulkChange} items
                          </span>
                          {bulkChange !== 0 && (
                            <span className={`text-xs ${bulkChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({bulkChange > 0 ? '+' : ''}{bulkChange})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleBulkStockChange(product._id, -1)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Decrease by 1"
                          >
                            <ArrowDownIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleBulkStockChange(product._id, 1)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Increase by 1"
                          >
                            <ArrowUpIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleBulkStockChange(product._id, 10)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Add 10"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={editingStock[product._id]}
                              onChange={(e) => setEditingStock({
                                ...editingStock,
                                [product._id]: e.target.value
                              })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <button
                              onClick={() => handleStockUpdate(product._id, editingStock[product._id])}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCancelEdit(product._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStockEdit(product._id, product.stock)}
                            className="flex items-center text-primary-600 hover:text-primary-900"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-green-400 mb-4">
              <CheckIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All products are well stocked!</h3>
            <p className="text-gray-500">No products below the threshold of {customThreshold} items</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlert;
