import api from '../api/axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const register = (datos) =>
  api.post('/auth/register', datos).then((r) => r.data);

export const obtenerPerfil = () =>
  api.get('/auth/perfil').then((r) => r.data);

export const actualizarPerfil = (datos) =>
  api.put('/auth/perfil', datos).then((r) => r.data);
