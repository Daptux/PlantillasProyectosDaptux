// frontend/src/services/pacientesService.js
import api from './api';

export const pacientesService = {
  listar: (buscar) => api.get('/pacientes', { params: buscar ? { buscar } : {} }),
  obtener: (id) => api.get(`/pacientes/${id}`),
  crear: (data) => api.post('/pacientes', data),
  actualizar: (id, data) => api.put(`/pacientes/${id}`, data),
  eliminar: (id) => api.delete(`/pacientes/${id}`),
};
