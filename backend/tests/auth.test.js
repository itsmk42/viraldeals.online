import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/viraldeals_test';

describe('Authentication API', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'Test123!'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.user.name).toBe(validUser.name);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not register user with invalid email', async () => {
      const invalidUser = { ...validUser, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    it('should not register user with invalid phone', async () => {
      const invalidUser = { ...validUser, phone: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with weak password', async () => {
      const invalidUser = { ...validUser, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'Test123!'
    };

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'Test123!'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user._id;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user._id).toBe(userId);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/address', () => {
    let authToken;

    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'Test123!'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
    });

    it('should add address successfully', async () => {
      const addressData = {
        type: 'home',
        name: 'Test User',
        phone: '9876543210',
        addressLine1: '123 Test Street',
        addressLine2: 'Test Area',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        isDefault: true
      };

      const response = await request(app)
        .post('/api/auth/address')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addressData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.addresses).toHaveLength(1);
      expect(response.body.user.addresses[0].city).toBe(addressData.city);
    });

    it('should not add address with invalid pincode', async () => {
      const addressData = {
        type: 'home',
        name: 'Test User',
        phone: '9876543210',
        addressLine1: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123', // Invalid pincode
        isDefault: true
      };

      const response = await request(app)
        .post('/api/auth/address')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addressData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
