// frontend/src/services/authService.js
import api from './api';

export const authService = {
  login: (correo, password) => api.post('/auth/login', { correo, password }),
  perfil: () => api.get('/auth/profile'),
};
