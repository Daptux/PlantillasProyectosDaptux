import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000/uploads';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inyecta el token JWT en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo global: si 401, limpia sesión
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Resuelve una URL de imagen (acepta absolutas http o rutas /uploads)
export function resolveImage(url) {
  if (!url) return 'https://via.placeholder.com/600x600?text=Sin+imagen';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return url.replace('/uploads', UPLOADS_URL);
  return url;
}

export default api;
