/**
 * backend/src/middlewares/error.middleware.js
 * Manejo centralizado de errores y de rutas no encontradas.
 */

/** Ruta no encontrada (404). */
function notFound(req, res, next) {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.originalUrl}` });
}

/** Manejador global de errores. */
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  // Errores conocidos de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ ok: false, mensaje: 'Registro duplicado.', detalle: err.sqlMessage });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ ok: false, mensaje: 'Conflicto de integridad referencial.', detalle: err.sqlMessage });
  }

  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor.',
  });
}

module.exports = { notFound, errorHandler };
