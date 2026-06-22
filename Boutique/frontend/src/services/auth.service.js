import api from './api.js';

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  profile: () => api.get('/auth/profile').then((r) => r.data),
  updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data),
};
