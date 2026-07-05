import api from "./axios";

// ════════════════════════════════════════════════
// AUTH API
// ════════════════════════════════════════════════
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
};

// ════════════════════════════════════════════════
// PRODUCTS API
// ════════════════════════════════════════════════
export const productsAPI = {
  getAll: (params) => api.get("/api/v1/products", { params }),
  getById: (id) => api.get(`/api/v1/products/${id}`),
  
  // Updated: takes text params separately from images
  create: (textParams, imageFormData) => {
    return api.post("/api/v1/products", imageFormData, {
      params: textParams,  // axios will add these as query string
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  
  update: (id, data) => api.put(`/api/v1/products/${id}`, data),
  updateImages: (id, formData) => api.put(`/api/v1/products/${id}/images`, formData),
  delete: (id) => api.delete(`/api/v1/products/${id}`),
};
// ════════════════════════════════════════════════
// CART API
// ════════════════════════════════════════════════
export const cartAPI = {
  get: () => api.get("/api/v1/cart"),
  add: (productId, quantity = 1) =>
    api.post(`/api/v1/cart/add?productId=${productId}&quantity=${quantity}`),
  remove: (productId) =>
    api.delete(`/api/v1/cart/remove?productId=${productId}`),
  clear: () => api.delete("/api/v1/cart/clear"),
};

// ════════════════════════════════════════════════
// ORDERS API
// ════════════════════════════════════════════════
export const ordersAPI = {
  getAll: () => api.get("/api/v1/orders"),
  getById: (id) => api.get(`/api/v1/orders/${id}`),
  checkout: (data) => api.post("/api/v1/orders/checkout", data),
  cancel: (orderId) =>
    api.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "Cancelled" }),
};

// ════════════════════════════════════════════════
// PAYMENTS API
// ════════════════════════════════════════════════
export const paymentsAPI = {
  initialize: (data) => api.post("/api/v1/payments/initialize", data),
  verify: (reference) => api.get(`/api/v1/payments/verify/${reference}`),
};

// ════════════════════════════════════════════════
// ADMIN API
// ════════════════════════════════════════════════
export const adminAPI = {
  getAllOrders: () => api.get("/api/v1/admin/orders"),
  getOrderById: (id) => api.get(`/api/v1/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.patch(`/api/v1/admin/orders/${id}/status`, { status }),
  getOrderStats: () => api.get("/api/v1/admin/orders/stats"),
};

export default api;