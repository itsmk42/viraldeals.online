import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
  exportAnalytics,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  dashboardCacheMiddleware,
  invalidateProductCache,
  invalidateOrderCache,
  compressionMiddleware
} from '../middleware/cache.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', compressionMiddleware, dashboardCacheMiddleware, getDashboardStats);

// User management
router.get('/users', compressionMiddleware, getAllUsers);

// Order management
router.get('/orders', compressionMiddleware, getAllOrders);
router.put('/orders/:id/status', invalidateOrderCache, updateOrderStatus);

// Analytics
router.get('/analytics', compressionMiddleware, getAnalytics);
router.get('/analytics/export', exportAnalytics);

// Settings
router.get('/settings', compressionMiddleware, getSettings);
router.put('/settings', updateSettings);

export default router;
