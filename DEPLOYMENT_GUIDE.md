# ViralDeals.online - Comprehensive Production Environment Setup Guide

## 📋 Table of Contents
1. [Prerequisites & Requirements](#prerequisites--requirements)
2. [Deployment Configuration](#deployment-configuration)
3. [Server Setup Instructions](#server-setup-instructions)
4. [Performance Optimization](#performance-optimization)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Security Checklist](#security-checklist)
7. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🔧 Prerequisites & Requirements

### System Requirements
- **Node.js**: v18.0.0 or higher
- **MongoDB Atlas**: Production cluster
- **Domain**: Custom domain (optional but recommended)
- **SSL Certificate**: Automatically provided by hosting platform

### Required Accounts
- [Vercel Account](https://vercel.com/) (Recommended hosting platform)
- [MongoDB Atlas Account](https://cloud.mongodb.com/)
- [Cloudinary Account](https://cloudinary.com/) (For image storage)
- [Razorpay Account](https://razorpay.com/) (For payments)
- [GitHub Account](https://github.com/) (For repository hosting)

### Repository Information
- **GitHub Repository**: https://github.com/itsmk42/viraldeals.online
- **Main Branch**: `main`
- **Production Branch**: `main` (or create `production` branch)

---

## ⚙️ Deployment Configuration

### 1. Environment Variables Setup

#### Core Environment Variables
Create these environment variables in your hosting platform:

```bash
# Application Environment
NODE_ENV=production
PORT=3000

# Database Configuration
MONGODB_URI=mongodb+srv://viraldeals-admin:Ss@1234q@cluster0.yf0klq1.mongodb.net/viraldeals?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
JWT_EXPIRE=7d

# Frontend Configuration
FRONTEND_URL=https://your-domain.vercel.app

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# File Upload (Cloudinary - Recommended)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Optional)
EMAIL_FROM=noreply@viraldeals.online
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security & Performance
MAX_FILE_SIZE=5242880
CACHE_TTL=3600
DEFAULT_GST_RATE=18
```

#### Environment Variables Security Guide

**🔐 JWT Secret Generation**
```bash
# Generate a secure JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**🔑 Environment Variables Validation**
```javascript
// Add this to your production environment check
const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### 2. Database Configuration (MongoDB Atlas)

#### Production Database Setup
```bash
# MongoDB Atlas Connection Details (Pre-configured)
Cluster: cluster0.yf0klq1.mongodb.net
Username: viraldeals-admin
Password: Ss@1234q
Database: viraldeals
```

#### Database Security Configuration
1. **Network Access**
   ```
   IP Whitelist: 0.0.0.0/0 (Allow from anywhere - required for Vercel)
   ```

2. **Database User Permissions**
   ```
   Role: readWrite
   Database: viraldeals
   ```

3. **Connection String Format**
   ```
   mongodb+srv://viraldeals-admin:Ss@1234q@cluster0.yf0klq1.mongodb.net/viraldeals?retryWrites=true&w=majority
   ```

### 3. File Upload Configuration (Critical for Production)

#### ⚠️ Important: Local Storage Issue
The current file upload system uses local disk storage which **WILL NOT WORK** on serverless platforms like Vercel.

#### Solution: Cloudinary Integration
```bash
# Install Cloudinary dependencies
npm install cloudinary multer-storage-cloudinary
```

#### Cloudinary Configuration
```javascript
// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'viraldeals/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  },
});
```

---

## 🚀 Server Setup Instructions

### 1. Vercel Deployment (Recommended)

#### Step 1: Repository Connection
```bash
# 1. Fork or clone the repository
git clone https://github.com/itsmk42/viraldeals.online.git
cd viraldeals.online

# 2. Connect to Vercel
# Go to https://vercel.com/new
# Import your GitHub repository
```

#### Step 2: Build Configuration
The project uses `vercel.json` for configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install --prefix api && npm install --prefix backend && cd frontend && npm install",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/uploads/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

#### Step 3: Environment Variables Setup in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all environment variables from the configuration section above
3. Ensure all values are correctly set for production

#### Step 4: Deploy
```bash
# Automatic deployment on push to main branch
git push origin main

# Or manual deployment via Vercel CLI
npx vercel --prod
```

### 2. Alternative Hosting Platforms

#### Netlify Deployment
```bash
# Build settings for Netlify
Build command: npm run build
Publish directory: frontend/dist
Functions directory: api

# netlify.toml configuration
[build]
  command = "npm run build"
  publish = "frontend/dist"
  functions = "api"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### AWS Deployment (Advanced)
```bash
# Using AWS Amplify
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish

# Or using AWS Lambda + API Gateway
# Requires additional configuration for serverless deployment
```

### 3. Domain Configuration

#### Custom Domain Setup (Vercel)
```bash
# 1. Add domain in Vercel dashboard
# 2. Configure DNS records:

# For root domain (viraldeals.online)
Type: A
Name: @
Value: 76.76.19.61 (Vercel IP)

# For www subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# 3. SSL Certificate (Automatic)
# Vercel automatically provisions SSL certificates
```

#### DNS Configuration
```bash
# Cloudflare DNS Settings (Recommended)
Type: A
Name: @
Value: 76.76.19.61
Proxy: Enabled (Orange cloud)

Type: CNAME
Name: www
Value: viraldeals.online
Proxy: Enabled (Orange cloud)

# Additional security headers via Cloudflare
```

---

## ⚡ Performance Optimization

### 1. Build Optimization

#### Frontend Optimization (Vite Configuration)
```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});
```

#### Backend Optimization
```javascript
// backend/server.js - Production optimizations
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
  level: 6 // Balanced compression level
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);
```

### 2. CDN Configuration

#### Cloudinary CDN for Images
```javascript
// Automatic image optimization
const imageUrl = cloudinary.url('product-image.jpg', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'auto'
});
```

#### Vercel Edge Network
```javascript
// vercel.json - Edge caching configuration
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    },
    {
      "source": "/uploads/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. Database Optimization

#### MongoDB Indexing
```javascript
// Create indexes for better performance
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1, "price": 1 });
db.products.createIndex({ "featured": 1, "createdAt": -1 });
db.orders.createIndex({ "user": 1, "createdAt": -1 });
db.users.createIndex({ "email": 1 }, { unique: true });
```

#### Connection Pooling
```javascript
// backend/config/database.js
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0 // Disable mongoose buffering
};
```
---

## 📊 Monitoring and Maintenance

### 1. Error Tracking and Logging

#### Sentry Integration (Recommended)
```bash
# Install Sentry
npm install @sentry/node @sentry/react

# Backend configuration
// backend/config/sentry.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Frontend configuration
// frontend/src/config/sentry.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

#### Winston Logging (Backend)
```javascript
// backend/config/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'viraldeals-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### 2. Performance Monitoring

#### Vercel Analytics
```javascript
// Add to vercel.json
{
  "analytics": {
    "id": "your-analytics-id"
  }
}

// Frontend integration
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

#### Google Analytics 4
```javascript
// frontend/src/utils/analytics.js
import { gtag } from 'ga-gtag';

export const GA_TRACKING_ID = process.env.REACT_APP_GA_ID;

// Initialize GA
export const initGA = () => {
  gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url) => {
  gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
export const trackEvent = (action, category, label, value) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

### 3. Health Checks and Uptime Monitoring

#### Health Check Endpoints
```javascript
// backend/routes/health.js
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'unknown',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.checks.database = 'connected';
    } else {
      healthCheck.checks.database = 'disconnected';
    }

    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = error.message;
    healthCheck.checks.database = 'error';
    res.status(503).json(healthCheck);
  }
});

export default router;
```

#### UptimeRobot Configuration
```bash
# Monitor these endpoints:
# 1. Main site: https://viraldeals.online
# 2. API health: https://viraldeals.online/api/health
# 3. Admin panel: https://viraldeals.online/admin

# Alert settings:
# - Check interval: 5 minutes
# - Alert contacts: Email, SMS
# - Maintenance windows: Configure as needed
```

### 4. Backup and Recovery

#### Database Backup Strategy
```bash
# MongoDB Atlas Automated Backups (Recommended)
# - Continuous backups with point-in-time recovery
# - Configurable retention periods
# - Cross-region backup storage

# Manual backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="viraldeals_backup_$DATE"

mongodump --uri="$MONGODB_URI" --out="/backups/$BACKUP_NAME"
tar -czf "/backups/$BACKUP_NAME.tar.gz" "/backups/$BACKUP_NAME"
rm -rf "/backups/$BACKUP_NAME"

# Upload to cloud storage (AWS S3, Google Cloud, etc.)
aws s3 cp "/backups/$BACKUP_NAME.tar.gz" "s3://your-backup-bucket/"
```

#### Code Repository Backup
```bash
# Automated GitHub backup
# - Repository mirroring to multiple locations
# - Regular exports of repository data
# - Branch protection rules

# Manual repository backup
git clone --mirror https://github.com/itsmk42/viraldeals.online.git
tar -czf "viraldeals-repo-backup-$(date +%Y%m%d).tar.gz" viraldeals.online.git/
```

#### File Storage Backup (Cloudinary)
```javascript
// Cloudinary backup script
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const backupImages = async () => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'viraldeals/',
      max_results: 500
    });

    const backupData = {
      timestamp: new Date().toISOString(),
      resources: result.resources
    };

    fs.writeFileSync(
      `cloudinary-backup-${Date.now()}.json`,
      JSON.stringify(backupData, null, 2)
    );

    console.log(`Backed up ${result.resources.length} images`);
  } catch (error) {
    console.error('Backup failed:', error);
  }
};
```
---

## 🔒 Security Checklist

### 1. Production Security Best Practices

#### Environment Security
```bash
# ✅ Secure environment variables
NODE_ENV=production
JWT_SECRET=<32+ character random string>
MONGODB_URI=<connection string with strong password>

# ❌ Never commit these to version control
# ❌ Never use default/weak passwords
# ❌ Never expose sensitive data in client-side code
```

#### HTTPS and SSL Configuration
```javascript
// Enforce HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
});

// Security headers (already configured in helmet)
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 2. API Security Configuration

#### Rate Limiting (Enhanced)
```javascript
// backend/middleware/rateLimiting.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'redis';

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL
});

// Different limits for different endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'auth_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'api_limit:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per window
  message: 'Too many API requests, please try again later.',
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many upload attempts, please try again later.',
});
```

#### Input Validation and Sanitization
```javascript
// backend/middleware/validation.js
import { body, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// Enhanced validation middleware
export const validateAndSanitize = (validations) => {
  return async (req, res, next) => {
    // Run validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Sanitize string inputs
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = DOMPurify.sanitize(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(req.body);
    next();
  };
};

// Product validation with sanitization
export const validateProduct = validateAndSanitize([
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters')
]);
```

#### CORS Security
```javascript
// backend/config/cors.js
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://viraldeals.online',
      'https://www.viraldeals.online',
      process.env.FRONTEND_URL
    ];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 3. Data Protection Measures

#### Password Security
```javascript
// backend/models/User.js
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(password) {
        // Strong password requirements
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12); // Increased salt rounds
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

#### JWT Security
```javascript
// backend/utils/jwt.js
import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'viraldeals.online',
    audience: 'viraldeals-users'
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'viraldeals.online',
    audience: 'viraldeals-users'
  });
};

