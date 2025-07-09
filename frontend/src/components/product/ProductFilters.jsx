import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ProductFilters = ({ 
  categories, 
  filters, 
  updateFilters, 
  clearFilters, 
  showFilters, 
  setShowFilters 
}) => {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const handlePriceChange = (field, value) => {
    const newRange = { ...priceRange, [field]: value };
    setPriceRange(newRange);
  };

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      page: 1
    });
  };

  const handleCategoryChange = (category) => {
    updateFilters({
      category: filters.category === category ? '' : category,
      page: 1
    });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.brand;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Categories */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.name} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.category === category.name}
                onChange={() => handleCategoryChange(category.name)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                {category.name} ({category.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="₹0"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="₹999999"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-sm"
          >
            Apply Price Filter
          </button>
        </div>

        {/* Quick Price Filters */}
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-600">Quick filters:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Under ₹1,000', min: '', max: '1000' },
              { label: '₹1,000 - ₹5,000', min: '1000', max: '5000' },
              { label: '₹5,000 - ₹25,000', min: '5000', max: '25000' },
              { label: '₹25,000 - ₹50,000', min: '25000', max: '50000' },
              { label: 'Above ₹50,000', min: '50000', max: '' },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  setPriceRange({ min: range.min, max: range.max });
                  updateFilters({
                    minPrice: range.min,
                    maxPrice: range.max,
                    page: 1
                  });
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Brand</h4>
        <input
          type="text"
          placeholder="Search brands..."
          value={filters.brand}
          onChange={(e) => updateFilters({ brand: e.target.value, page: 1 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Customer Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilters({ minRating: rating, page: 1 })}
              className={`flex items-center w-full text-left p-2 rounded-md transition-colors ${
                filters.minRating === rating.toString()
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-700">
                  {rating} stars & up
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Availability</h4>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => updateFilters({ 
              inStock: e.target.checked ? 'true' : '', 
              page: 1 
            })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-3 text-sm text-gray-700">
            In Stock Only
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
          <FilterContent />
        </div>
      </div>

      {/* Mobile Overlay */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilters;
