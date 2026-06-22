/**
 * frontend/src/services/inventarioService.js
 */
import api from './api';

export const inventarioService = {
  listar: (params) => api.get('/inventario', { params }).then((r) => r.data),
  obtener: (id) => api.get(`/inventario/${id}`).then((r) => r.data),
  crear: (data) => api.post('/inventario', data).then((r) => r.data),
  actualizar: (id, data) => api.put(`/inventario/${id}`, data).then((r) => r.data),
  eliminar: (id) => api.delete(`/inventario/${id}`).then((r) => r.data),
  movimiento: (data) => api.post('/inventario/movimientos', data).then((r) => r.data),
  alertas: () => api.get('/inventario/alertas/stock-bajo').then((r) => r.data),
  proveedores: () => api.get('/inventario/proveedores/all').then((r) => r.data),
};
