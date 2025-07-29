import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const FeaturesManager = ({ product, onFeaturesUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [editFeature, setEditFeature] = useState('');

  const handleAddFeature = async () => {
    if (!newFeature.trim()) {
      toast.error('Please enter a feature description');
      return;
    }

    setLoading(true);
    try {
      const updatedFeatures = [...(product.features || []), newFeature.trim()];
      
      await adminAPI.updateProduct(product._id, {
        features: updatedFeatures
      });

      toast.success('Feature added successfully');
      setNewFeature('');
      setShowAddForm(false);
      onFeaturesUpdate();
    } catch (error) {
      console.error('Error adding feature:', error);
      toast.error(error.response?.data?.message || 'Failed to add feature');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFeature = (index) => {
    setEditingIndex(index);
    setEditFeature(product.features[index]);
  };

  const handleSaveEdit = async () => {
    if (!editFeature.trim()) {
      toast.error('Please enter a feature description');
      return;
    }

    setLoading(true);
    try {
      const updatedFeatures = [...product.features];
      updatedFeatures[editingIndex] = editFeature.trim();
      
      await adminAPI.updateProduct(product._id, {
        features: updatedFeatures
      });

      toast.success('Feature updated successfully');
      setEditingIndex(null);
      setEditFeature('');
      onFeaturesUpdate();
    } catch (error) {
      console.error('Error updating feature:', error);
      toast.error(error.response?.data?.message || 'Failed to update feature');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeature = async (index) => {
    if (!window.confirm('Are you sure you want to delete this feature?')) {
      return;
    }

    setLoading(true);
    try {
      const updatedFeatures = product.features.filter((_, i) => i !== index);
      
      await adminAPI.updateProduct(product._id, {
        features: updatedFeatures
      });

      toast.success('Feature deleted successfully');
      onFeaturesUpdate();
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error(error.response?.data?.message || 'Failed to delete feature');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditFeature('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Product Features ({product.features?.length || 0})
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          disabled={loading}
        >
          <FaPlus className="w-4 h-4" />
          <span>Add Feature</span>
        </button>
      </div>

      {/* Add Feature Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Feature</h4>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter feature description..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
            />
            <button
              onClick={handleAddFeature}
              disabled={loading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewFeature('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="space-y-3">
        {product.features && product.features.length > 0 ? (
          product.features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
              {editingIndex === index ? (
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="text"
                    value={editFeature}
                    onChange={(e) => setEditFeature(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Save changes"
                  >
                    <FaSave className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-600 hover:text-gray-800 p-1"
                    title="Cancel edit"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-gray-900">{feature}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditFeature(index)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit feature"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete feature"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No features added yet. Add the first feature!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturesManager;
