import express from 'express';
import { trackEvent } from '../controllers/analyticsController.js';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for analytics events
const analyticsRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    success: false,
    message: 'Too many analytics events, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configure IP extraction behind proxy
  keyGenerator: (req) => {
    // Use leftmost forwarded IP as it's from Vercel
    const xForwardedFor = req.headers['x-forwarded-for'];
    const ip = xForwardedFor ? xForwardedFor.split(',')[0] : req.ip;
    return ip;
  }
});

// Validation middleware
const validateEvent = [
  body('type').notEmpty().withMessage('Event type is required'),
  body('timestamp').isNumeric().withMessage('Valid timestamp is required'),
  body('sessionId').notEmpty().withMessage('Session ID is required')
];

// Routes
router.post('/events', analyticsRateLimit, validateEvent, trackEvent);

export default router; 