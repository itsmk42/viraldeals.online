import Order from '../models/Order.js';

// @desc    Create payment intent for UPI
// @route   POST /api/payments/upi
// @access  Private
export const createUPIPayment = async (req, res) => {
  try {
    const { orderId, upiId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // In a real application, you would integrate with a payment gateway like Razorpay
    // For demo purposes, we'll simulate the UPI payment process
    
    const paymentData = {
      paymentId: `upi_${Date.now()}`,
      amount: order.pricing.total,
      currency: 'INR',
      method: 'UPI',
      upiId: upiId,
      status: 'pending',
      qrCode: `upi://pay?pa=${upiId}&pn=ViralDeals&am=${order.pricing.total}&cu=INR&tn=Order-${order.orderNumber}`,
      deepLink: `upi://pay?pa=${upiId}&pn=ViralDeals&am=${order.pricing.total}&cu=INR&tn=Order-${order.orderNumber}`
    };

    res.status(200).json({
      success: true,
      message: 'UPI payment initiated',
      payment: paymentData
    });
  } catch (error) {
    console.error('UPI payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing UPI payment'
    });
  }
};

// @desc    Create payment intent for Cards
// @route   POST /api/payments/card
// @access  Private
export const createCardPayment = async (req, res) => {
  try {
    const { orderId, cardDetails } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Simulate card payment processing
    const paymentData = {
      paymentId: `card_${Date.now()}`,
      amount: order.pricing.total,
      currency: 'INR',
      method: 'Card',
      cardType: cardDetails.type, // Visa, Mastercard, RuPay
      last4: cardDetails.number.slice(-4),
      status: 'processing'
    };

    res.status(200).json({
      success: true,
      message: 'Card payment initiated',
      payment: paymentData
    });
  } catch (error) {
    console.error('Card payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing card payment'
    });
  }
};

// @desc    Create payment intent for Net Banking
// @route   POST /api/payments/netbanking
// @access  Private
export const createNetBankingPayment = async (req, res) => {
  try {
    const { orderId, bankCode } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Simulate net banking payment
    const paymentData = {
      paymentId: `nb_${Date.now()}`,
      amount: order.pricing.total,
      currency: 'INR',
      method: 'NetBanking',
      bankCode: bankCode,
      redirectUrl: `https://netbanking.${bankCode}.com/payment?amount=${order.pricing.total}&ref=${order.orderNumber}`,
      status: 'pending'
    };

    res.status(200).json({
      success: true,
      message: 'Net banking payment initiated',
      payment: paymentData
    });
  } catch (error) {
    console.error('Net banking payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing net banking payment'
    });
  }
};

// @desc    Create payment intent for Digital Wallets
// @route   POST /api/payments/wallet
// @access  Private
export const createWalletPayment = async (req, res) => {
  try {
    const { orderId, walletType } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Simulate wallet payment
    const paymentData = {
      paymentId: `wallet_${Date.now()}`,
      amount: order.pricing.total,
      currency: 'INR',
      method: 'Wallet',
      walletType: walletType, // Paytm, Amazon Pay, etc.
      redirectUrl: `https://${walletType.toLowerCase()}.com/payment?amount=${order.pricing.total}&ref=${order.orderNumber}`,
      status: 'pending'
    };

    res.status(200).json({
      success: true,
      message: 'Wallet payment initiated',
      payment: paymentData
    });
  } catch (error) {
    console.error('Wallet payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing wallet payment'
    });
  }
};

// @desc    Verify payment status
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // In a real application, you would verify the payment with the payment gateway
    // For demo purposes, we'll simulate successful payment verification
    
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for demo

    if (isPaymentSuccessful) {
      order.payment.status = 'Completed';
      order.payment.transactionId = paymentId;
      order.payment.paidAt = new Date();
      order.status = 'Confirmed';
      await order.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order
      });
    } else {
      order.payment.status = 'Failed';
      order.payment.failureReason = 'Payment declined by bank';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        order
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
};

// @desc    Get supported payment methods
// @route   GET /api/payments/methods
// @access  Public
export const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = {
      upi: {
        name: 'UPI',
        description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
        icon: 'upi',
        enabled: true,
        popular: true
      },
      cards: {
        name: 'Credit/Debit Cards',
        description: 'Visa, Mastercard, RuPay cards accepted',
        icon: 'card',
        enabled: true,
        supportedCards: ['Visa', 'Mastercard', 'RuPay', 'American Express']
      },
      netbanking: {
        name: 'Net Banking',
        description: 'Pay directly from your bank account',
        icon: 'bank',
        enabled: true,
        supportedBanks: [
          { code: 'sbi', name: 'State Bank of India' },
          { code: 'hdfc', name: 'HDFC Bank' },
          { code: 'icici', name: 'ICICI Bank' },
          { code: 'axis', name: 'Axis Bank' },
          { code: 'kotak', name: 'Kotak Mahindra Bank' },
          { code: 'pnb', name: 'Punjab National Bank' }
        ]
      },
      wallets: {
        name: 'Digital Wallets',
        description: 'Paytm, Amazon Pay, and other wallets',
        icon: 'wallet',
        enabled: true,
        supportedWallets: [
          { code: 'paytm', name: 'Paytm' },
          { code: 'amazonpay', name: 'Amazon Pay' },
          { code: 'mobikwik', name: 'MobiKwik' },
          { code: 'freecharge', name: 'FreeCharge' }
        ]
      },
      cod: {
        name: 'Cash on Delivery',
        description: 'Pay when your order is delivered',
        icon: 'cash',
        enabled: true,
        maxAmount: 50000 // Maximum COD amount in INR
      }
    };

    res.status(200).json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment methods'
    });
  }
};
