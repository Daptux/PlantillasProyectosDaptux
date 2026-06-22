/**
 * frontend/src/services/odontologosService.js
 */
import api from './api';

export const odontologosService = {
  listar: () => api.get('/odontologos').then((r) => r.data),
  listarPublicos: () => api.get('/odontologos/publicos').then((r) => r.data),
  obtener: (id) => api.get(`/odontologos/${id}`).then((r) => r.data),
  crear: (data) => api.post('/odontologos', data).then((r) => r.data),
  actualizar: (id, data) => api.put(`/odontologos/${id}`, data).then((r) => r.data),
  eliminar: (id) => api.delete(`/odontologos/${id}`).then((r) => r.data),
  especialidades: () => api.get('/odontologos/especialidades/all').then((r) => r.data),
};
