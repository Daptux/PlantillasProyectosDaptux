/**
 * frontend/src/services/contenidoService.js
 */
import api from './api';

export const contenidoService = {
  // Galería
  galeria: (publico) => api.get('/contenido/galeria', { params: publico ? { publico: 1 } : {} }).then((r) => r.data),
  crearGaleria: (data) => api.post('/contenido/galeria', data).then((r) => r.data),
  eliminarGaleria: (id) => api.delete(`/contenido/galeria/${id}`).then((r) => r.data),
  // Testimonios
  testimonios: (publico) => api.get('/contenido/testimonios', { params: publico ? { publico: 1 } : {} }).then((r) => r.data),
  crearTestimonio: (data) => api.post('/contenido/testimonios', data).then((r) => r.data),
  eliminarTestimonio: (id) => api.delete(`/contenido/testimonios/${id}`).then((r) => r.data),
  // FAQs
  faqs: (publico) => api.get('/contenido/faqs', { params: publico ? { publico: 1 } : {} }).then((r) => r.data),
  crearFaq: (data) => api.post('/contenido/faqs', data).then((r) => r.data),
  eliminarFaq: (id) => api.delete(`/contenido/faqs/${id}`).then((r) => r.data),
  // Configuración
  configuracion: () => api.get('/contenido/configuracion').then((r) => r.data),
  actualizarConfiguracion: (data) => api.put('/contenido/configuracion', data).then((r) => r.data),
};

export const dashboardService = {
  resumen: () => api.get('/dashboard/resumen').then((r) => r.data),
  reportes: (params) => api.get('/dashboard/reportes', { params }).then((r) => r.data),
  seguimiento: () => api.get('/dashboard/seguimiento').then((r) => r.data),
};

export const usuariosService = {
  listar: () => api.get('/usuarios').then((r) => r.data),
  obtener: (id) => api.get(`/usuarios/${id}`).then((r) => r.data),
  crear: (data) => api.post('/usuarios', data).then((r) => r.data),
  actualizar: (id, data) => api.put(`/usuarios/${id}`, data).then((r) => r.data),
  eliminar: (id) => api.delete(`/usuarios/${id}`).then((r) => r.data),
  roles: () => api.get('/usuarios/roles/all').then((r) => r.data),
};