// Refresh token mechanism
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
};
```

#### Database Security
```javascript
// backend/config/database.js
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Security options
  authSource: 'admin',
  ssl: true,
  sslValidate: true,
  // Connection limits
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Query sanitization
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize());
```

### 4. File Upload Security

#### Secure File Upload Configuration
```javascript
// backend/middleware/upload.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'viraldeals/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Restrict file types
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { format: 'auto' }
    ]
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});
```

### 5. Security Headers and Middleware

#### Complete Security Middleware Stack
```javascript
// backend/middleware/security.js
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';

export const securityMiddleware = [
  // Helmet for security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.razorpay.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // XSS protection
  xss(),

  // HTTP Parameter Pollution protection
  hpp({
    whitelist: ['sort', 'fields', 'page', 'limit', 'category']
  }),

  // Additional security headers
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  }
];
```
---

## 🔧 Troubleshooting Guide

### 1. Common Deployment Issues

#### Build Failures

**Issue**: "Build failed with exit code 1"
```bash
# Check build logs in Vercel dashboard
# Common causes and solutions:

# 1. Missing dependencies
npm install --prefix api && npm install --prefix backend && npm install --prefix frontend

# 2. Environment variables not set
# Verify all required env vars are configured in Vercel dashboard

# 3. TypeScript/ESLint errors
npm run lint --fix
npm run build

