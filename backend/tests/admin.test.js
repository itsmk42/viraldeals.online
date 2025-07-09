import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/viraldeals_test';

describe('Admin API', () => {
  let adminToken;
  let userToken;
  let testUser;
  let testProduct;
  let testOrder;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'Test123!'
      });
    userToken = userResponse.body.token;
    testUser = userResponse.body.user;

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
      price: 1000,
      category: 'Electronics',
      sku: 'TEST001',
      stock: 10,
      isActive: true
    });

    // Create test order
    testOrder = await Order.create({
      user: testUser._id,
      orderNumber: 'VD24010001',
      items: [{
        product: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        quantity: 1,
        sku: testProduct.sku
      }],
      shippingAddress: {
        name: 'Test User',
        phone: '9876543210',
        addressLine1: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      pricing: {
        subtotal: 1000,
        gst: 180,
        shipping: 0,
        total: 1180
      },
      payment: {
        method: 'UPI',
        status: 'Completed'
      },
      status: 'Processing'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/admin/dashboard', () => {
    it('should get dashboard stats for admin', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('revenue');
      expect(response.body.data.users.total).toBe(2); // admin + user
      expect(response.body.data.products.total).toBe(1);
      expect(response.body.data.orders.total).toBe(1);
    });

    it('should not allow regular user to access dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('access denied');
    });

    it('should not allow unauthenticated access to dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should get all users for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.users[0]).not.toHaveProperty('password');
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=user')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].role).toBe('user');
    });

    it('should search users by name or email', async () => {
      const response = await request(app)
        .get('/api/admin/users?search=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].name).toContain('Test');
    });

    it('should paginate users', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(2);
    });

    it('should not allow regular user to access users list', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/orders', () => {
    it('should get all orders for admin', async () => {
      const response = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0].orderNumber).toBe('VD24010001');
      expect(response.body.orders[0].user).toHaveProperty('name');
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/admin/orders?status=Processing')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0].status).toBe('Processing');
    });

    it('should filter orders by payment status', async () => {
      const response = await request(app)
        .get('/api/admin/orders?paymentStatus=Completed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0].payment.status).toBe('Completed');
    });

    it('should search orders by order number', async () => {
      const response = await request(app)
        .get('/api/admin/orders?search=VD24010001')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orders).toHaveLength(1);
    });

    it('should not allow regular user to access orders list', async () => {
      const response = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/orders/:id/status', () => {
    it('should update order status', async () => {
      const updateData = {
        status: 'Shipped',
        trackingNumber: 'TRK123456',
        courierName: 'Test Courier'
      };

      const response = await request(app)
        .put(`/api/admin/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe('Shipped');
      expect(response.body.order.tracking.trackingNumber).toBe('TRK123456');
      expect(response.body.order.tracking.courierName).toBe('Test Courier');
      expect(response.body.order.tracking.updates).toHaveLength(1);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/admin/orders/${fakeId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Shipped' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should not allow regular user to update order status', async () => {
      const response = await request(app)
        .put(`/api/admin/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'Shipped' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin Authorization', () => {
    it('should require admin role for all admin endpoints', async () => {
      const endpoints = [
        '/api/admin/dashboard',
        '/api/admin/users',
        '/api/admin/orders'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('access denied');
      }
    });

    it('should require authentication for all admin endpoints', async () => {
      const endpoints = [
        '/api/admin/dashboard',
        '/api/admin/users',
        '/api/admin/orders'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(401);

        expect(response.body.success).toBe(false);
      }
    });
  });
});
