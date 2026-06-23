// backend/src/controllers/auth.controller.js
// Autenticación: login y perfil del usuario autenticado.

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const generarToken = require('../utils/generarToken');
const { camposFaltantes, esCorreoValido } = require('../utils/validarCampos');

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { correo, password } = req.body;

    const faltantes = camposFaltantes(req.body, ['correo', 'password']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    if (!esCorreoValido(correo)) {
      return res.status(400).json({ ok: false, mensaje: 'Correo inválido.' });
    }

    // Trae el usuario junto al nombre de su rol
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.password_hash, u.activo, u.rol_id, r.nombre AS rol
         FROM usuarios u
         JOIN roles r ON r.id = u.rol_id
        WHERE u.correo = ?
        LIMIT 1`,
      [correo]
    );

    const usuario = rows[0];
    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }
    if (!usuario.activo) {
      return res.status(403).json({ ok: false, mensaje: 'Usuario inactivo. Contacta al administrador.' });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    // Actualiza último login (no bloquea la respuesta si falla)
    pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [usuario.id]).catch(() => {});

    // Registra log de actividad
    pool.query(
      'INSERT INTO logs_actividad (usuario_id, accion, entidad, ip) VALUES (?, ?, ?, ?)',
      [usuario.id, 'LOGIN', 'usuarios', req.ip]
    ).catch(() => {});

    const token = generarToken(usuario);

    return res.json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        rol_id: usuario.rol_id,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/profile  (requiere token)
async function perfil(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.telefono, u.activo, u.ultimo_login,
              u.rol_id, r.nombre AS rol
         FROM usuarios u
         JOIN roles r ON r.id = u.rol_id
        WHERE u.id = ?
        LIMIT 1`,
      [req.usuario.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    return res.json({ ok: true, usuario: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, perfil };