# 4. Memory issues during build
# Add to vercel.json:
{
  "functions": {
    "api/index.js": {
      "memory": 1024
    }
  }
}
```

**Issue**: "No Output Directory named 'public' found"
```bash
# Solution: Ensure vercel.json has correct outputDirectory
{
  "outputDirectory": "frontend/dist"
}

# Verify build creates files in correct location
cd frontend && npm run build && ls -la dist/
```

#### Database Connection Issues

**Issue**: "MongoServerError: Authentication failed"
```bash
# Check MongoDB Atlas configuration:
# 1. Verify connection string format
mongodb+srv://username:password@cluster.mongodb.net/database

# 2. Check user permissions
# User must have readWrite role on the database

# 3. Verify IP whitelist
# Add 0.0.0.0/0 for Vercel (or specific Vercel IPs)

# 4. Test connection locally
node -e "
const mongoose = require('mongoose');
mongoose.connect('your-connection-string')
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err));
"
```

**Issue**: "Connection timeout"
```bash
# Solutions:
# 1. Check network access in MongoDB Atlas
# 2. Verify connection string includes retryWrites=true
# 3. Add connection timeout options:

const mongooseOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};
```

#### API Endpoint Issues

**Issue**: "404 - API endpoint not found"
```bash
# Check vercel.json rewrites configuration:
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}

