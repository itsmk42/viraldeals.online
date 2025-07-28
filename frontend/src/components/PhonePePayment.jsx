import React, { useState } from 'react';
import { CreditCardIcon, DevicePhoneMobileIcon, WalletIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const PhonePePayment = ({ orderId, amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed

  const handlePhonePePayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus('processing');

      console.log('Initiating PhonePe payment for order:', orderId);

      // Create PhonePe payment
      const response = await api.post('/payments/phonepe', {
        orderId: orderId
      });

      if (response.data.success) {
        const { paymentUrl, merchantTransactionId } = response.data.payment;
        
        console.log('PhonePe payment created:', merchantTransactionId);
        
        // Open PhonePe payment page in new window
        const paymentWindow = window.open(
          paymentUrl,
          'phonepe_payment',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        // Poll for payment status
        const pollPaymentStatus = async () => {
          try {
            const statusResponse = await api.get(`/payments/phonepe/status/${merchantTransactionId}`);
            
            if (statusResponse.data.success) {
              const { status } = statusResponse.data.status;
              
              if (status === 'COMPLETED') {
                setPaymentStatus('success');
                paymentWindow?.close();
                toast.success('Payment completed successfully!');
                onSuccess && onSuccess(statusResponse.data);
                return;
              } else if (status === 'FAILED') {
                setPaymentStatus('failed');
                paymentWindow?.close();
                toast.error('Payment failed. Please try again.');
                onError && onError('Payment failed');
                return;
              }
            }
            
            // Continue polling if payment is still pending
            if (!paymentWindow?.closed) {
              setTimeout(pollPaymentStatus, 3000);
            } else {
              // Window was closed, check final status
              setTimeout(async () => {
                try {
                  const finalStatus = await api.get(`/payments/phonepe/status/${merchantTransactionId}`);
                  if (finalStatus.data.status.status === 'COMPLETED') {
                    setPaymentStatus('success');
                    toast.success('Payment completed successfully!');
                    onSuccess && onSuccess(finalStatus.data);
                  } else {
                    setPaymentStatus('failed');
                    toast.error('Payment was not completed. Please try again.');
                    onError && onError('Payment incomplete');
                  }
                } catch (error) {
                  console.error('Final status check error:', error);
                  setPaymentStatus('failed');
                  onError && onError('Payment status unknown');
                }
              }, 2000);
            }
          } catch (error) {
            console.error('Payment status polling error:', error);
            if (!paymentWindow?.closed) {
              setTimeout(pollPaymentStatus, 3000);
            }
          }
        };

        // Start polling after a short delay
        setTimeout(pollPaymentStatus, 5000);

      } else {
        throw new Error(response.data.message || 'Failed to create payment');
      }

    } catch (error) {
      console.error('PhonePe payment error:', error);
      setPaymentStatus('failed');
      toast.error(error.response?.data?.message || 'Payment initiation failed');
      onError && onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">PhonePe Payment</h3>
          <p className="text-sm text-gray-600">Secure payment with PhonePe</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount to Pay</span>
            <span className="text-lg font-semibold text-gray-900">{formatPrice(amount)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Secure payment powered by PhonePe
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
            <DevicePhoneMobileIcon className="w-6 h-6 text-blue-600 mb-1" />
            <span className="text-xs text-blue-600 font-medium">UPI</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
            <CreditCardIcon className="w-6 h-6 text-green-600 mb-1" />
            <span className="text-xs text-green-600 font-medium">Cards</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
            <WalletIcon className="w-6 h-6 text-purple-600 mb-1" />
            <span className="text-xs text-purple-600 font-medium">Wallets</span>
          </div>
        </div>

        {paymentStatus === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-sm font-medium text-blue-800">Payment in Progress</p>
                <p className="text-xs text-blue-600">Please complete the payment in the PhonePe window</p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Payment Successful</p>
                <p className="text-xs text-green-600">Your order has been confirmed</p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Payment Failed</p>
                <p className="text-xs text-red-600">Please try again or use a different payment method</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handlePhonePePayment}
          disabled={loading || paymentStatus === 'processing' || paymentStatus === 'success'}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Initiating Payment...</span>
            </>
          ) : paymentStatus === 'processing' ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Payment in Progress...</span>
            </>
          ) : paymentStatus === 'success' ? (
            <span>Payment Completed ✓</span>
          ) : (
            <>
              <span>Pay {formatPrice(amount)} with PhonePe</span>
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By proceeding, you agree to PhonePe's terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhonePePayment;
