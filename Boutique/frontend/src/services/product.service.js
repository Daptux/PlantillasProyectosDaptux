import api from './api.js';

export const productService = {
  list: (params = {}) => api.get('/products', { params }).then((r) => r.data),
  get: (idOrSlug) => api.get(`/products/${idOrSlug}`).then((r) => r.data),
  filters: () => api.get('/products/meta/filters').then((r) => r.data),

  // Admin
  create: (data) => api.post('/products', data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  uploadImages: (id, formData) =>
    api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteImage: (imageId) => api.delete(`/products/images/${imageId}`).then((r) => r.data),
  addVariant: (id, data) => api.post(`/products/${id}/variants`, data).then((r) => r.data),
  updateVariant: (variantId, data) => api.put(`/products/variants/${variantId}`, data).then((r) => r.data),
  deleteVariant: (variantId) => api.delete(`/products/variants/${variantId}`).then((r) => r.data),
};

export const categoryService = {
  list: (all = false) => api.get('/categories', { params: all ? { all: 1 } : {} }).then((r) => r.data),
  create: (data) => api.post('/categories', data).then((r) => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const brandService = {
  list: (all = false) => api.get('/brands', { params: all ? { all: 1 } : {} }).then((r) => r.data),
  create: (data) => api.post('/brands', data).then((r) => r.data),
  update: (id, data) => api.put(`/brands/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/brands/${id}`).then((r) => r.data),
};

export const favoriteService = {
  list: () => api.get('/favorites').then((r) => r.data),
  ids: () => api.get('/favorites/ids').then((r) => r.data),
  toggle: (productId) => api.post(`/favorites/${productId}`).then((r) => r.data),
};
