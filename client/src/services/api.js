const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const getAuthToken = () => {
  return localStorage.getItem('kg_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('kg_token', token);
  } else {
    localStorage.removeItem('kg_token');
  }
};

export const getAdminToken = () => {
  return localStorage.getItem('kg_admin_token') || localStorage.getItem('kg_token');
};

export const setAdminToken = (token) => {
  if (token) {
    localStorage.setItem('kg_admin_token', token);
  } else {
    localStorage.removeItem('kg_admin_token');
  }
};

export async function fetchApi(endpoint, options = {}, isAdmin = false) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

  const token = isAdmin ? getAdminToken() : getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.response = { data, status: response.status };
    throw err;
  }

  return data;
}

export const api = {
  // ----------------- CUSTOMER AUTH -----------------
  login: (email, password) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (full_name, email, password, phone) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify({ full_name, email, password, phone }) }),
  getMe: () => fetchApi('/auth/me'),
  updateProfile: (full_name, phone) => fetchApi('/auth/profile', { method: 'PUT', body: JSON.stringify({ full_name, phone }) }),
  changePassword: (current_password, new_password) => fetchApi('/auth/change-password', { method: 'PUT', body: JSON.stringify({ current_password, new_password }) }),
  forgotPassword: (email) => fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, new_password) => fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, new_password }) }),

  // ----------------- ADDRESSES (PAKISTAN) -----------------
  getAddresses: () => fetchApi('/addresses'),
  createAddress: (addr) => fetchApi('/addresses', { method: 'POST', body: JSON.stringify(addr) }),
  updateAddress: (id, addr) => fetchApi(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(addr) }),
  deleteAddress: (id) => fetchApi(`/addresses/${id}`, { method: 'DELETE' }),

  // ----------------- PUBLIC CATALOG -----------------
  getCategories: () => fetchApi('/categories'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return fetchApi(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getProduct: (idOrSlug) => fetchApi(`/products/${idOrSlug}`),
  submitReview: (productId, reviewData) => fetchApi(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }),
  notifyStock: (productId, data) => fetchApi(`/products/${productId}/notify-stock`, { method: 'POST', body: JSON.stringify(data) }),

  // ----------------- WISHLIST -----------------
  getWishlist: () => fetchApi('/wishlist'),
  toggleWishlist: (productId) => fetchApi('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),

  // ----------------- COUPONS -----------------
  validateCoupon: (code, subtotal) => fetchApi('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),

  // ----------------- ORDERS & TRACKING -----------------
  createOrder: (orderData) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getUserOrders: () => fetchApi('/orders/user'),
  trackOrder: (orderNumber) => fetchApi(`/orders/track/${encodeURIComponent(orderNumber)}`),
  getOrder: (id) => fetchApi(`/orders/${id}`),

  // ----------------- RETURNS & EXCHANGES -----------------
  submitReturn: (returnData) => fetchApi('/returns', { method: 'POST', body: JSON.stringify(returnData) }),
  getUserReturns: () => fetchApi('/returns/user'),

  // ----------------- SETTINGS, CONTACT, NEWSLETTER -----------------
  getSettings: () => fetchApi('/settings'),
  submitContact: (data) => fetchApi('/contact', { method: 'POST', body: JSON.stringify(data) }),
  subscribeNewsletter: (email) => fetchApi('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),

  // =================================================================
  // ====================== ADMIN MANAGEMENT API =====================
  // =================================================================
  adminLogin: (email, password) => fetchApi('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getAdminMe: () => fetchApi('/admin/me', {}, true),
  getAdminDashboardStats: () => fetchApi('/admin/dashboard/stats', {}, true),
  getAdminProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return fetchApi(`/admin/products${qs ? `?${qs}` : ''}`, {}, true);
  },
  getAdminProduct: (id) => fetchApi(`/admin/products/${id}`, {}, true),
  createAdminProduct: (data) => fetchApi('/admin/products', { method: 'POST', body: JSON.stringify(data) }, true),
  updateAdminProduct: (id, data) => fetchApi(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  deleteAdminProduct: (id) => fetchApi(`/admin/products/${id}`, { method: 'DELETE' }, true),
  getAdminCategories: () => fetchApi('/admin/categories', {}, true),
  createAdminCategory: (data) => fetchApi('/admin/categories', { method: 'POST', body: JSON.stringify(data) }, true),
  updateAdminCategory: (id, data) => fetchApi(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  deleteAdminCategory: (id) => fetchApi(`/admin/categories/${id}`, { method: 'DELETE' }, true),
  getAdminSizes: () => fetchApi('/admin/attributes/sizes', {}, true),
  createAdminSize: (data) => fetchApi('/admin/attributes/sizes', { method: 'POST', body: JSON.stringify(data) }, true),
  deleteAdminSize: (id) => fetchApi(`/admin/attributes/sizes/${id}`, { method: 'DELETE' }, true),
  getAdminColors: () => fetchApi('/admin/attributes/colors', {}, true),
  createAdminColor: (data) => fetchApi('/admin/attributes/colors', { method: 'POST', body: JSON.stringify(data) }, true),
  deleteAdminColor: (id) => fetchApi(`/admin/attributes/colors/${id}`, { method: 'DELETE' }, true),
  getAdminInventory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/admin/inventory${query ? `?${query}` : ''}`, {}, true);
  },
  updateAdminStock: (productId, data) => fetchApi(`/admin/inventory/${productId}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  updateAdminVariantStock: (variantId, data) => fetchApi(`/admin/inventory/variant/${variantId}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/admin/orders${query ? `?${query}` : ''}`, {}, true);
  },
  getAdminOrder: (id) => fetchApi(`/admin/orders/${id}`, {}, true),
  updateAdminOrderStatus: (id, data) => fetchApi(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }, true),
  updateAdminOrderTracking: (id, data) => fetchApi(`/admin/orders/${id}/tracking`, { method: 'PUT', body: JSON.stringify(data) }, true),
  getAdminCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/admin/customers${query ? `?${query}` : ''}`, {}, true);
  },
  getAdminCustomer: (id) => fetchApi(`/admin/customers/${id}`, {}, true),
  getAdminCoupons: () => fetchApi('/admin/coupons', {}, true),
  createAdminCoupon: (data) => fetchApi('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }, true),
  updateAdminCoupon: (id, data) => fetchApi(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  toggleAdminCoupon: (id) => fetchApi(`/admin/coupons/${id}/toggle`, { method: 'PATCH' }, true),
  deleteAdminCoupon: (id) => fetchApi(`/admin/coupons/${id}`, { method: 'DELETE' }, true),
  getAdminReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/admin/reviews${query ? `?${query}` : ''}`, {}, true);
  },
  updateAdminReviewStatus: (id, data) => fetchApi(`/admin/reviews/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }, true),
  deleteAdminReview: (id) => fetchApi(`/admin/reviews/${id}`, { method: 'DELETE' }, true),
  getAdminReturns: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/admin/returns${query ? `?${query}` : ''}`, {}, true);
  },
  updateAdminReturnStatus: (id, data) => fetchApi(`/admin/returns/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }, true),
  getAdminSettings: () => fetchApi('/admin/settings', {}, true),
  updateAdminSettings: (data) => fetchApi('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }, true),
  uploadImage: (fileOrFormData) => {
    let body;
    if (fileOrFormData instanceof FormData) {
      body = fileOrFormData;
    } else {
      body = new FormData();
      body.append('image', fileOrFormData);
    }
    return fetchApi('/admin/upload-image', { method: 'POST', body }, true);
  }
};

// Convenient Axios-like wrapper for Admin Pages that expect `res.data`
const wrapData = async (promise) => {
  const result = await promise;
  return { data: result };
};

export const adminApi = {
  // Products
  getProducts: (params) => wrapData(api.getAdminProducts(params)),
  getProduct: (id) => wrapData(api.getAdminProduct(id)),
  createProduct: (data) => wrapData(api.createAdminProduct(data)),
  updateProduct: (id, data) => wrapData(api.updateAdminProduct(id, data)),
  deleteProduct: (id) => wrapData(api.deleteAdminProduct(id)),

  // Categories
  getCategories: () => wrapData(api.getAdminCategories()),
  createCategory: (data) => wrapData(api.createAdminCategory(data)),
  updateCategory: (id, data) => wrapData(api.updateAdminCategory(id, data)),
  deleteCategory: (id) => wrapData(api.deleteAdminCategory(id)),

  // Attributes (Sizes & Colors)
  getAttributes: async () => {
    const [sizesRes, colorsRes] = await Promise.all([
      api.getAdminSizes(),
      api.getAdminColors()
    ]);
    return { data: { sizes: sizesRes.sizes || [], colors: colorsRes.colors || [] } };
  },
  addSize: (data) => wrapData(api.createAdminSize(data)),
  deleteSize: (id) => wrapData(api.deleteAdminSize(id)),
  addColor: (data) => wrapData(api.createAdminColor(data)),
  deleteColor: (id) => wrapData(api.deleteAdminColor(id)),

  // Inventory
  getInventory: (params) => wrapData(api.getAdminInventory(params)),
  updateProductStock: (id, stock) => wrapData(api.updateAdminStock(id, { stock })),

  // Orders
  getOrders: (params) => wrapData(api.getAdminOrders(params)),
  getOrder: (id) => wrapData(api.getAdminOrder(id)),
  updateOrderStatus: (id, data) => wrapData(api.updateAdminOrderStatus(id, data)),

  // Customers
  getCustomers: (params) => wrapData(api.getAdminCustomers(params)),
  getCustomerOrders: (id) => wrapData(api.getAdminCustomer(id)),

  // Coupons
  getCoupons: () => wrapData(api.getAdminCoupons()),
  createCoupon: (data) => wrapData(api.createAdminCoupon(data)),
  updateCoupon: (id, data) => wrapData(api.updateAdminCoupon(id, data)),
  deleteCoupon: (id) => wrapData(api.deleteAdminCoupon(id)),

  // Reviews
  getReviews: (params) => wrapData(api.getAdminReviews(params)),
  updateReviewStatus: (id, status) => wrapData(api.updateAdminReviewStatus(id, { status })),
  deleteReview: (id) => wrapData(api.deleteAdminReview(id)),

  // Returns
  getReturns: (params) => wrapData(api.getAdminReturns(params)),
  updateReturnStatus: (id, data) => wrapData(api.updateAdminReturnStatus(id, data)),

  // Settings
  getSettings: () => wrapData(api.getAdminSettings()),
  updateSettings: (data) => wrapData(api.updateAdminSettings(data)),

  // Image Upload
  uploadImage: (fileOrFormData) => wrapData(api.uploadImage(fileOrFormData))
};

export default api;
