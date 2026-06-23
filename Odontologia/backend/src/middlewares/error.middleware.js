// backend/src/middlewares/error.middleware.js
// Manejo centralizado de errores y de rutas no encontradas.

// 404 - ruta no encontrada
function noEncontrado(req, res, next) {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.originalUrl}` });
}

// Manejador global de errores
function manejadorErrores(err, req, res, next) {
  console.error('❌ Error:', err.message);

  // Errores comunes de MySQL traducidos a mensajes amigables
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ ok: false, mensaje: 'El registro ya existe (valor duplicado).' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ ok: false, mensaje: 'Referencia inválida a otro registro.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor.',
  });
}

module.exports = { noEncontrado, manejadorErrores };
