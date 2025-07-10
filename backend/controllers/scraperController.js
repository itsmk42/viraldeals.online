import DeodapScraper from '../services/webScraper.js';
import Product from '../models/Product.js';
import { validationResult } from 'express-validator';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/scraper-controller.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class ScraperController {
  constructor() {
    this.scraper = null;
    this.isInitialized = false;
  }

  // Initialize scraper
  async initializeScraper() {
    if (!this.isInitialized) {
      this.scraper = new DeodapScraper();
      await this.scraper.initialize();
      this.isInitialized = true;
      logger.info('Scraper initialized successfully');
    }
    return this.scraper;
  }

  // Scrape single product
  async scrapeProduct(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { url } = req.body;
      
      logger.info(`Scraping product from URL: ${url}`);

      // Initialize scraper if needed
      await this.initializeScraper();

      // Scrape product data
      const productData = await this.scraper.scrapeProduct(url);

      // Clean and format data for ViralDeals schema
      const cleanedData = this.cleanProductData(productData);

      res.status(200).json({
        success: true,
        message: 'Product scraped successfully',
        data: cleanedData,
        scrapedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error in scrapeProduct:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to scrape product',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Scrape and save product directly
  async scrapeAndSaveProduct(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { url } = req.body;
      
      logger.info(`Scraping and saving product from URL: ${url}`);

      // Initialize scraper if needed
      await this.initializeScraper();

      // Scrape product data
      const productData = await this.scraper.scrapeProduct(url);

      // Clean and format data
      const cleanedData = this.cleanProductData(productData);

      // Add the admin user as creator
      cleanedData.createdBy = req.user._id;

      // Check if product already exists
      const existingProduct = await Product.findOne({ 
        $or: [
          { sourceUrl: url },
          { name: cleanedData.name, brand: cleanedData.brand }
        ]
      });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'Product already exists in database',
          existingProduct: {
            id: existingProduct._id,
            name: existingProduct.name,
            slug: existingProduct.slug
          }
        });
      }

      // Create new product
      const newProduct = new Product(cleanedData);
      await newProduct.save();

      logger.info(`Product saved successfully: ${newProduct.name}`);

      res.status(201).json({
        success: true,
        message: 'Product scraped and saved successfully',
        product: {
          id: newProduct._id,
          name: newProduct.name,
          slug: newProduct.slug,
          price: newProduct.price,
          images: newProduct.images
        }
      });

    } catch (error) {
      logger.error('Error in scrapeAndSaveProduct:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to scrape and save product',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Bulk scrape products from URLs
  async bulkScrapeProducts(req, res) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: validationErrors.array()
        });
      }

      const { urls } = req.body;

      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'URLs array is required and must not be empty'
        });
      }

      if (urls.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 URLs allowed per bulk request'
        });
      }

      logger.info(`Bulk scraping ${urls.length} products`);

      // Initialize scraper if needed
      await this.initializeScraper();

      const results = [];
      const scrapingErrors = [];

      // Process each URL
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];

        try {
          logger.info(`Processing URL ${i + 1}/${urls.length}: ${url}`);

          const productData = await this.scraper.scrapeProduct(url);
          const cleanedData = this.cleanProductData(productData);

          results.push({
            url,
            success: true,
            data: cleanedData
          });

        } catch (error) {
          logger.error(`Error scraping URL ${url}:`, error);
          scrapingErrors.push({
            url,
            success: false,
            error: error.message
          });
        }

        // Add delay between requests
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      res.status(200).json({
        success: true,
        message: `Bulk scraping completed. ${results.length} successful, ${scrapingErrors.length} failed.`,
        results,
        errors: scrapingErrors,
        summary: {
          total: urls.length,
          successful: results.length,
          failed: scrapingErrors.length
        }
      });

    } catch (error) {
      logger.error('Error in bulkScrapeProducts:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to bulk scrape products',
        error: error.message
      });
    }
  }

  // Get scraper status
  async getScraperStatus(req, res) {
    try {
      res.status(200).json({
        success: true,
        status: {
          initialized: this.isInitialized,
          browserActive: this.scraper && this.scraper.browser !== null,
          lastActivity: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get scraper status',
        error: error.message
      });
    }
  }

  // Clean and format product data for ViralDeals schema
  cleanProductData(rawData) {
    return {
      name: this.sanitizeString(rawData.name, 100), // Limit to 100 characters
      description: this.sanitizeString(rawData.description, 2000), // Limit to 2000 characters
      shortDescription: this.sanitizeString(rawData.shortDescription, 200), // Limit to 200 characters
      price: 0, // Set to 0 for manual entry
      originalPrice: 0, // Set to 0 for manual entry
      images: this.cleanImages(rawData.images),
      category: rawData.category || 'Viral Picks',
      brand: this.sanitizeString(rawData.brand, 50),
      sku: this.sanitizeString(rawData.sku, 50) || this.generateSKU(),
      stock: Math.max(0, rawData.stock || 100),
      isFeatured: false,
      isActive: true,
      tags: this.cleanTags(rawData.tags),
      specifications: this.cleanSpecifications(rawData.specifications),
      features: this.cleanFeatures(rawData.features),
      sourceUrl: rawData.sourceUrl,
      scrapedAt: rawData.scrapedAt,
      gst: {
        rate: rawData.gst?.rate || 18,
        hsn: rawData.gst?.hsn || ''
      },
      seo: {
        metaTitle: this.generateMetaTitle(rawData.name),
        metaDescription: this.generateMetaDescription(rawData.shortDescription || rawData.description),
        keywords: rawData.tags?.slice(0, 5) || []
      }
    };
  }

  // Sanitize string input
  sanitizeString(str, maxLength = 500) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ').substring(0, maxLength);
  }

  // Clean images array
  cleanImages(images) {
    if (!Array.isArray(images)) return [];
    
    return images
      .filter(img => img && img.url)
      .map(img => ({
        url: img.url,
        alt: this.sanitizeString(img.alt) || 'Product image',
        isPrimary: Boolean(img.isPrimary)
      }))
      .slice(0, 10); // Limit to 10 images
  }

  // Clean tags array
  cleanTags(tags) {
    if (!Array.isArray(tags)) return [];
    
    return tags
      .filter(tag => tag && typeof tag === 'string')
      .map(tag => this.sanitizeString(tag))
      .filter(tag => tag.length > 0)
      .slice(0, 10);
  }

  // Clean specifications array
  cleanSpecifications(specs) {
    if (!Array.isArray(specs)) return [];
    
    return specs
      .filter(spec => spec && spec.name && spec.value)
      .map(spec => ({
        name: this.sanitizeString(spec.name),
        value: this.sanitizeString(spec.value)
      }))
      .filter(spec => spec.name && spec.value)
      .slice(0, 20);
  }

  // Clean features array
  cleanFeatures(features) {
    if (!Array.isArray(features)) return [];
    
    return features
      .filter(feature => feature && typeof feature === 'string')
      .map(feature => this.sanitizeString(feature))
      .filter(feature => feature.length > 0)
      .slice(0, 15);
  }

  // Generate SKU
  generateSKU() {
    return 'VD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  // Generate meta title
  generateMetaTitle(name) {
    if (!name) return 'Viral Product | ViralDeals';
    return `${name.substring(0, 50)} | ViralDeals`;
  }

  // Generate meta description
  generateMetaDescription(description) {
    if (!description) return 'Discover amazing viral products at unbeatable prices on ViralDeals.';
    return description.substring(0, 150) + (description.length > 150 ? '...' : '');
  }

  // Cleanup resources
  async cleanup() {
    if (this.scraper) {
      await this.scraper.close();
      this.scraper = null;
      this.isInitialized = false;
      logger.info('Scraper resources cleaned up');
    }
  }
}

// Create singleton instance
const scraperController = new ScraperController();

// Cleanup on process exit
process.on('SIGINT', async () => {
  await scraperController.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await scraperController.cleanup();
  process.exit(0);
});

export default scraperController;
