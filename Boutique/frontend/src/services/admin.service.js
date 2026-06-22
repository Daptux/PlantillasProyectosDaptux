import api from './api.js';

export const adminService = {
  // Dashboard / reportes
  dashboard: () => api.get('/admin/reports/dashboard').then((r) => r.data),
  sales: (params = {}) => api.get('/admin/reports/sales', { params }).then((r) => r.data),
  bestProducts: () => api.get('/admin/reports/best-products').then((r) => r.data),
  lowStock: () => api.get('/admin/reports/low-stock').then((r) => r.data),
  topCustomers: () => api.get('/admin/reports/top-customers').then((r) => r.data),

  // Pedidos
  orders: (params = {}) => api.get('/admin/orders', { params }).then((r) => r.data),
  orderDetail: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id, estado) => api.put(`/admin/orders/${id}/status`, { estado }).then((r) => r.data),
  updatePaymentStatus: (id, estado_pago) => api.put(`/admin/orders/${id}/payment-status`, { estado_pago }).then((r) => r.data),

  // Clientes
  users: (params = {}) => api.get('/admin/users', { params }).then((r) => r.data),
  userDetail: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data).then((r) => r.data),
  removeUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),

  // Empleados
  employees: () => api.get('/admin/employees').then((r) => r.data),
  createEmployee: (data) => api.post('/admin/employees', data).then((r) => r.data),
  updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data).then((r) => r.data),
  removeEmployee: (id) => api.delete(`/admin/employees/${id}`).then((r) => r.data),

  // Inventario
  inventory: (params = {}) => api.get('/admin/inventory', { params }).then((r) => r.data),
  inventoryLowStock: () => api.get('/admin/inventory/low-stock').then((r) => r.data),
  inventoryMovements: (params = {}) => api.get('/admin/inventory/movements', { params }).then((r) => r.data),
  registerMovement: (data) => api.post('/admin/inventory/movement', data).then((r) => r.data),

  // Cupones
  coupons: () => api.get('/admin/coupons').then((r) => r.data),
  createCoupon: (data) => api.post('/admin/coupons', data).then((r) => r.data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data).then((r) => r.data),
  removeCoupon: (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data),

  // Banners
  banners: () => api.get('/admin/banners').then((r) => r.data),
  createBanner: (data) => api.post('/admin/banners', data).then((r) => r.data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data).then((r) => r.data),
  removeBanner: (id) => api.delete(`/admin/banners/${id}`).then((r) => r.data),

  // Configuración
  getSettings: () => api.get('/settings').then((r) => r.data),
  updateSettings: (data) => api.put('/admin/settings', data).then((r) => r.data),
};
