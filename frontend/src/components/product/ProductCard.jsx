import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../../context/CartContext';
import { ProductImage } from '../common/OptimizedImage';

const ProductCard = ({ product, viewMode = 'grid', priority = false, lazy = true }) => {
  const { addToCart, formatPrice, isInCart, getItemQuantity } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-4 w-4 text-gray-300" />
            <StarIconSolid className="h-4 w-4 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="flex p-6">
          <Link to={`/products/${product._id}`} className="flex-shrink-0">
            <ProductImage
              product={product}
              className="w-32 h-32 object-cover rounded-lg"
              priority={priority}
              width={128}
              height={128}
            />
          </Link>
          
          <div className="flex-1 ml-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link to={`/products/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.shortDescription || product.description}
                </p>
                
                <div className="flex items-center space-x-4 mb-3">
                  {product.rating?.average > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {renderStars(product.rating.average)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({product.rating.count})
                      </span>
                    </div>
                  )}
                  
                  {product.brand && (
                    <span className="text-sm text-gray-500">
                      by {product.brand}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                        {product.discount}% off
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <HeartIcon className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? 'Out of Stock' : 
                   isInCart(product._id) ? `In Cart (${getItemQuantity(product._id)})` : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 group">
      <div className="relative">
        <Link to={`/products/${product._id}`}>
          <ProductImage
            product={product}
            className="w-full h-48 object-cover rounded-t-lg group-hover:opacity-90 transition-opacity"
            priority={priority}
            width={300}
            height={192}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <HeartIcon className="h-4 w-4" />
        </button>
        
        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">by {product.brand}</p>
        )}
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.shortDescription || product.description}
        </p>
        
        {/* Rating */}
        {product.rating?.average > 0 && (
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex">
              {renderStars(product.rating.average)}
            </div>
            <span className="text-sm text-gray-600">
              ({product.rating.count})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? 'Out of Stock' : 
           isInCart(product._id) ? `In Cart (${getItemQuantity(product._id)})` : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
