import express from 'express';
import { body } from 'express-validator';
import scraperController from '../controllers/scraperController.js';
import { protect, authorize } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for scraper endpoints
const scraperRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many scraping requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation middleware
const validateScrapeUrl = [
  body('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Valid URL is required')
    .custom((value) => {
      if (!value.includes('deodap.in')) {
        throw new Error('URL must be from deodap.in domain');
      }
      return true;
    })
];

const validateBulkScrape = [
  body('urls')
    .isArray({ min: 1, max: 10 })
    .withMessage('URLs must be an array with 1-10 items'),
  body('urls.*')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Each URL must be valid')
    .custom((value) => {
      if (!value.includes('deodap.in')) {
        throw new Error('All URLs must be from deodap.in domain');
      }
      return true;
    })
];

// Routes

/**
 * @route   GET /api/scraper/status
 * @desc    Get scraper status
 * @access  Private (Admin only)
 */
router.get('/status', protect, authorize('admin'), async (req, res) => {
  await scraperController.getScraperStatus(req, res);
});

/**
 * @route   POST /api/scraper/scrape
 * @desc    Scrape single product from URL
 * @access  Private (Admin only)
 */
router.post('/scrape',
  scraperRateLimit,
  protect,
  authorize('admin'),
  validateScrapeUrl,
  async (req, res) => {
    await scraperController.scrapeProduct(req, res);
  }
);

/**
 * @route   POST /api/scraper/scrape-and-save
 * @desc    Scrape product and save to database
 * @access  Private (Admin only)
 */
router.post('/scrape-and-save',
  scraperRateLimit,
  protect,
  authorize('admin'),
  validateScrapeUrl,
  async (req, res) => {
    await scraperController.scrapeAndSaveProduct(req, res);
  }
);

/**
 * @route   POST /api/scraper/bulk-scrape
 * @desc    Bulk scrape multiple products
 * @access  Private (Admin only)
 */
router.post('/bulk-scrape',
  scraperRateLimit,
  protect,
  authorize('admin'),
  validateBulkScrape,
  async (req, res) => {
    await scraperController.bulkScrapeProducts(req, res);
  }
);

export default router;
