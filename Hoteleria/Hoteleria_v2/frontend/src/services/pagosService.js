import api from '../api/axios';

export const registrarPago = (datos) => api.post('/pagos', datos).then((r) => r.data);
export const listarPagos = () => api.get('/pagos').then((r) => r.data);
export const pagosPorReserva = (idReserva) =>
  api.get(`/pagos/reserva/${idReserva}`).then((r) => r.data);
