/**
 * backend/src/controllers/usuarios.controller.js
 * CRUD de usuarios del sistema (solo ADMIN / SUPERADMIN).
 */
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, esCorreoValido, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

/** GET /api/usuarios */
const listar = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.correo, u.telefono, u.activo, u.rol_id, r.nombre AS rol,
            u.ultimo_login, u.created_at
     FROM usuarios u JOIN roles r ON r.id = u.rol_id
     ORDER BY u.created_at DESC`
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/usuarios/:id */
const obtener = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.correo, u.telefono, u.activo, u.rol_id, r.nombre AS rol, u.created_at
     FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
  res.json({ ok: true, data: rows[0] });
});

/** POST /api/usuarios */
const crear = asyncHandler(async (req, res) => {
  const { nombre, correo, password, rol_id, telefono } = req.body;
  const faltantes = camposRequeridos(req.body, ['nombre', 'correo', 'password', 'rol_id']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });
  if (!esCorreoValido(correo)) return badRequest(res, 'Correo inválido.');

  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO usuarios (rol_id, nombre, correo, password_hash, telefono, activo)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [rol_id, nombre.trim(), correo.trim().toLowerCase(), password_hash, telefono || null]
  );

  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_USUARIO', entidad: 'usuarios', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Usuario creado.', id: result.insertId });
});

/** PUT /api/usuarios/:id */
const actualizar = asyncHandler(async (req, res) => {
  const { nombre, correo, rol_id, telefono, activo, password } = req.body;
  if (correo && !esCorreoValido(correo)) return badRequest(res, 'Correo inválido.');

  const campos = [];
  const valores = [];
  if (nombre !== undefined) { campos.push('nombre = ?'); valores.push(nombre); }
  if (correo !== undefined) { campos.push('correo = ?'); valores.push(correo.trim().toLowerCase()); }
  if (rol_id !== undefined) { campos.push('rol_id = ?'); valores.push(rol_id); }
  if (telefono !== undefined) { campos.push('telefono = ?'); valores.push(telefono); }
  if (activo !== undefined) { campos.push('activo = ?'); valores.push(activo ? 1 : 0); }
  if (password) { campos.push('password_hash = ?'); valores.push(await bcrypt.hash(password, 10)); }

  if (!campos.length) return badRequest(res, 'Nada que actualizar.');
  valores.push(req.params.id);

  const [result] = await pool.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });

  await registrarLog({ usuarioId: req.usuario.id, accion: 'ACTUALIZAR_USUARIO', entidad: 'usuarios', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Usuario actualizado.' });
});

/** DELETE /api/usuarios/:id  (soft delete: desactiva) */
const eliminar = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.usuario.id) {
    return badRequest(res, 'No puedes desactivar tu propio usuario.');
  }
  const [result] = await pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });

  await registrarLog({ usuarioId: req.usuario.id, accion: 'DESACTIVAR_USUARIO', entidad: 'usuarios', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Usuario desactivado.' });
});

/** GET /api/usuarios/roles/all  (lista de roles para selects) */
const listarRoles = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, nombre, descripcion FROM roles ORDER BY id');
  res.json({ ok: true, data: rows });
});

module.exports = { listar, obtener, crear, actualizar, eliminar, listarRoles };
