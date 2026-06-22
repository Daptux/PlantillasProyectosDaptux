/**
 * backend/src/utils/generarToken.js
 * Genera un JWT firmado con los datos básicos del usuario.
 */
const jwt = require('jsonwebtoken');

function generarToken(usuario) {
  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol_id: usuario.rol_id,
    rol: usuario.rol, // nombre del rol (string)
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

module.exports = generarToken;
