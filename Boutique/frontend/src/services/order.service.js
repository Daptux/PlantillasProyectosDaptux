import api from './api.js';

export const orderService = {
  create: (data) => api.post('/orders', data).then((r) => r.data),
  myOrders: () => api.get('/orders/my-orders').then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  validateCoupon: (codigo, subtotal) =>
    api.post('/coupons/validate', { codigo, subtotal }).then((r) => r.data),
};
