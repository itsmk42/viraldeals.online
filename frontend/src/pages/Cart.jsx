import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TruckIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const {
    items,
    total,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatPrice
  } = useCart();

  const { isAuthenticated } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Calculate pricing breakdown
  const subtotal = total;
  const gstRate = 18;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const shippingCost = subtotal >= 499 ? 0 : 49;
  const finalTotal = subtotal + gstAmount + shippingCost - promoDiscount;

  const handlePromoCode = () => {
    // Simple promo code logic - in real app, this would be an API call
    const validCodes = {
      'WELCOME10': 0.1,
      'SAVE50': 50,
      'FIRST100': 100
    };

    if (validCodes[promoCode.toUpperCase()]) {
      const discount = validCodes[promoCode.toUpperCase()];
      const discountAmount = discount < 1 ? subtotal * discount : discount;
      setPromoDiscount(Math.min(discountAmount, subtotal));
    } else {
      setPromoDiscount(0);
      alert('Invalid promo code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <Link to={`/products/${item._id}`} className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item._id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                      >
                        <MinusIcon className="h-4 w-4 text-gray-600" />
                      </button>

                      <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[6rem]">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Stock Warning */}
                {item.quantity >= item.stock && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Only {item.stock} items available in stock
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handlePromoCode}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoDiscount > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    Promo code applied! You saved {formatPrice(promoDiscount)}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Try: WELCOME10, SAVE50, FIRST100
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">GST ({gstRate}%)</span>
                  <span className="font-medium">{formatPrice(gstAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <TruckIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {shippingCost === 0 ? (
                      'Free shipping on this order!'
                    ) : (
                      `Add ${formatPrice(499 - subtotal)} more for free shipping`
                    )}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              {isAuthenticated ? (
                <Link
                  to="/checkout"
                  className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login?redirect=/checkout"
                    className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Login to Checkout
                  </Link>
                  <p className="text-xs text-gray-500 text-center">
                    New customer? <Link to="/register" className="text-primary-600 hover:text-primary-700">Create an account</Link>
                  </p>
                </div>
              )}

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="block w-full mt-3 bg-gray-200 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
