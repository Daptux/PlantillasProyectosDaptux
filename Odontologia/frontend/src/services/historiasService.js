// frontend/src/services/historiasService.js
import api from './api';

export const historiasService = {
  obtenerPorPaciente: (pacienteId) => api.get(`/historias/paciente/${pacienteId}`),
  crear: (data) => api.post('/historias', data),
  crearEvolucion: (data) => api.post('/historias/evoluciones', data),
  listarEvoluciones: (pacienteId) => api.get(`/historias/evoluciones/${pacienteId}`),
};

export const odontogramaService = {
  obtener: (pacienteId) => api.get(`/odontograma/${pacienteId}`),
  guardar: (data) => api.post('/odontograma', data),
  actualizar: (id, data) => api.put(`/odontograma/${id}`, data),
};

export const planesService = {
  listar: (params) => api.get('/planes', { params }),
  obtener: (id) => api.get(`/planes/${id}`),
  crear: (data) => api.post('/planes', data),
  actualizar: (id, data) => api.put(`/planes/${id}`, data),
  agregarDetalle: (id, data) => api.post(`/planes/${id}/detalles`, data),
  actualizarDetalle: (detalleId, data) => api.put(`/planes/detalles/${detalleId}`, data),
};
