// frontend/src/services/contenidoService.js
import api from './api';

export const contenidoService = {
  // Galería
  listarGaleria: (todos) => api.get('/contenido/galeria', { params: todos ? { todos: 1 } : {} }),
  crearGaleria: (data) => api.post('/contenido/galeria', data),
  eliminarGaleria: (id) => api.delete(`/contenido/galeria/${id}`),
  // Testimonios
  listarTestimonios: (todos) => api.get('/contenido/testimonios', { params: todos ? { todos: 1 } : {} }),
  crearTestimonio: (data) => api.post('/contenido/testimonios', data),
  eliminarTestimonio: (id) => api.delete(`/contenido/testimonios/${id}`),
  // FAQs
  listarFaqs: (todos) => api.get('/contenido/faqs', { params: todos ? { todos: 1 } : {} }),
  crearFaq: (data) => api.post('/contenido/faqs', data),
  eliminarFaq: (id) => api.delete(`/contenido/faqs/${id}`),
  // Configuración de la clínica
  obtenerConfiguracion: () => api.get('/contenido/configuracion'),
  actualizarConfiguracion: (data) => api.put('/contenido/configuracion', data),
};

export const dashboardService = {
  resumen: () => api.get('/dashboard/resumen'),
};

export const usuariosService = {
  listar: () => api.get('/usuarios'),
  obtener: (id) => api.get(`/usuarios/${id}`),
  crear: (data) => api.post('/usuarios', data),
  actualizar: (id, data) => api.put(`/usuarios/${id}`, data),
  eliminar: (id) => api.delete(`/usuarios/${id}`),
};
