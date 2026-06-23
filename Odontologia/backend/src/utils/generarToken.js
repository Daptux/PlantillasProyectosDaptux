// backend/src/utils/generarToken.js
// Genera un JWT firmado con los datos esenciales del usuario.

const jwt = require('jsonwebtoken');

function generarToken(usuario) {
  const payload = {
    id: usuario.id,
    rol: usuario.rol,        // nombre del rol (ej. ADMIN)
    rol_id: usuario.rol_id,
    nombre: usuario.nombre,
    correo: usuario.correo,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

module.exports = generarToken;
