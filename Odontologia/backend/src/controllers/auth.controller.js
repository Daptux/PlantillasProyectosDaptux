/**
 * backend/src/controllers/auth.controller.js
 * Autenticación: login y perfil.
 */
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const generarToken = require('../utils/generarToken');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

/** POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
  const { correo, password } = req.body;
  const faltantes = camposRequeridos(req.body, ['correo', 'password']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });

  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.correo, u.password_hash, u.rol_id, u.activo, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.correo = ?`,
    [correo.trim().toLowerCase()]
  );

  const usuario = rows[0];
  if (!usuario) return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas.' });
  if (!usuario.activo) return res.status(403).json({ ok: false, mensaje: 'Usuario inactivo.' });

  const passwordOk = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordOk) return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas.' });

  await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [usuario.id]);
  await registrarLog({ usuarioId: usuario.id, accion: 'LOGIN', entidad: 'usuarios', entidadId: usuario.id, ip: req.ip });

  const token = generarToken(usuario);
  res.json({
    ok: true,
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol_id: usuario.rol_id,
      rol: usuario.rol,
    },
  });
});

/** GET /api/auth/profile */
const profile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.correo, u.telefono, u.rol_id, u.activo, u.ultimo_login,
            r.nombre AS rol, u.created_at
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.id = ?`,
    [req.usuario.id]
  );
  if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
  res.json({ ok: true, usuario: rows[0] });
});

module.exports = { login, profile };
