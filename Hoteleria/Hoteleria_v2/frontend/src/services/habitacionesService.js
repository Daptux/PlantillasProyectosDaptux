import api from '../api/axios';

export const listarHabitaciones = () => api.get('/habitaciones').then((r) => r.data);
export const listarDisponibles = (params) =>
  api.get('/habitaciones/disponibles', { params }).then((r) => r.data);
export const obtenerHabitacionPublica = (id) => api.get(`/habitaciones/publica/${id}`).then((r) => r.data);
export const verificarDisponibilidad = (id, fecha_entrada, fecha_salida) =>
  api.get(`/habitaciones/publica/${id}/disponibilidad`, { params: { fecha_entrada, fecha_salida } }).then((r) => r.data);
export const fechasOcupadas = (id) =>
  api.get(`/habitaciones/publica/${id}/ocupadas`).then((r) => r.data);
export const obtenerHabitacion = (id) => api.get(`/habitaciones/${id}`).then((r) => r.data);
export const crearHabitacion = (datos) => api.post('/habitaciones', datos).then((r) => r.data);
export const actualizarHabitacion = (id, datos) => api.put(`/habitaciones/${id}`, datos).then((r) => r.data);
export const eliminarHabitacion = (id) => api.delete(`/habitaciones/${id}`).then((r) => r.data);

export const subirImagen = (file) => {
  const fd = new FormData();
  fd.append('imagen', file);
  return api.post('/upload/imagen', fd).then((r) => r.data);
};
