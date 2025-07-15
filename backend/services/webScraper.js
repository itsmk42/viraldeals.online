import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import robotsParser from 'robots-parser';
import winston from 'winston';
import { URL } from 'url';
import path from 'path';
import fs from 'fs';

// Determine if we're in production (Lambda) environment
const isProduction = process.env.NODE_ENV === 'production';

// Set logs directory based on environment
const logsDir = isProduction ? '/tmp/logs' : 'logs';

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'scraper-error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsDir, 'scraper.log') }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class DeodapScraper {
  constructor() {
    this.baseUrl = 'https://deodap.in';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.robotsRules = null;
    this.browser = null;
    this.requestDelay = 2000; // 2 seconds between requests
  }

  // Initialize scraper and check robots.txt
  async initialize() {
    try {
      logger.info('Initializing DeodapScraper...');
      
      // Check robots.txt compliance
      await this.checkRobotsCompliance();
      
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      logger.info('DeodapScraper initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize scraper:', error);
      throw error;
    }
  }

  // Check robots.txt compliance
  async checkRobotsCompliance() {
    try {
      const robotsUrl = `${this.baseUrl}/robots.txt`;
      const response = await axios.get(robotsUrl, { timeout: 10000 });
      this.robotsRules = robotsParser(robotsUrl, response.data);
      
      logger.info('Robots.txt loaded and parsed successfully');
    } catch (error) {
      logger.warn('Could not load robots.txt, proceeding with caution:', error.message);
      // Continue without robots.txt - assume allowed but be respectful
    }
  }

  // Check if URL is allowed by robots.txt
  isUrlAllowed(url) {
    if (!this.robotsRules) return true;
    return this.robotsRules.isAllowed(url, this.userAgent);
  }

  // Add delay between requests
  async delay(ms = this.requestDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Scrape product from URL
  async scrapeProduct(productUrl) {
    if (!this.browser) {
      throw new Error('Scraper not initialized. Call initialize() first.');
    }

    try {
      // Validate URL
      const url = new URL(productUrl);
      if (!url.hostname.includes('deodap.in')) {
        throw new Error('URL must be from deodap.in domain');
      }

      // Check robots.txt compliance
      if (!this.isUrlAllowed(productUrl)) {
        throw new Error('URL is disallowed by robots.txt');
      }

      logger.info(`Starting to scrape product: ${productUrl}`);

      const page = await this.browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to product page
      await page.goto(productUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await page.waitForSelector('h1, .product-title, [data-testid="product-title"]', { timeout: 10000 });

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract product data
      const productData = this.extractProductData($, productUrl);

      await page.close();
      
      // Add delay before next request
      await this.delay();

      logger.info(`Successfully scraped product: ${productData.name}`);
      return productData;

    } catch (error) {
      logger.error(`Error scraping product ${productUrl}:`, error);
      throw error;
    }
  }

  // Extract product data from page
  extractProductData($, url) {
    try {
      // Extract product name
      const name = this.extractProductName($);
      
      // Extract description
      const description = this.extractDescription($);
      
      // Extract prices
      const pricing = this.extractPricing($);
      
      // Extract images
      const images = this.extractImages($);
      
      // Extract specifications
      const specifications = this.extractSpecifications($);
      
      // Extract additional details
      const additionalData = this.extractAdditionalData($);

      return {
        name: name || 'Unknown Product',
        description: description || '',
        shortDescription: this.generateShortDescription(description),
        price: 0, // Set to 0 for manual entry
        originalPrice: 0, // Set to 0 for manual entry
        images: images,
        specifications: specifications,
        features: additionalData.features || [],
        brand: additionalData.brand || '',
        sku: additionalData.sku || '',
        category: this.mapToViralDealsCategory(additionalData.category),
        stock: 100, // Default stock
        isFeatured: false,
        tags: this.generateTags(name, description),
        sourceUrl: url,
        scrapedAt: new Date().toISOString(),
        gst: { rate: 18, hsn: '' }, // Default GST for India
        needsPriceEntry: true // Flag to indicate manual price entry needed
      };
    } catch (error) {
      logger.error('Error extracting product data:', error);
      throw error;
    }
  }

  // Extract product name
  extractProductName($) {
    const selectors = [
      'h1',
      '.product-title',
      '[data-testid="product-title"]',
      '.product-name',
      'h1.product-title',
      '.product-info h1',
      // Deodap.in specific selectors
      '.product-single__title',
      '.product__title',
      'h1[class*="title"]'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        return element.text().trim();
      }
    }

    // Fallback: look for the page title or any h1
    const pageTitle = $('title').text();
    if (pageTitle && !pageTitle.toLowerCase().includes('deodap')) {
      return pageTitle.split('|')[0].trim();
    }

    return null;
  }

  // Extract product description
  extractDescription($) {
    const selectors = [
      '.product-description',
      '.description',
      '[data-testid="product-description"]',
      '.product-details',
      '.product-info .description',
      // Deodap.in specific selectors
      '.product-single__description',
      '.product__description',
      '.rte',
      '.product-form__description',
      '[class*="description"]'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        return element.text().trim();
      }
    }

    // Look for content in common description containers
    const descriptionContainers = [
      '.product-single',
      '.product-form',
      '.product-info',
      '.product-content'
    ];

    for (const container of descriptionContainers) {
      const containerEl = $(container);
      if (containerEl.length) {
        const text = containerEl.find('p, div').filter(function() {
          const content = $(this).text().trim();
          return content.length > 50 && !content.includes('₹') && !content.includes('Price');
        }).first().text().trim();

        if (text) return text;
      }
    }

    return '';
  }

  // Extract pricing information
  extractPricing($) {
    const pricing = {
      salePrice: 0,
      originalPrice: 0
    };

    // Look for price elements - Deodap.in specific
    const priceSelectors = [
      '.price',
      '.product-price',
      '[data-testid="price"]',
      '.sale-price',
      '.current-price',
      // Deodap.in specific
      '.price-item--sale',
      '.price-item--regular',
      '.product-form__price',
      '.money',
      '[class*="price"]'
    ];

    const originalPriceSelectors = [
      '.original-price',
      '.was-price',
      '.regular-price',
      '.compare-price',
      '.price-item--regular'
    ];

    // Try to find all price-related text on the page
    const allPriceText = $('*').filter(function() {
      const text = $(this).text();
      return text.includes('₹') || text.includes('Rs') || text.match(/\d+\.\d+/);
    }).map(function() {
      return $(this).text().trim();
    }).get();

    // Extract prices from all found text
    const prices = [];
    allPriceText.forEach(text => {
      const price = this.extractPriceFromText(text);
      if (price > 0 && price < 100000) { // Reasonable price range
        prices.push(price);
      }
    });

    // Sort prices and take the most reasonable ones
    prices.sort((a, b) => a - b);

    if (prices.length > 0) {
      pricing.salePrice = prices[0]; // Lowest price (likely sale price)
      if (prices.length > 1) {
        pricing.originalPrice = prices[prices.length - 1]; // Highest price (likely original)
      } else {
        pricing.originalPrice = pricing.salePrice;
      }
    }

    // Fallback: try specific selectors
    if (pricing.salePrice === 0) {
      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim();
        const price = this.extractPriceFromText(priceText);
        if (price > 0) {
          pricing.salePrice = price;
          break;
        }
      }
    }

    return pricing;
  }

  // Extract price from text
  extractPriceFromText(text) {
    if (!text) return 0;
    
    // Remove currency symbols and extract numbers
    const priceMatch = text.replace(/[^\d.,]/g, '').match(/[\d,]+\.?\d*/);
    if (priceMatch) {
      return parseFloat(priceMatch[0].replace(/,/g, ''));
    }
    return 0;
  }

  // Extract product images
  extractImages($) {
    const images = [];
    const imageSelectors = [
      '.product-image img',
      '.product-gallery img',
      '.product-photos img',
      '[data-testid="product-image"] img',
      '.product-slider img',
      // Deodap.in specific
      '.product-single__media img',
      '.product__media img',
      '.product-form__media img',
      '.media img',
      'img[src*="cdn.shopify.com"]',
      'img[src*="deodap"]'
    ];

    const processedUrls = new Set();

    // First try specific selectors
    for (const selector of imageSelectors) {
      $(selector).each((index, element) => {
        const src = $(element).attr('src') || $(element).attr('data-src') || $(element).attr('data-original');
        if (src && !processedUrls.has(src)) {
          processedUrls.add(src);

          // Convert relative URLs to absolute
          let imageUrl = src;
          if (!src.startsWith('http')) {
            imageUrl = src.startsWith('//') ? `https:${src}` : `${this.baseUrl}${src}`;
          }

          // Filter out very small images (likely icons)
          const width = $(element).attr('width') || $(element).css('width');
          const height = $(element).attr('height') || $(element).css('height');

          if (width && height && (parseInt(width) < 100 || parseInt(height) < 100)) {
            return; // Skip small images
          }

          images.push({
            url: imageUrl,
            alt: $(element).attr('alt') || `Product image ${images.length + 1}`,
            isPrimary: index === 0
          });
        }
      });
    }

    // Fallback: find all images on the page and filter for product images
    if (images.length === 0) {
      $('img').each((index, element) => {
        const src = $(element).attr('src') || $(element).attr('data-src');
        if (src && !processedUrls.has(src)) {
          // Filter for product-related images
          const alt = $(element).attr('alt') || '';
          const srcLower = src.toLowerCase();

          if (srcLower.includes('product') ||
              srcLower.includes('cdn.shopify.com') ||
              alt.toLowerCase().includes('product') ||
              $(element).closest('.product').length > 0) {

            processedUrls.add(src);

            let imageUrl = src;
            if (!src.startsWith('http')) {
              imageUrl = src.startsWith('//') ? `https:${src}` : `${this.baseUrl}${src}`;
            }

            images.push({
              url: imageUrl,
              alt: alt || `Product image ${images.length + 1}`,
              isPrimary: index === 0
            });
          }
        }
      });
    }

    return images.slice(0, 10); // Limit to 10 images
  }

  // Extract specifications
  extractSpecifications($) {
    const specifications = [];
    
    // Look for specification tables or lists
    $('.specifications tr, .specs tr, .product-specs tr').each((index, element) => {
      const $row = $(element);
      const label = $row.find('td:first-child, th:first-child').text().trim();
      const value = $row.find('td:last-child, td:nth-child(2)').text().trim();
      
      if (label && value) {
        specifications.push({ name: label, value: value });
      }
    });

    return specifications;
  }

  // Extract additional data
  extractAdditionalData($) {
    return {
      brand: this.extractBrand($),
      sku: this.extractSKU($),
      category: this.extractCategory($),
      features: this.extractFeatures($)
    };
  }

  // Extract brand
  extractBrand($) {
    const brandSelectors = [
      '.brand',
      '.product-brand',
      '[data-testid="brand"]',
      '.manufacturer'
    ];

    for (const selector of brandSelectors) {
      const brand = $(selector).first().text().trim();
      if (brand) return brand;
    }

    return '';
  }

  // Extract SKU
  extractSKU($) {
    const skuSelectors = [
      '.sku',
      '.product-sku',
      '[data-testid="sku"]',
      '.product-code'
    ];

    for (const selector of skuSelectors) {
      const sku = $(selector).first().text().trim();
      if (sku) return sku;
    }

    return '';
  }

  // Extract category
  extractCategory($) {
    const categorySelectors = [
      '.breadcrumb a:last-child',
      '.category',
      '.product-category',
      '[data-testid="category"]'
    ];

    for (const selector of categorySelectors) {
      const category = $(selector).first().text().trim();
      if (category) return category;
    }

    return '';
  }

  // Extract features
  extractFeatures($) {
    const features = [];
    
    $('.features li, .product-features li, .highlights li').each((index, element) => {
      const feature = $(element).text().trim();
      if (feature) {
        features.push(feature);
      }
    });

    return features;
  }

  // Generate short description
  generateShortDescription(description) {
    if (!description) return '';
    
    const sentences = description.split('.').filter(s => s.trim().length > 0);
    return sentences.length > 0 ? sentences[0].trim() + '.' : description.substring(0, 100) + '...';
  }

  // Map to ViralDeals categories
  mapToViralDealsCategory(originalCategory) {
    const categoryMap = {
      'electronics': 'Tech Accessories',
      'mobile': 'Tech Accessories',
      'kitchen': 'Kitchen Innovations',
      'home': 'Smart Home Gadgets',
      'beauty': 'Health & Wellness Devices',
      'toys': 'Gaming & Entertainment',
      'fashion': 'Novelty & Fun Gadgets',
      'gadgets': 'Viral Picks',
      'accessories': 'Tech Accessories'
    };

    if (!originalCategory) return 'Viral Picks';

    const category = originalCategory.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (category.includes(key)) {
        return value;
      }
    }

    return 'Viral Picks'; // Default category
  }

  // Generate tags
  generateTags(name, description) {
    const text = `${name} ${description}`.toLowerCase();
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    const words = text.match(/\b\w{3,}\b/g) || [];
    const tags = [...new Set(words)]
      .filter(word => !commonWords.includes(word))
      .slice(0, 10);

    return tags;
  }

  // Close browser
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }
}

export default DeodapScraper;
