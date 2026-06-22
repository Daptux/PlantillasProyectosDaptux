import api from './api.js';

export const cartService = {
  get: () => api.get('/cart').then((r) => r.data),
  addItem: (data) => api.post('/cart/items', data).then((r) => r.data),
  updateItem: (id, cantidad) => api.put(`/cart/items/${id}`, { cantidad }).then((r) => r.data),
  removeItem: (id) => api.delete(`/cart/items/${id}`).then((r) => r.data),
  clear: () => api.delete('/cart/clear').then((r) => r.data),
};
