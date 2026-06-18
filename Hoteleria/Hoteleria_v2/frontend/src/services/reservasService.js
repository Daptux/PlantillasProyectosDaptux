import api from '../api/axios';

export const crearReserva = (datos) => api.post('/reservas', datos).then((r) => r.data);
export const listarReservas = () => api.get('/reservas').then((r) => r.data);
export const misReservas = () => api.get('/reservas/mis-reservas').then((r) => r.data);
export const obtenerReserva = (id) => api.get(`/reservas/${id}`).then((r) => r.data);
export const cambiarEstado = (id, estado) =>
  api.put(`/reservas/${id}/estado`, { estado }).then((r) => r.data);
export const cancelarReserva = (id) => api.put(`/reservas/${id}/cancelar`).then((r) => r.data);
export const checkIn = (id) => api.put(`/reservas/${id}/check-in`).then((r) => r.data);
export const checkOut = (id) => api.put(`/reservas/${id}/check-out`).then((r) => r.data);
