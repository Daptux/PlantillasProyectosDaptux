/**
 * frontend/src/services/pacientesService.js
 */
import api from './api';

export const pacientesService = {
  listar: (params) => api.get('/pacientes', { params }).then((r) => r.data),
  obtener: (id) => api.get(`/pacientes/${id}`).then((r) => r.data),
  crear: (data) => api.post('/pacientes', data).then((r) => r.data),
  actualizar: (id, data) => api.put(`/pacientes/${id}`, data).then((r) => r.data),
  eliminar: (id) => api.delete(`/pacientes/${id}`).then((r) => r.data),
};
