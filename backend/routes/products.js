import express from 'express';
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getCategories,
  addReview,
  getReviews,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  bulkUpdateStock,
  addAdminReview,
  updateAdminReview,
  deleteAdminReview
} from '../controllers/productController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';
import {
  productsCacheMiddleware,
  productCacheMiddleware,
  featuredProductsCacheMiddleware,
  categoriesCacheMiddleware,
  invalidateProductCache,
  compressionMiddleware,
  cache
} from '../middleware/cache.js';

const router = express.Router();

// Public routes with caching
router.get('/', compressionMiddleware, productsCacheMiddleware, getProducts);
router.get('/featured', compressionMiddleware, cache('1h'), getFeaturedProducts);
router.get('/categories', compressionMiddleware, categoriesCacheMiddleware, getCategories);
router.get('/:id', optionalAuth, compressionMiddleware, productCacheMiddleware, getProduct);
router.get('/:id/reviews', compressionMiddleware, getReviews);

// Protected routes
router.post('/:id/reviews', protect, invalidateProductCache, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], addReview);

// Admin routes
router.post('/', protect, authorize('admin'), invalidateProductCache, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one product image is required')
], createProduct);

router.put('/:id', protect, authorize('admin'), invalidateProductCache, [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Valid stock quantity is required')
], updateProduct);

router.delete('/:id', protect, authorize('admin'), invalidateProductCache, deleteProduct);

// Admin utility routes
router.get('/admin/low-stock', protect, authorize('admin'), getLowStockProducts);
router.post('/admin/bulk-update-stock', protect, authorize('admin'), invalidateProductCache, bulkUpdateStock);

// Admin review management routes
router.post('/:id/admin/reviews', protect, authorize('admin'), invalidateProductCache, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
  body('reviewerName').trim().notEmpty().withMessage('Reviewer name is required')
], addAdminReview);

router.put('/:id/admin/reviews/:reviewId', protect, authorize('admin'), invalidateProductCache, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
  body('reviewerName').trim().notEmpty().withMessage('Reviewer name is required')
], updateAdminReview);

router.delete('/:id/admin/reviews/:reviewId', protect, authorize('admin'), invalidateProductCache, deleteAdminReview);

export default router;
