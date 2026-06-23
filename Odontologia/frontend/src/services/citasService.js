// frontend/src/services/citasService.js
import api from './api';

export const citasService = {
  listar: (params) => api.get('/citas', { params }),
  obtener: (id) => api.get(`/citas/${id}`),
  crear: (data) => api.post('/citas', data),
  crearPublica: (data) => api.post('/citas/publica', data), // landing
  actualizar: (id, data) => api.put(`/citas/${id}`, data),
  cambiarEstado: (id, estado) => api.patch(`/citas/${id}/estado`, { estado }),
  eliminar: (id) => api.delete(`/citas/${id}`),
};
