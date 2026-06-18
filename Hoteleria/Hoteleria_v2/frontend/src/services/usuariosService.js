import api from '../api/axios';

export const listarUsuarios = () => api.get('/usuarios').then((r) => r.data);
export const obtenerUsuario = (id) => api.get(`/usuarios/${id}`).then((r) => r.data);
export const actualizarUsuario = (id, datos) => api.put(`/usuarios/${id}`, datos).then((r) => r.data);
export const desactivarUsuario = (id) => api.delete(`/usuarios/${id}`).then((r) => r.data);
