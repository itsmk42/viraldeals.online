import express from 'express';
import {
  createUPIPayment,
  createCardPayment,
  createNetBankingPayment,
  createWalletPayment,
  verifyPayment,
  getPaymentMethods
} from '../controllers/paymentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);

// Protected routes
router.use(protect);

router.post('/upi', createUPIPayment);
router.post('/card', createCardPayment);
router.post('/netbanking', createNetBankingPayment);
router.post('/wallet', createWalletPayment);
router.post('/verify', verifyPayment);

export default router;
