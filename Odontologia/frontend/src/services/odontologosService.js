// frontend/src/services/odontologosService.js
import api from './api';

export const odontologosService = {
  listar: () => api.get('/odontologos'),
  listarPublicos: () => api.get('/odontologos/publicos'), // landing / equipo
  obtener: (id) => api.get(`/odontologos/${id}`),
  crear: (data) => api.post('/odontologos', data),
  actualizar: (id, data) => api.put(`/odontologos/${id}`, data),
  eliminar: (id) => api.delete(`/odontologos/${id}`),
};
