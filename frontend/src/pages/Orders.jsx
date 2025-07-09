import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

const Orders = () => {
  const { formatPrice } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock orders data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders([
        {
          _id: '1',
          orderNumber: 'VD24010001',
          status: 'Delivered',
          total: 29990,
          items: [
            {
              name: 'Sony WH-1000XM5 Headphones',
              image: '/placeholder-image.jpg',
              quantity: 1,
              price: 29990
            }
          ],
          createdAt: '2024-01-15T10:30:00Z',
          deliveredAt: '2024-01-18T14:20:00Z'
        },
        {
          _id: '2',
          orderNumber: 'VD24010002',
          status: 'Shipped',
          total: 134900,
          items: [
            {
              name: 'Apple iPhone 15 Pro',
              image: '/placeholder-image.jpg',
              quantity: 1,
              price: 134900
            }
          ],
          createdAt: '2024-01-20T09:15:00Z',
          estimatedDelivery: '2024-01-25T18:00:00Z'
        },
        {
          _id: '3',
          orderNumber: 'VD24010003',
          status: 'Processing',
          total: 8999,
          items: [
            {
              name: 'Instant Pot Duo 7-in-1',
              image: '/placeholder-image.jpg',
              quantity: 1,
              price: 8999
            }
          ],
          createdAt: '2024-01-22T16:45:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'Shipped':
      case 'Out for Delivery':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Shipped':
      case 'Out for Delivery':
        return 'text-blue-600 bg-blue-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          <div className="text-center py-16">
            <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here!
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                    {order.status === 'Delivered' && order.deliveredAt && (
                      <p>Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN')}</p>
                    )}
                    {order.status === 'Shipped' && order.estimatedDelivery && (
                      <p>Expected delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                    )}
                    {order.status === 'Processing' && (
                      <p>Your order is being processed</p>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    {order.status === 'Delivered' && (
                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        Write Review
                      </button>
                    )}
                    {order.status === 'Shipped' && (
                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        Track Order
                      </button>
                    )}
                    {(order.status === 'Processing' || order.status === 'Confirmed') && (
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Cancel Order
                      </button>
                    )}
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            Load More Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
