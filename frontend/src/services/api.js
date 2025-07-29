import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  addAddress: (addressData) => api.post('/auth/address', addressData),
  updateAddress: (addressId, addressData) => api.put(`/auth/address/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/auth/address/${addressId}`),
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products?${queryString}`);
  },
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: (limit = 8) => api.get(`/products/featured?limit=${limit}`),
  getCategories: () => api.get('/products/categories'),
  addReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
  getReviews: (productId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products/${productId}/reviews?${queryString}`);
  },
};

// Orders API (to be implemented)
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders?${queryString}`);
  },
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  exportAnalytics: (params) => api.get('/admin/analytics/export', { params, responseType: 'blob' }),

  // Products
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getLowStockProducts: (threshold = 10) => api.get(`/products/admin/low-stock?threshold=${threshold}`),
  bulkUpdateStock: (updates) => api.post('/products/admin/bulk-update-stock', { updates }),

  // Product Reviews (Admin)
  addAdminReview: (productId, reviewData) => api.post(`/products/${productId}/admin/reviews`, reviewData),
  updateAdminReview: (productId, reviewId, reviewData) => api.put(`/products/${productId}/admin/reviews/${reviewId}`, reviewData),
  deleteAdminReview: (productId, reviewId) => api.delete(`/products/${productId}/admin/reviews/${reviewId}`),

  // Orders
  getAllOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/orders?${queryString}`);
  },
  updateOrder: (id, orderData) => api.put(`/admin/orders/${id}/status`, orderData),

  // Users
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${queryString}`);
  },
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settingsData) => api.put('/admin/settings', settingsData),
};

export default api;
