/**
 * frontend/src/services/pagosService.js
 */
import api from './api';

export const pagosService = {
  listar: (params) => api.get('/pagos', { params }).then((r) => r.data),
  crear: (data) => api.post('/pagos', data).then((r) => r.data),
  porPaciente: (pacienteId) => api.get(`/pagos/paciente/${pacienteId}`).then((r) => r.data),
  saldo: (pacienteId) => api.get(`/pagos/saldo/${pacienteId}`).then((r) => r.data),
};
