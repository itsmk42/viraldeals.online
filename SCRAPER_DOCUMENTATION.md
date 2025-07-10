# ViralDeals Web Scraper Documentation

## Overview

The ViralDeals Web Scraper is a comprehensive solution for automatically extracting product information from deodap.in and integrating it with the ViralDeals admin dashboard. This system provides a user-friendly interface for admins to scrape products and automatically populate the product catalog.

## Features

### ✅ **Core Functionality**
- **Single Product Scraping**: Extract individual product data from deodap.in URLs
- **Bulk Scraping**: Process up to 10 products simultaneously
- **Automatic Data Cleaning**: Format scraped data to match ViralDeals schema
- **Direct Database Integration**: Save products directly to the database
- **Admin Interface**: User-friendly React component for scraping operations

### ✅ **Data Extraction Capabilities**
- Product names and descriptions
- Pricing information (sale price and original price)
- High-quality product images (up to 10 per product)
- Product specifications and features
- Automatic category mapping to ViralDeals categories
- SEO-friendly metadata generation
- Indian-specific features (GST calculation, INR formatting)

### ✅ **Compliance & Security**
- **robots.txt Compliance**: Respects website scraping policies
- **Rate Limiting**: 2-second delays between requests
- **Admin-Only Access**: Secured with JWT authentication
- **Request Validation**: Comprehensive input validation
- **Error Handling**: Robust error management and logging
- **Logging System**: Detailed activity and error logs

## Architecture

### Backend Components

#### 1. **Web Scraper Service** (`/backend/services/webScraper.js`)
- **Puppeteer Integration**: Headless browser automation
- **Cheerio Parsing**: HTML content extraction
- **Data Extraction Methods**: Specialized extractors for different data types
- **Compliance Checking**: robots.txt validation
- **Error Handling**: Comprehensive error management

#### 2. **Scraper Controller** (`/backend/controllers/scraperController.js`)
- **API Endpoints**: RESTful endpoints for scraping operations
- **Data Cleaning**: Format data for ViralDeals schema
- **Database Integration**: Save products to MongoDB
- **Validation**: Input validation and sanitization

#### 3. **API Routes** (`/backend/routes/scraper.js`)
- **Authentication**: Admin-only access control
- **Rate Limiting**: Prevent abuse and respect target website
- **Validation Middleware**: Ensure valid deodap.in URLs

### Frontend Components

#### 1. **Product Scraper Component** (`/frontend/src/components/admin/ProductScraper.jsx`)
- **Single Product Mode**: Scrape individual products
- **Bulk Scraping Mode**: Process multiple URLs
- **Data Preview**: Review scraped data before saving
- **Error Display**: User-friendly error messages
- **Progress Tracking**: Real-time scraping status

#### 2. **Admin Integration**
- **Navigation Menu**: Added to admin sidebar
- **Dashboard Quick Action**: Direct access from admin dashboard
- **Route Protection**: Admin-only access

## API Endpoints

### 1. **GET /api/scraper/status**
- **Description**: Get scraper initialization status
- **Access**: Admin only
- **Response**: Scraper status and browser state

### 2. **POST /api/scraper/scrape**
- **Description**: Scrape single product data
- **Access**: Admin only
- **Body**: `{ "url": "https://deodap.in/products/..." }`
- **Response**: Cleaned product data

### 3. **POST /api/scraper/scrape-and-save**
- **Description**: Scrape and save product to database
- **Access**: Admin only
- **Body**: `{ "url": "https://deodap.in/products/..." }`
- **Response**: Saved product information

### 4. **POST /api/scraper/bulk-scrape**
- **Description**: Bulk scrape multiple products
- **Access**: Admin only
- **Body**: `{ "urls": ["url1", "url2", ...] }` (max 10)
- **Response**: Results and errors for each URL

## Installation & Setup

### Dependencies
```bash
# Backend dependencies
npm install puppeteer cheerio axios robots-parser winston

# Already included in package.json
```

### Environment Variables
```env
# Add to backend/.env (already configured)
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/viraldeals
JWT_SECRET=your_jwt_secret
```

### File Structure
```
viraldeals/
├── backend/
│   ├── services/
│   │   └── webScraper.js          # Core scraping logic
│   ├── controllers/
│   │   └── scraperController.js   # API controller
│   ├── routes/
│   │   └── scraper.js            # API routes
│   └── logs/                     # Scraping logs
├── frontend/
│   └── src/
│       └── components/
│           └── admin/
│               └── ProductScraper.jsx  # Admin UI
└── SCRAPER_DOCUMENTATION.md
```

## Usage Guide

### Admin Interface Usage

