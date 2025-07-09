import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/viraldeals_test';

describe('Products API', () => {
  let authToken;
  let adminToken;
  let testProduct;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'Test123!'
      });
    authToken = userResponse.body.token;

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '9876543211',
        password: 'Admin123!'
      });
    
    // Update user role to admin
    await User.findByIdAndUpdate(adminResponse.body.user._id, { role: 'admin' });
    
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!'
      });
    adminToken = adminLoginResponse.body.token;

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test product description',
      shortDescription: 'Short description',
      price: 1000,
      originalPrice: 1200,
      category: 'Electronics',
      brand: 'Test Brand',
      sku: 'TEST001',
      stock: 10,
      images: [{ url: '/test-image.jpg', alt: 'Test Image' }],
      features: ['Feature 1', 'Feature 2'],
      specifications: [
        { name: 'Color', value: 'Black' },
        { name: 'Weight', value: '1kg' }
      ],
      isActive: true,
      isFeatured: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Test Product');
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=500&maxPrice=1500')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
    });

    it('should sort products by price', async () => {
      // Create another product with different price
      await Product.create({
        name: 'Expensive Product',
        description: 'Expensive product',
        price: 2000,
        category: 'Electronics',
        sku: 'EXP001',
        stock: 5,
        isActive: true
      });

      const response = await request(app)
        .get('/api/products?sort=price_high')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.products[0].price).toBeGreaterThan(response.body.products[1].price);
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.product.name).toBe('Test Product');
      expect(response.body.product.features).toHaveLength(2);
      expect(response.body.product.specifications).toHaveLength(2);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/featured', () => {
    it('should get featured products', async () => {
      const response = await request(app)
        .get('/api/products/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].isFeatured).toBe(true);
    });

    it('should limit featured products', async () => {
      // Create more featured products
      await Product.create({
        name: 'Featured Product 2',
        description: 'Another featured product',
        price: 1500,
        category: 'Electronics',
        sku: 'FEAT002',
        stock: 8,
        isActive: true,
        isFeatured: true
      });

      const response = await request(app)
        .get('/api/products/featured?limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
    });
  });

  describe('GET /api/products/categories', () => {
    it('should get product categories', async () => {
      const response = await request(app)
        .get('/api/products/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.categories).toHaveLength(1);
      expect(response.body.categories[0].name).toBe('Electronics');
      expect(response.body.categories[0].count).toBe(1);
    });
  });

  describe('POST /api/products/:id/reviews', () => {
    it('should add review to product', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product!'
      };

      const response = await request(app)
        .post(`/api/products/${testProduct._id}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.review.rating).toBe(5);
      expect(response.body.review.comment).toBe('Great product!');
    });

    it('should not add review without authentication', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product!'
      };

      const response = await request(app)
        .post(`/api/products/${testProduct._id}/reviews`)
        .send(reviewData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not add review with invalid rating', async () => {
      const reviewData = {
        rating: 6, // Invalid rating (should be 1-5)
        comment: 'Great product!'
      };

      const response = await request(app)
        .post(`/api/products/${testProduct._id}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not allow duplicate reviews from same user', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product!'
      };

      // First review
      await request(app)
        .post(`/api/products/${testProduct._id}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(201);

      // Second review from same user
      const response = await request(app)
        .post(`/api/products/${testProduct._id}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already reviewed');
    });
  });

  describe('GET /api/products/:id/reviews', () => {
    beforeEach(async () => {
      // Add a test review
      await request(app)
        .post(`/api/products/${testProduct._id}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 5,
          comment: 'Great product!'
        });
    });

    it('should get product reviews', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}/reviews`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.reviews[0].rating).toBe(5);
    });

    it('should paginate reviews', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}/reviews?page=1&limit=1`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.page).toBe(1);
    });
  });
});
