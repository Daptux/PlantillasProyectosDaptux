import api from '../api/axios';

export const listarClientes = () => api.get('/clientes').then((r) => r.data);
export const obtenerCliente = (id) => api.get(`/clientes/${id}`).then((r) => r.data);
export const crearCliente = (datos) => api.post('/clientes', datos).then((r) => r.data);
export const actualizarCliente = (id, datos) => api.put(`/clientes/${id}`, datos).then((r) => r.data);
export const eliminarCliente = (id) => api.delete(`/clientes/${id}`).then((r) => r.data);