# Verify API routes are properly imported in api/index.js
import authRoutes from '../backend/routes/auth.js';
app.use('/api/auth', authRoutes);

# Test API endpoints:
curl https://your-app.vercel.app/api/health
```

**Issue**: "CORS errors"
```bash
# Check CORS configuration in api/index.js:
const corsOptions = {
  origin: [
    'https://your-domain.vercel.app',
    process.env.FRONTEND_URL
  ],
  credentials: true
};

# Verify FRONTEND_URL environment variable is set correctly
```

### 2. Performance Issues

#### Slow Loading Times
```bash
# 1. Enable compression
app.use(compression());

# 2. Optimize images
# Use Cloudinary auto-optimization:
cloudinary.url('image.jpg', {
  quality: 'auto',
  format: 'auto'
});

# 3. Implement caching
# Add cache headers in vercel.json:
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60"
        }
      ]
    }
  ]
}

# 4. Database query optimization
# Add indexes for frequently queried fields:
db.products.createIndex({ "category": 1, "price": 1 });
```

#### Memory Issues
```bash
# 1. Increase function memory in vercel.json:
{
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}

# 2. Optimize database connections
# Use connection pooling:
mongoose.connect(uri, {
  maxPoolSize: 5,
  minPoolSize: 1
});

# 3. Implement pagination
const products = await Product.find()
  .limit(20)
  .skip((page - 1) * 20);
```

### 3. Security Issues

#### Authentication Problems
```bash
# Issue: JWT token errors
# 1. Verify JWT_SECRET is set and consistent
# 2. Check token expiration
# 3. Validate token format

