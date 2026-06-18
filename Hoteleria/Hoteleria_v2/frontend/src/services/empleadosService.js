import api from '../api/axios';

export const listarEmpleados = () => api.get('/empleados').then((r) => r.data);
export const obtenerEmpleado = (id) => api.get(`/empleados/${id}`).then((r) => r.data);
export const crearEmpleado = (datos) => api.post('/empleados', datos).then((r) => r.data);
export const actualizarEmpleado = (id, datos) => api.put(`/empleados/${id}`, datos).then((r) => r.data);
export const eliminarEmpleado = (id) => api.delete(`/empleados/${id}`).then((r) => r.data);
