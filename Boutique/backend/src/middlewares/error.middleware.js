import { ApiError } from '../utils/helpers.js';

// 404 para rutas no encontradas
export function notFound(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Manejo global de errores
export function errorHandler(err, req, res, next) {
  // Errores de Multer (subida de archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'El archivo supera el tamaño máximo permitido (5MB)' });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  // Errores de MySQL comunes
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Registro duplicado (valor único ya existe)' });
  }
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
}
