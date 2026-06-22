// Utilidades generales

// Genera un slug url-friendly a partir de un texto
export function slugify(text = '') {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Número de pedido único legible: ORD-2026-000123
export function buildOrderNumber(id) {
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(id).padStart(6, '0')}`;
}

// Respuesta estándar de error de negocio
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Envuelve controladores async y pasa errores al middleware global
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Quita campos sensibles del usuario
export function sanitizeUser(user) {
  if (!user) return user;
  const { password, deleted_at, ...rest } = user;
  return rest;
}

// Paginación: devuelve { limit, offset, page }
export function getPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
