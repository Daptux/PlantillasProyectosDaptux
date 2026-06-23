// backend/src/middlewares/auth.middleware.js
// Verifica el JWT enviado en el header Authorization: Bearer <token>.

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ ok: false, mensaje: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, rol, rol_id, nombre, correo }
    return next();
  } catch (err) {
    return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado.' });
  }
}

module.exports = verificarToken;