# Debug JWT issues:
const jwt = require('jsonwebtoken');
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token valid:', decoded);
} catch (error) {
  console.error('Token error:', error.message);
}
```

#### File Upload Issues
```bash
# Issue: File uploads failing
# 1. Check Cloudinary configuration
# 2. Verify file size limits
# 3. Check file type restrictions

# Test Cloudinary connection:
import { v2 as cloudinary } from 'cloudinary';
cloudinary.api.ping()
  .then(result => console.log('Cloudinary connected:', result))
  .catch(error => console.error('Cloudinary error:', error));
```

### 4. Monitoring and Debugging

#### Enable Debug Logging
```javascript
// backend/utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transport for persistent logging
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    })
  ]
});

export default logger;
```

#### Health Check Implementation
```javascript
// backend/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    checks: {}
  };

  try {
    // Database check
    const dbState = mongoose.connection.readyState;
    health.checks.database = dbState === 1 ? 'connected' : 'disconnected';

    // Memory check
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
    };

    res.status(200).json(health);
  } catch (error) {
    health.status = 'ERROR';
    health.error = error.message;
    res.status(503).json(health);
  }
});
```

### 5. Emergency Procedures

#### Rollback Deployment
```bash
# Vercel rollback
npx vercel rollback [deployment-url]

# Or via Vercel dashboard:
# 1. Go to project deployments
# 2. Find previous working deployment
# 3. Click "Promote to Production"
```

#### Database Recovery
```bash
# MongoDB Atlas point-in-time recovery
# 1. Go to MongoDB Atlas dashboard
# 2. Select cluster → Backup
# 3. Choose restore point
# 4. Create new cluster or restore to existing

# Manual backup restoration
mongorestore --uri="$MONGODB_URI" /path/to/backup
```

#### Emergency Contacts and Resources
```bash
# Support Resources:
# - Vercel Support: https://vercel.com/support
# - MongoDB Atlas Support: https://support.mongodb.com/
# - Cloudinary Support: https://support.cloudinary.com/

# Monitoring Dashboards:
# - Vercel Analytics: https://vercel.com/analytics
# - MongoDB Atlas Monitoring: Atlas dashboard
# - Uptime monitoring: UptimeRobot, Pingdom

# Emergency Response:
# 1. Check status pages of all services
# 2. Review recent deployments and changes
# 3. Check error logs and monitoring alerts
# 4. Implement temporary fixes if needed
# 5. Communicate with users about issues
```

---

## 📚 Additional Resources

### Documentation Links
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [React Documentation](https://reactjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)

### Best Practices Guides
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Web Security Guidelines](https://owasp.org/www-project-top-ten/)

### Tools and Services
- **Monitoring**: Sentry, LogRocket, New Relic
- **Analytics**: Google Analytics, Mixpanel, Amplitude
- **Performance**: Lighthouse, WebPageTest, GTmetrix
- **Security**: Snyk, OWASP ZAP, Security Headers

---

## 🎯 Post-Deployment Checklist

### Immediate Actions (Day 1)
- [ ] Verify all environment variables are set correctly
- [ ] Test all critical user flows (registration, login, product browsing, checkout)
- [ ] Check admin panel functionality
- [ ] Verify payment processing works
- [ ] Test file upload functionality
- [ ] Monitor error logs for any issues

### Week 1 Actions
- [ ] Set up monitoring and alerting
- [ ] Configure backup procedures
- [ ] Implement analytics tracking
- [ ] Performance optimization review
- [ ] Security audit and penetration testing
- [ ] Load testing with expected traffic

### Ongoing Maintenance
- [ ] Regular security updates
- [ ] Database performance monitoring
- [ ] Backup verification
- [ ] User feedback analysis
- [ ] Performance metrics review
- [ ] Cost optimization review

---

**🚀 Congratulations!** You now have a comprehensive production environment setup guide for ViralDeals.online. Follow this guide step-by-step to ensure a secure, performant, and maintainable production deployment.

For additional support or questions, refer to the troubleshooting section or contact the development team.
