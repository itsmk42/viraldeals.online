import express from 'express';
import {
  createUPIPayment,
  createCardPayment,
  createNetBankingPayment,
  createWalletPayment,
  verifyPayment,
  getPaymentMethods,
  createPhonePePayment,
  handlePhonePeCallback,
  checkPhonePeStatus
} from '../controllers/paymentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);
router.post('/phonepe/callback', handlePhonePeCallback); // PhonePe callback (public)

// Protected routes
router.use(protect);

router.post('/upi', createUPIPayment);
router.post('/card', createCardPayment);
router.post('/netbanking', createNetBankingPayment);
router.post('/wallet', createWalletPayment);
router.post('/verify', verifyPayment);

// PhonePe routes
router.post('/phonepe', createPhonePePayment);
router.get('/phonepe/status/:transactionId', checkPhonePeStatus);

export default router;
