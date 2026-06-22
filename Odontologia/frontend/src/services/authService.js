/**
 * frontend/src/services/authService.js
 */
import api from './api';

export const authService = {
  login: (correo, password) => api.post('/auth/login', { correo, password }).then((r) => r.data),
  profile: () => api.get('/auth/profile').then((r) => r.data),
};
