import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  updatePaymentStatus
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validateOrder } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', validateOrder, createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/payment', updatePaymentStatus);

export default router;
