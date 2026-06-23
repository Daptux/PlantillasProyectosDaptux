// frontend/src/services/serviciosService.js
import api from './api';

export const serviciosService = {
  listar: (params) => api.get('/servicios', { params }),
  listarPublicos: () => api.get('/servicios/publicos'), // landing
  obtener: (id) => api.get(`/servicios/${id}`),
  crear: (data) => api.post('/servicios', data),
  actualizar: (id, data) => api.put(`/servicios/${id}`, data),
  eliminar: (id) => api.delete(`/servicios/${id}`),
};
