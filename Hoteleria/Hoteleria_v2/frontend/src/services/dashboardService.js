import api from '../api/axios';

export const obtenerResumen = () => api.get('/dashboard/resumen').then((r) => r.data);
