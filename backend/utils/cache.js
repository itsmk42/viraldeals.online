import { createClient } from 'redis';
import NodeCache from 'node-cache';

// Fallback to in-memory cache if Redis is not available
const memoryCache = new NodeCache({ stdTTL: 3600 }); // 1 hour default TTL

class CacheService {
  constructor() {
    this.redisClient = null;
    this.isRedisConnected = false;
    this.initRedis();
  }

  async initRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = createClient({
          url: process.env.REDIS_URL,
          password: process.env.REDIS_PASSWORD || undefined,
          socket: {
            reconnectStrategy: (retries) => Math.min(retries * 50, 500)
          }
        });

        this.redisClient.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isRedisConnected = false;
        });

        this.redisClient.on('connect', () => {
          console.log('Redis Client Connected');
          this.isRedisConnected = true;
        });

        this.redisClient.on('disconnect', () => {
          console.log('Redis Client Disconnected');
          this.isRedisConnected = false;
        });

        await this.redisClient.connect();
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isRedisConnected = false;
    }
  }

  async get(key) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      }
      
      // Fallback to memory cache
      return memoryCache.get(key) || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const serializedValue = JSON.stringify(value);
      const cacheTTL = ttl || parseInt(process.env.CACHE_TTL) || 3600;

      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.setEx(key, cacheTTL, serializedValue);
      } else {
        // Fallback to memory cache
        memoryCache.set(key, value, cacheTTL);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        memoryCache.del(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async flush() {
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.flushAll();
      } else {
        memoryCache.flushAll();
      }
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        return await this.redisClient.exists(key);
      } else {
        return memoryCache.has(key);
      }
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Pattern-based deletion for cache invalidation
  async deletePattern(pattern) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      } else {
        // For memory cache, we need to manually check each key
        const keys = memoryCache.keys();
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        keys.forEach(key => {
          if (regex.test(key)) {
            memoryCache.del(key);
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  // Generate cache keys
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  // Close connections
  async close() {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
      }
    } catch (error) {
      console.error('Error closing cache connections:', error);
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;

// Cache key constants
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: 'product',
  CATEGORIES: 'categories',
  FEATURED_PRODUCTS: 'featured_products',
  USER: 'user',
  ORDERS: 'orders',
  DASHBOARD_STATS: 'dashboard_stats'
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 1800,  // 30 minutes
  LONG: 3600,    // 1 hour
  VERY_LONG: 86400 // 24 hours
};
