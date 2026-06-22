/**
 * frontend/src/services/citasService.js
 */
import api from './api';

export const citasService = {
  listar: (params) => api.get('/citas', { params }).then((r) => r.data),
  obtener: (id) => api.get(`/citas/${id}`).then((r) => r.data),
  crear: (data) => api.post('/citas', data).then((r) => r.data),
  actualizar: (id, data) => api.put(`/citas/${id}`, data).then((r) => r.data),
  cambiarEstado: (id, estado) => api.patch(`/citas/${id}/estado`, { estado }).then((r) => r.data),
  eliminar: (id) => api.delete(`/citas/${id}`).then((r) => r.data),
  // Público (landing)
  solicitar: (data) => api.post('/citas/solicitud', data).then((r) => r.data),
};
