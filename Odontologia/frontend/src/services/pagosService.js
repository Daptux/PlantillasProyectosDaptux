// frontend/src/services/pagosService.js
import api from './api';

export const pagosService = {
  listar: (params) => api.get('/pagos', { params }),
  crear: (data) => api.post('/pagos', data),
  porPaciente: (pacienteId) => api.get(`/pagos/paciente/${pacienteId}`),
  saldo: (pacienteId) => api.get(`/pagos/saldo/${pacienteId}`),
};
