import api from '../api/axios';

export const listarOpiniones = (limite) =>
  api.get('/opiniones', { params: limite ? { limite } : undefined }).then((r) => r.data);
export const crearOpinion = (datos) => api.post('/opiniones', datos).then((r) => r.data);
