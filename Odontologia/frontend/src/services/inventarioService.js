// frontend/src/services/inventarioService.js
import api from './api';

export const inventarioService = {
  listar: (params) => api.get('/inventario', { params }),
  obtener: (id) => api.get(`/inventario/${id}`),
  crear: (data) => api.post('/inventario', data),
  actualizar: (id, data) => api.put(`/inventario/${id}`, data),
  eliminar: (id) => api.delete(`/inventario/${id}`),
  registrarMovimiento: (data) => api.post('/inventario/movimientos', data),
  alertas: () => api.get('/inventario/alertas/stock-bajo'),
};
