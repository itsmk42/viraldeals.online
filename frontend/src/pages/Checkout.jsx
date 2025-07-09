import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  WalletIcon,
  TruckIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, itemCount, formatPrice, clearCart } = useCart();
  const { user, updateUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const [newAddress, setNewAddress] = useState({
    type: 'home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Calculate pricing
  const subtotal = total;
  const gstAmount = Math.round((subtotal * 18) / 100);
  const shippingCost = subtotal >= 499 ? 0 : 49;
  const finalTotal = subtotal + gstAmount + shippingCost;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    if (user?.addresses) {
      setAddresses(user.addresses);
      const defaultAddress = user.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [user, items.length, navigate]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await authAPI.addAddress(newAddress);
      setAddresses(response.data.user.addresses);
      updateUser(response.data.user);

      // Select the new address if it's the first one or set as default
      const newAddr = response.data.user.addresses[response.data.user.addresses.length - 1];
      if (newAddress.isDefault || addresses.length === 0) {
        setSelectedAddress(newAddr);
      }

      setShowAddressForm(false);
      setNewAddress({
        type: 'home',
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });

      toast.success('Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setLoading(true);

      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart and redirect to success page
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'UPI',
      name: 'UPI',
      icon: DevicePhoneMobileIcon,
      description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
      popular: true
    },
    {
      id: 'Card',
      name: 'Credit/Debit Card',
      icon: CreditCardIcon,
      description: 'Visa, Mastercard, RuPay cards accepted'
    },
    {
      id: 'NetBanking',
      name: 'Net Banking',
      icon: BanknotesIcon,
      description: 'Pay directly from your bank account'
    },
    {
      id: 'Wallet',
      name: 'Digital Wallet',
      icon: WalletIcon,
      description: 'Paytm, Amazon Pay, and other wallets'
    },
    {
      id: 'COD',
      name: 'Cash on Delivery',
      icon: TruckIcon,
      description: 'Pay when your order is delivered'
    }
  ];

  const steps = [
    { id: 1, name: 'Delivery Address', completed: currentStep > 1 },
    { id: 2, name: 'Payment Method', completed: currentStep > 2 },
    { id: 3, name: 'Review Order', completed: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step.completed
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : currentStep === step.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-gray-300 text-gray-500'
                    }`}>
                      {step.completed ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <span className={`ml-3 text-sm font-medium ${
                      currentStep === step.id ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                    {stepIdx !== steps.length - 1 && (
                      <div className={`flex-1 h-0.5 ml-4 ${
                        step.completed ? 'bg-primary-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Delivery Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Add New Address
                  </button>
                </div>

                {/* Existing Addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAddress?._id === address._id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{address.name}</span>
                              <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                                {address.type}
                              </span>
                              {address.isDefault && (
                                <span className="text-sm bg-primary-100 text-primary-600 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">Phone: {address.phone}</p>
                          </div>
                          <input
                            type="radio"
                            checked={selectedAddress?._id === address._id}
                            onChange={() => setSelectedAddress(address)}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          pattern="[6-9][0-9]{9}"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                          className="input-field"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.addressLine1}
                          onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                          className="input-field"
                          placeholder="House/Flat/Office No., Building Name"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          value={newAddress.addressLine2}
                          onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                          className="input-field"
                          placeholder="Area, Landmark"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          pattern="[1-9][0-9]{5}"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Type
                        </label>
                        <select
                          value={newAddress.type}
                          onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                          className="input-field"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                      </label>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {selectedAddress && (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Continue to Payment
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <method.icon className="h-6 w-6 text-gray-600" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{method.name}</span>
                              {method.popular && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>

                {/* Selected Address */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{selectedAddress?.name}</p>
                    <p className="text-gray-600 text-sm">
                      {selectedAddress?.addressLine1}, {selectedAddress?.addressLine2 && `${selectedAddress.addressLine2}, `}
                      {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
                    </p>
                    <p className="text-gray-600 text-sm">Phone: {selectedAddress?.phone}</p>
                  </div>
                </div>

                {/* Selected Payment Method */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{paymentMethods.find(m => m.id === paymentMethod)?.name}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item._id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : `Place Order - ${formatPrice(finalTotal)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
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

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Items in your order</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate">{item.name} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
