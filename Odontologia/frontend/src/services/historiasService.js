/**
 * frontend/src/services/historiasService.js
 */
import api from './api';

export const historiasService = {
  porPaciente: (pacienteId) => api.get(`/historias/paciente/${pacienteId}`).then((r) => r.data),
  guardar: (data) => api.post('/historias', data).then((r) => r.data),
  crearEvolucion: (data) => api.post('/historias/evoluciones', data).then((r) => r.data),
  evoluciones: (pacienteId) => api.get(`/historias/evoluciones/${pacienteId}`).then((r) => r.data),
};

export const odontogramaService = {
  porPaciente: (pacienteId) => api.get(`/odontograma/${pacienteId}`).then((r) => r.data),
  guardar: (data) => api.post('/odontograma', data).then((r) => r.data),
  actualizar: (id, data) => api.put(`/odontograma/${id}`, data).then((r) => r.data),
};

export const planesService = {
  listar: (params) => api.get('/planes', { params }).then((r) => r.data),
  obtener: (id) => api.get(`/planes/${id}`).then((r) => r.data),
  crear: (data) => api.post('/planes', data).then((r) => r.data),
  actualizar: (id, data) => api.put(`/planes/${id}`, data).then((r) => r.data),
  agregarDetalle: (id, data) => api.post(`/planes/${id}/detalles`, data).then((r) => r.data),
  actualizarDetalle: (id, data) => api.put(`/planes/detalles/${id}`, data).then((r) => r.data),
  eliminarDetalle: (id) => api.delete(`/planes/detalles/${id}`).then((r) => r.data),
};
