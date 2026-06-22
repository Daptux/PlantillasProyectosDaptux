/**
 * frontend/src/services/api.js
 * Instancia central de Axios. Inyecta el JWT en cada petición y maneja 401.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el token guardado en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expira (401), limpia sesión y redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      // Evita bucle si ya estamos en login
      if (location.pathname.startsWith('/admin')) location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
