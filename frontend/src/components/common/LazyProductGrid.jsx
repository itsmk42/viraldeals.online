import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import ProductCard from '../product/ProductCard';
import LoadingSpinner from './LoadingSpinner';

const LazyProductGrid = ({
  products = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  viewMode = 'grid',
  className = ''
}) => {
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [batchSize] = useState(12);
  const [currentBatch, setCurrentBatch] = useState(1);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Initialize displayed products
  useEffect(() => {
    if (products.length > 0) {
      setDisplayedProducts(products.slice(0, batchSize));
      setCurrentBatch(1);
    }
  }, [products, batchSize]);

  // Load more products when scrolling
  const loadMoreProducts = useCallback(() => {
    if (products.length > displayedProducts.length) {
      const nextBatch = currentBatch + 1;
      const newProducts = products.slice(0, nextBatch * batchSize);
      setDisplayedProducts(newProducts);
      setCurrentBatch(nextBatch);
    } else if (hasMore && onLoadMore && !loading) {
      onLoadMore();
    }
  }, [products, displayedProducts.length, currentBatch, batchSize, hasMore, onLoadMore, loading]);

  // Trigger load more when in view
  useEffect(() => {
    if (inView && !loading) {
      loadMoreProducts();
    }
  }, [inView, loading, loadMoreProducts]);

  const gridClasses = viewMode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'space-y-4';

  return (
    <div className={className}>
      {/* Product Grid */}
      <div className={gridClasses}>
        {displayedProducts.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            viewMode={viewMode}
            priority={index < 4} // Prioritize first 4 images
            lazy={index >= 4} // Lazy load after first 4
          />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Load more trigger */}
      {(displayedProducts.length < products.length || hasMore) && !loading && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="text-gray-500">Loading more products...</div>
        </div>
      )}

      {/* No more products message */}
      {!hasMore && displayedProducts.length > 0 && displayedProducts.length >= products.length && (
        <div className="text-center py-8 text-gray-500">
          <p>You've seen all products</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && displayedProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// Skeleton loader for products
export const ProductGridSkeleton = ({ count = 12, viewMode = 'grid' }) => {
  const gridClasses = viewMode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'space-y-4';

  return (
    <div className={gridClasses}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Image skeleton */}
          <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            
            {/* Price */}
            <div className="flex items-center space-x-2">
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse ml-2"></div>
            </div>
            
            {/* Button */}
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LazyProductGrid;
