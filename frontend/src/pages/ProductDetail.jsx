import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  StarIcon,
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ImageGallery } from '../components/common/OptimizedImage';
import { useProduct, useProductReviews, useAddReview } from '../hooks/useProducts';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart, formatPrice, isInCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  // Use React Query hooks
  const {
    data: product,
    isLoading: productLoading,
    error: productError
  } = useProduct(id);

  const {
    data: reviewsData,
    isLoading: reviewsLoading
  } = useProductReviews(id, {}, { enabled: activeTab === 'reviews' && !!id });

  const addReviewMutation = useAddReview();

  const reviews = reviewsData?.reviews || [];
  const loading = productLoading;

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }
    addToCart(product, quantity);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-5 w-5 text-gray-300" />
            <StarIconSolid className="h-5 w-5 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-5 w-5 text-gray-300" />
        );
      }
    }

    return stars;
  };

  const calculateGST = (price, rate = 18) => {
    return Math.round((price * rate) / 100);
  };

  if (loading) {
    return <LoadingSpinner text="Loading product..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary-600">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="relative">
            <ImageGallery
              images={product.images || []}
              alt={product.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            />

            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded z-10">
                {product.discount}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.brand && (
                <p className="text-lg text-gray-600">by {product.brand}</p>
              )}
            </div>

            {/* Rating */}
            {product.rating?.average > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(product.rating.average)}
                </div>
                <span className="text-lg font-medium text-gray-900">
                  {product.rating.average}
                </span>
                <span className="text-gray-600">
                  ({product.rating.count} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-lg text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                      {product.discount}% off
                    </span>
                  </>
                )}
              </div>

              {/* GST Info */}
              <div className="text-sm text-gray-600">
                <p>Price inclusive of all taxes</p>
                <p>GST: {formatPrice(calculateGST(product.price, product.gst?.rate || 18))} ({product.gst?.rate || 18}%)</p>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {product.stock === 0 ? 'Out of Stock' :
                 isInCart(product._id) ? `In Cart (${getItemQuantity(product._id)})` : 'Add to Cart'}
              </button>

              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <HeartIcon className="h-6 w-6 text-gray-600" />
              </button>

              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ShareIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">Free delivery on orders above ₹499</span>
              </div>
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">7-day return policy</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">1-year warranty included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: `Reviews (${product.rating?.count || 0})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                {product.features && product.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="text-gray-700">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Specification
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {product.specifications.map((spec, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {spec.key || spec.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No specifications available for this product.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="font-medium text-gray-900">
                            {review.reviewerName || review.user?.name || 'Anonymous'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                    {isAuthenticated && (
                      <button className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                        Write a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
