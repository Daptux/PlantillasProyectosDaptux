import { verifyToken } from '../utils/jwt.js';
import { pool } from '../config/db.js';

// Verifica el JWT y carga el usuario en req.user
export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No autenticado' });

    const decoded = verifyToken(token);
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.estado, u.rol_id, r.nombre AS rol
       FROM users u JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [decoded.id]
    );
    if (!rows.length) return res.status(401).json({ message: 'Usuario no encontrado' });

    const user = rows[0];
    if (!user.estado) return res.status(403).json({ message: 'Usuario inactivo' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Autenticación opcional: si hay token lo carga, si no continúa
export async function authOptional(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  try {
    const decoded = verifyToken(header.slice(7));
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre AS rol
       FROM users u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
      [decoded.id]
    );
    if (rows.length) req.user = rows[0];
  } catch (_) { /* token inválido -> sigue como anónimo */ }
  next();
}
