import { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '../services/api';

// Query keys
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  featured: (limit) => [...productKeys.all, 'featured', limit],
  categories: () => [...productKeys.all, 'categories'],
  reviews: (productId) => [...productKeys.all, 'reviews', productId],
};

// Get products with filters
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsAPI.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    select: (data) => data.data,
  });
};

// Get infinite products for lazy loading
export const useInfiniteProducts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: [...productKeys.list(filters), 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      productsAPI.getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.data;
      return page < pages ? page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    select: (data) => ({
      pages: data.pages.map(page => page.data),
      pageParams: data.pageParams,
    }),
  });
};

// Get single product
export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsAPI.getProduct(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
    select: (data) => data.data.product,
  });
};

// Get featured products
export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => productsAPI.getFeaturedProducts(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    select: (data) => data.data.products,
  });
};

// Get categories
export const useCategories = () => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productsAPI.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    select: (data) => data.data.categories,
  });
};

// Get product reviews
export const useProductReviews = (productId, params = {}) => {
  return useQuery({
    queryKey: productKeys.reviews(productId),
    queryFn: () => productsAPI.getReviews(productId, params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    enabled: !!productId,
    select: (data) => data.data,
  });
};

// Add product review mutation
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reviewData }) => 
      productsAPI.addReview(productId, reviewData),
    onSuccess: (data, { productId }) => {
      // Invalidate and refetch product details and reviews
      queryClient.invalidateQueries(productKeys.detail(productId));
      queryClient.invalidateQueries(productKeys.reviews(productId));
      queryClient.invalidateQueries(productKeys.lists());
    },
  });
};

// Prefetch product
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return (id) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => productsAPI.getProduct(id),
      staleTime: 10 * 60 * 1000,
    });
  };
};

// Custom hook for search with debouncing
export const useProductSearch = (searchTerm, delay = 300) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return useProducts({ search: debouncedSearchTerm });
};

// Optimistic updates for cart-related actions
export const useOptimisticProductUpdate = () => {
  const queryClient = useQueryClient();

  const updateProductStock = (productId, stockChange) => {
    queryClient.setQueryData(
      productKeys.detail(productId),
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          stock: Math.max(0, oldData.stock + stockChange),
        };
      }
    );

    // Also update in product lists
    queryClient.setQueriesData(
      productKeys.lists(),
      (oldData) => {
        if (!oldData?.products) return oldData;
        return {
          ...oldData,
          products: oldData.products.map(product =>
            product._id === productId
              ? { ...product, stock: Math.max(0, product.stock + stockChange) }
              : product
          ),
        };
      }
    );
  };

  return { updateProductStock };
};
