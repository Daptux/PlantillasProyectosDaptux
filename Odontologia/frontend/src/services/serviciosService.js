/**
 * frontend/src/services/serviciosService.js
 */
import api from './api';

export const serviciosService = {
  listar: () => api.get('/servicios').then((r) => r.data),
  listarPublicos: () => api.get('/servicios/publicos').then((r) => r.data),
  obtener: (id) => api.get(`/servicios/${id}`).then((r) => r.data),
  crear: (data) => api.post('/servicios', data).then((r) => r.data),
  actualizar: (id, data) => api.put(`/servicios/${id}`, data).then((r) => r.data),
  eliminar: (id) => api.delete(`/servicios/${id}`).then((r) => r.data),
};
