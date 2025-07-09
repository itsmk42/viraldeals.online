import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { performance } from 'perf_hooks';

// Performance benchmark utilities
class PerformanceBenchmark {
  constructor(name) {
    this.name = name;
    this.measurements = [];
  }

  start() {
    this.startTime = performance.now();
  }

  end() {
    if (!this.startTime) {
      throw new Error('Benchmark not started');
    }
    
    const duration = performance.now() - this.startTime;
    this.measurements.push(duration);
    this.startTime = null;
    return duration;
  }

  getStats() {
    if (this.measurements.length === 0) {
      return null;
    }

    const sorted = [...this.measurements].sort((a, b) => a - b);
    const sum = this.measurements.reduce((a, b) => a + b, 0);

    return {
      count: this.measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / this.measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  reset() {
    this.measurements = [];
  }
}

// Mock data generators
const generateMockProducts = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `product-${i}`,
    name: `Product ${i}`,
    price: Math.floor(Math.random() * 1000) + 100,
    images: [{ url: `/image-${i}.jpg` }],
    rating: { average: Math.random() * 5, count: Math.floor(Math.random() * 100) },
    stock: Math.floor(Math.random() * 50),
    category: `Category ${i % 10}`,
    brand: `Brand ${i % 5}`,
  }));
};

const generateMockApiResponse = (products, page = 1, limit = 12) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedProducts = products.slice(start, end);

  return {
    data: {
      products: paginatedProducts,
      page,
      pages: Math.ceil(products.length / limit),
      total: products.length,
      count: paginatedProducts.length,
    },
  };
};

