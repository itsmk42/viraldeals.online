import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('checking'); // checking, success, failed
  const [orderDetails, setOrderDetails] = useState(null);

  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    if (transactionId) {
      checkPaymentStatus();
    } else {
      setPaymentStatus('failed');
    }
  }, [transactionId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await api.get(`/payments/phonepe/status/${transactionId}`);
      
      if (response.data.success) {
        const { status } = response.data.status;
        
        if (status === 'COMPLETED') {
          setPaymentStatus('success');
          setOrderDetails(response.data.order);
          toast.success('Payment completed successfully!');
        } else {
          setPaymentStatus('failed');
          toast.error('Payment was not completed');
        }
      } else {
        setPaymentStatus('failed');
        toast.error('Unable to verify payment status');
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      setPaymentStatus('failed');
      toast.error('Error checking payment status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (paymentStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paymentStatus === 'success' ? (
            <>
              {/* Success Header */}
              <div className="bg-green-50 px-6 py-8 text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h1>
                <p className="text-green-700">Your order has been confirmed and payment completed.</p>
              </div>

              {/* Order Details */}
              <div className="px-6 py-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID</span>
                        <span className="font-medium text-gray-900">{orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-medium text-gray-900">{transactionId}</span>
                      </div>
                      {orderDetails && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount Paid</span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(orderDetails.pricing?.total || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method</span>
                            <span className="font-medium text-gray-900">PhonePe</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>You will receive an order confirmation email shortly</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Your order will be processed and shipped within 1-2 business days</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Track your order status in the "My Orders" section</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Failure Header */}
              <div className="bg-red-50 px-6 py-8 text-center">
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-900 mb-2">Payment Failed</h1>
                <p className="text-red-700">Unfortunately, your payment could not be processed.</p>
              </div>

              {/* Error Details */}
              <div className="px-6 py-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">What happened?</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600">
                        Your payment was not completed successfully. This could be due to:
                      </p>
                      <ul className="mt-3 space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>Payment was cancelled</li>
                        <li>Insufficient funds</li>
                        <li>Network connectivity issues</li>
                        <li>Bank declined the transaction</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What can you do?</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Try placing the order again with the same or different payment method</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Check your bank account or card details</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Contact our support team if the issue persists</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/cart')}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
