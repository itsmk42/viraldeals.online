import { calculateGST, formatIndianCurrency } from '../utils/indianFeatures.js';

describe('Basic Utility Functions', () => {
  describe('calculateGST', () => {
    it('should calculate GST correctly', () => {
      expect(calculateGST(1000, 18)).toBe(180);
      expect(calculateGST(500, 12)).toBe(60);
      expect(calculateGST(0, 18)).toBe(0);
    });

    it('should use default rate of 18%', () => {
      expect(calculateGST(1000)).toBe(180);
    });
  });

  describe('formatIndianCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatIndianCurrency(1000)).toBe('₹1,000');
      expect(formatIndianCurrency(100000)).toBe('₹1,00,000');
      expect(formatIndianCurrency(1000000)).toBe('₹10,00,000');
    });

    it('should handle decimal values', () => {
      expect(formatIndianCurrency(1000.50)).toBe('₹1,000.5');
      expect(formatIndianCurrency(999.99)).toBe('₹999.99');
    });
  });

  describe('Environment', () => {
    it('should be in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should have test JWT secret', () => {
      expect(process.env.JWT_SECRET).toBe('test-jwt-secret-key-for-testing-only');
    });
  });
});
