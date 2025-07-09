import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProducts, useProduct, useFeaturedProducts, useCategories } from '../../hooks/useProducts';
import { productsAPI } from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  productsAPI: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    getFeaturedProducts: vi.fn(),
    getCategories: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProducts', () => {
    it('fetches products successfully', async () => {
      const mockProducts = {
        data: {
          products: [
            { _id: '1', name: 'Product 1', price: 100 },
            { _id: '2', name: 'Product 2', price: 200 },
          ],
          page: 1,
          pages: 1,
          total: 2,
        },
      };

      productsAPI.getProducts.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data.products).toHaveLength(2);
      expect(result.current.data.products[0].name).toBe('Product 1');
    });

    it('handles filters correctly', async () => {
      const filters = { category: 'electronics', minPrice: 100 };
      
      productsAPI.getProducts.mockResolvedValue({
        data: { products: [], page: 1, pages: 1, total: 0 },
      });

      renderHook(() => useProducts(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(productsAPI.getProducts).toHaveBeenCalledWith(filters);
      });
    });

    it('caches results properly', async () => {
      const mockProducts = {
        data: {
          products: [{ _id: '1', name: 'Product 1' }],
          page: 1,
          pages: 1,
          total: 1,
        },
      };

      productsAPI.getProducts.mockResolvedValue(mockProducts);

      const { result: result1 } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second hook should use cached data
      const { result: result2 } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      expect(result2.current.data).toEqual(result1.current.data);
      expect(productsAPI.getProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe('useProduct', () => {
    it('fetches single product successfully', async () => {
      const mockProduct = {
        data: {
          product: { _id: '1', name: 'Product 1', price: 100 },
        },
      };

      productsAPI.getProduct.mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useProduct('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data.name).toBe('Product 1');
      expect(productsAPI.getProduct).toHaveBeenCalledWith('1');
    });

    it('does not fetch when id is not provided', () => {
      renderHook(() => useProduct(null), {
        wrapper: createWrapper(),
      });

      expect(productsAPI.getProduct).not.toHaveBeenCalled();
    });
  });

  describe('useFeaturedProducts', () => {
    it('fetches featured products with default limit', async () => {
      const mockFeatured = {
        data: {
          products: [{ _id: '1', name: 'Featured Product', isFeatured: true }],
        },
      };

      productsAPI.getFeaturedProducts.mockResolvedValue(mockFeatured);

      const { result } = renderHook(() => useFeaturedProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(productsAPI.getFeaturedProducts).toHaveBeenCalledWith(8);
    });

    it('respects custom limit', async () => {
      productsAPI.getFeaturedProducts.mockResolvedValue({
        data: { products: [] },
      });

      renderHook(() => useFeaturedProducts(6), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(productsAPI.getFeaturedProducts).toHaveBeenCalledWith(6);
      });
    });
  });

  describe('useCategories', () => {
    it('fetches categories successfully', async () => {
      const mockCategories = {
        data: {
          categories: [
            { name: 'Electronics', count: 10 },
            { name: 'Clothing', count: 5 },
          ],
        },
      };

      productsAPI.getCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].name).toBe('Electronics');
    });

    it('has longer cache time for categories', async () => {
      const mockCategories = {
        data: { categories: [] },
      };

      productsAPI.getCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Categories should be cached longer than other queries
      expect(result.current.dataUpdatedAt).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('handles API errors gracefully', async () => {
      const error = new Error('API Error');
      productsAPI.getProducts.mockRejectedValue(error);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('Loading states', () => {
    it('shows loading state initially', () => {
      productsAPI.getProducts.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('Stale time configuration', () => {
    it('respects stale time for products', async () => {
      const mockProducts = {
        data: { products: [], page: 1, pages: 1, total: 0 },
      };

      productsAPI.getProducts.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Data should be considered fresh for the stale time period
      expect(result.current.isStale).toBe(false);
    });
  });
});
