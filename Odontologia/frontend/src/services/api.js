// frontend/src/services/api.js
// Instancia central de axios. Inyecta el JWT en cada petición y maneja 401 global.

import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // el proxy de Vite redirige a http://localhost:4000
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request: añade el token guardado.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de response: si el token expira (401), limpia sesión y redirige a login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
