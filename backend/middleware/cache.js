import cacheService from '../utils/cache.js';

// Generic cache middleware
export const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      // Generate cache key based on request
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data.success !== false) {
          cacheService.set(cacheKey, data, ttl)
            .then(() => console.log(`Cached data for key: ${cacheKey}`))
            .catch(err => console.error('Cache set error:', err));
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Simple cache middleware that takes TTL as string (e.g. '1h', '30m', '1d')
export const cache = (ttl) => {
  const ttlInSeconds = parseTTL(ttl);
  return cacheMiddleware(
    (req) => cacheService.generateKey(req.originalUrl),
    ttlInSeconds
  );
};

// Helper to parse TTL string to seconds
function parseTTL(ttl) {
  const units = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };
  
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid TTL format. Use format: number + unit (s/m/h/d). Example: "1h", "30m", "1d"');
  }
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

// Products cache middleware
export const productsCacheMiddleware = cacheMiddleware(
  (req) => {
    const params = new URLSearchParams(req.query).toString();
    return cacheService.generateKey('products', params || 'all');
  },
  1800 // 30 minutes
);

// Single product cache middleware
export const productCacheMiddleware = cacheMiddleware(
  (req) => cacheService.generateKey('product', req.params.id),
  3600 // 1 hour
);

// Categories cache middleware
export const categoriesCacheMiddleware = cacheMiddleware(
  () => cacheService.generateKey('categories', 'active'),
  3600 // 1 hour instead of 2 hours since we've optimized the query
);

// Featured products cache middleware
export const featuredProductsCacheMiddleware = cacheMiddleware(
  (req) => cacheService.generateKey('featured_products', req.query.limit || '8'),
  1800 // 30 minutes
);

// User orders cache middleware
export const userOrdersCacheMiddleware = cacheMiddleware(
  (req) => {
    const params = new URLSearchParams(req.query).toString();
    return cacheService.generateKey('user_orders', req.user._id, params || 'all');
  },
  600 // 10 minutes
);

// Dashboard stats cache middleware
export const dashboardCacheMiddleware = cacheMiddleware(
  () => cacheService.generateKey('dashboard_stats'),
  300 // 5 minutes
);

// Cache invalidation middleware
export const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    const invalidatePatterns = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const pattern of patterns) {
          try {
            const patternKey = typeof pattern === 'function' ? pattern(req) : pattern;
            await cacheService.deletePattern(patternKey);
            console.log(`Invalidated cache pattern: ${patternKey}`);
          } catch (error) {
            console.error('Cache invalidation error:', error);
          }
        }
      }
    };

    // Override response methods
    res.json = function(data) {
      invalidatePatterns();
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      invalidatePatterns();
      return originalSend.call(this, data);
    };

    next();
  };
};

// Specific cache invalidation patterns
export const invalidateProductCache = invalidateCache([
  'products:*',
  'featured_products:*',
  'categories'
]);

export const invalidateUserCache = invalidateCache([
  (req) => `user:${req.user._id}:*`,
  (req) => `user_orders:${req.user._id}:*`
]);

export const invalidateOrderCache = invalidateCache([
  'dashboard_stats',
  (req) => `user_orders:${req.user._id}:*`
]);

// Response compression middleware
export const compressionMiddleware = (req, res, next) => {
  // Set compression headers
  res.set({
    'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
    'Vary': 'Accept-Encoding'
  });
  
  next();
};