1. **Access the Scraper**
   - Login as admin: `admin@viraldeals.online` / `Admin123!`
   - Navigate to Admin → Product Scraper
   - Or use Quick Action from dashboard

2. **Single Product Scraping**
   - Enter deodap.in product URL
   - Click "Scrape" to preview data
   - Review extracted information
   - Click "Save Product" to add to catalog

3. **Bulk Scraping**
   - Switch to "Bulk Scraping" mode
   - Add up to 10 product URLs
   - Click "Bulk Scrape"
   - Review results and errors

### API Usage Examples

```bash
# Get admin token
TOKEN=$(curl -X POST "http://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@viraldeals.online","password":"Admin123!"}' \
  | jq -r '.token')

# Scrape single product
curl -X POST "http://localhost:5001/api/scraper/scrape" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"url":"https://deodap.in/products/product-url"}'

# Scrape and save product
curl -X POST "http://localhost:5001/api/scraper/scrape-and-save" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"url":"https://deodap.in/products/product-url"}'
```

## Data Mapping

### Scraped Data → ViralDeals Schema
- **Name**: Product title → `name`
- **Description**: Product description → `description`
- **Price**: Extracted pricing → `price` & `originalPrice`
- **Images**: Product images → `images[]`
- **Category**: Auto-mapped → ViralDeals categories
- **Tags**: Auto-generated → SEO tags
- **SKU**: Auto-generated → Unique identifier
- **GST**: Default 18% → Indian tax compliance

### Category Mapping
```javascript
const categoryMap = {
  'electronics': 'Tech Accessories',
  'mobile': 'Tech Accessories',
  'kitchen': 'Kitchen Innovations',
  'home': 'Smart Home Gadgets',
  'beauty': 'Health & Wellness Devices',
  'toys': 'Gaming & Entertainment',
  'fashion': 'Novelty & Fun Gadgets',
  'gadgets': 'Viral Picks'
};
```

## Compliance & Best Practices

### Web Scraping Ethics
- ✅ **robots.txt Compliance**: Automatically checks and respects robots.txt
- ✅ **Rate Limiting**: 2-second delays between requests
- ✅ **Respectful Scraping**: Minimal server load
- ✅ **Error Handling**: Graceful failure handling
- ✅ **User Agent**: Proper browser identification

### Security Measures
- ✅ **Admin Authentication**: JWT-based access control
- ✅ **Input Validation**: URL and data validation
- ✅ **Rate Limiting**: API endpoint protection
- ✅ **Error Sanitization**: No sensitive data exposure
- ✅ **Logging**: Comprehensive activity tracking

## Troubleshooting

### Common Issues

1. **"URL must be from deodap.in domain"**
   - Ensure URL contains "deodap.in"
   - Use full product URLs with "/products/" path

2. **"Not authorized to access this route"**
   - Login with admin credentials
   - Check JWT token validity

3. **"Failed to scrape product"**
   - Check internet connectivity
   - Verify target URL is accessible
   - Check scraper logs for details

4. **Missing images or description**
   - Website structure may have changed
   - Check browser console for errors
   - Review scraper extraction logic

### Logs Location
- **Scraper Logs**: `backend/logs/scraper.log`
- **Error Logs**: `backend/logs/scraper-error.log`
- **Controller Logs**: `backend/logs/scraper-controller.log`

## Performance Optimization

### Current Optimizations
- **Headless Browser**: Minimal resource usage
- **Image Filtering**: Skip small/icon images
- **Data Caching**: Avoid duplicate processing
- **Request Batching**: Efficient bulk operations
- **Memory Management**: Proper browser cleanup

### Monitoring
- **Success Rate**: Track scraping success/failure
- **Response Times**: Monitor scraping performance
- **Error Patterns**: Identify common issues
- **Resource Usage**: Browser memory and CPU

## Future Enhancements

### Planned Features
- [ ] **Multi-site Support**: Extend to other e-commerce sites
- [ ] **Scheduled Scraping**: Automated periodic updates
- [ ] **Price Monitoring**: Track price changes
- [ ] **Inventory Sync**: Real-time stock updates
- [ ] **Advanced Filtering**: Custom data extraction rules
- [ ] **Export Functionality**: Bulk data export options

### Technical Improvements
- [ ] **Proxy Support**: Rotate IP addresses
- [ ] **Captcha Handling**: Automated captcha solving
- [ ] **Performance Metrics**: Detailed analytics
- [ ] **A/B Testing**: Multiple extraction strategies
- [ ] **Machine Learning**: Intelligent data extraction

## Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Review API responses for error details
3. Verify admin authentication
4. Test with known working URLs

## License & Legal

This scraper is designed for legitimate business use and respects website terms of service. Users are responsible for ensuring compliance with applicable laws and website policies.