describe('Performance Benchmarks', () => {
  let benchmark;

  beforeAll(() => {
    // Warm up
    for (let i = 0; i < 10; i++) {
      generateMockProducts(100);
    }
  });

  afterAll(() => {
    if (benchmark) {
      const stats = benchmark.getStats();
      if (stats) {
        console.log(`\n${benchmark.name} Performance Stats:`);
        console.log(`  Runs: ${stats.count}`);
        console.log(`  Mean: ${stats.mean.toFixed(2)}ms`);
        console.log(`  Median: ${stats.median.toFixed(2)}ms`);
        console.log(`  Min: ${stats.min.toFixed(2)}ms`);
        console.log(`  Max: ${stats.max.toFixed(2)}ms`);
        console.log(`  P95: ${stats.p95.toFixed(2)}ms`);
        console.log(`  P99: ${stats.p99.toFixed(2)}ms`);
      }
    }
  });

  describe('Data Generation Performance', () => {
    it('should generate 1000 products quickly', () => {
      benchmark = new PerformanceBenchmark('Generate 1000 Products');

      for (let i = 0; i < 10; i++) {
        benchmark.start();
        const products = generateMockProducts(1000);
        benchmark.end();

        expect(products).toHaveLength(1000);
        expect(products[0]).toHaveProperty('_id');
        expect(products[0]).toHaveProperty('name');
        expect(products[0]).toHaveProperty('price');
      }

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(50); // Should take less than 50ms on average
      expect(stats.p95).toBeLessThan(100); // 95% should be under 100ms
    });

    it('should handle large datasets efficiently', () => {
      benchmark = new PerformanceBenchmark('Generate 10000 Products');

      for (let i = 0; i < 5; i++) {
        benchmark.start();
        const products = generateMockProducts(10000);
        benchmark.end();

        expect(products).toHaveLength(10000);
      }

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(500); // Should take less than 500ms on average
    });
  });

  describe('API Response Processing', () => {
    let largeProductSet;

    beforeAll(() => {
      largeProductSet = generateMockProducts(10000);
    });

    it('should paginate large datasets quickly', () => {
      benchmark = new PerformanceBenchmark('Paginate 10000 Products');

      for (let page = 1; page <= 10; page++) {
        benchmark.start();
        const response = generateMockApiResponse(largeProductSet, page, 12);
        benchmark.end();

        expect(response.data.products).toHaveLength(12);
        expect(response.data.page).toBe(page);
        expect(response.data.total).toBe(10000);
      }

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(10); // Should take less than 10ms on average
    });

    it('should handle different page sizes efficiently', () => {
      benchmark = new PerformanceBenchmark('Variable Page Sizes');

      const pageSizes = [12, 24, 48, 96];

      pageSizes.forEach(pageSize => {
        for (let i = 0; i < 5; i++) {
          benchmark.start();
          const response = generateMockApiResponse(largeProductSet, 1, pageSize);
          benchmark.end();

          expect(response.data.products).toHaveLength(pageSize);
        }
      });

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(15); // Should scale well with page size
    });
  });

  describe('Filtering and Sorting Performance', () => {
    let products;

    beforeAll(() => {
      products = generateMockProducts(5000);
    });

    it('should filter products by category quickly', () => {
      benchmark = new PerformanceBenchmark('Filter by Category');

      for (let i = 0; i < 20; i++) {
        const targetCategory = `Category ${i % 10}`;
        
        benchmark.start();
        const filtered = products.filter(p => p.category === targetCategory);
        benchmark.end();

        expect(filtered.length).toBeGreaterThan(0);
        expect(filtered.every(p => p.category === targetCategory)).toBe(true);
      }

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(20); // Should take less than 20ms on average
    });

    it('should sort products by price efficiently', () => {
      benchmark = new PerformanceBenchmark('Sort by Price');

      for (let i = 0; i < 10; i++) {
        benchmark.start();
        const sorted = [...products].sort((a, b) => a.price - b.price);
        benchmark.end();

        expect(sorted).toHaveLength(products.length);
        expect(sorted[0].price).toBeLessThanOrEqual(sorted[1].price);
        expect(sorted[sorted.length - 2].price).toBeLessThanOrEqual(sorted[sorted.length - 1].price);
      }

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(50); // Should take less than 50ms on average
    });

    it('should handle complex filtering efficiently', () => {
      benchmark = new PerformanceBenchmark('Complex Filtering');

      for (let i = 0; i < 10; i++) {
        benchmark.start();
        const filtered = products.filter(p => 
          p.price > 200 && 
          p.price < 800 && 
          p.rating.average > 3.0 && 
          p.stock > 0
        );
        benchmark.end();

        expect(Array.isArray(filtered)).toBe(true);
      }

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(30); // Should handle complex filters quickly
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks with large datasets', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate and process large datasets
      for (let i = 0; i < 100; i++) {
        const products = generateMockProducts(1000);
        const filtered = products.filter(p => p.price > 500);
        const sorted = filtered.sort((a, b) => a.price - b.price);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Cache Performance Simulation', () => {
    it('should simulate cache hit performance', () => {
      benchmark = new PerformanceBenchmark('Cache Hit Simulation');
      
      const cache = new Map();
      const products = generateMockProducts(1000);
      
      // Populate cache
      products.forEach(product => {
        cache.set(product._id, product);
      });

      // Simulate cache hits
      for (let i = 0; i < 100; i++) {
        const randomId = `product-${Math.floor(Math.random() * 1000)}`;
        
        benchmark.start();
        const cachedProduct = cache.get(randomId);
        benchmark.end();

        if (cachedProduct) {
          expect(cachedProduct._id).toBe(randomId);
        }
      }

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(1); // Cache hits should be very fast
    });

    it('should simulate cache miss performance', () => {
      benchmark = new PerformanceBenchmark('Cache Miss Simulation');
      
      const cache = new Map();
      const products = generateMockProducts(1000);

      // Simulate cache misses and database lookups
      for (let i = 0; i < 50; i++) {
        const randomId = `product-${i + 1000}`; // ID not in cache
        
        benchmark.start();
        let product = cache.get(randomId);
        if (!product) {
          // Simulate database lookup
          product = products.find(p => p._id === randomId) || generateMockProducts(1)[0];
          cache.set(randomId, product);
        }
        benchmark.end();

        expect(product).toBeDefined();
      }

      const stats = benchmark.getStats();
      expect(stats.mean).toBeLessThan(10); // Cache misses should still be reasonably fast
    });
  });
});
