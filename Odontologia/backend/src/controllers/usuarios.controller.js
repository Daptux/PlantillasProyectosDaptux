// backend/src/controllers/usuarios.controller.js
// CRUD de usuarios del sistema. Solo ADMIN/SUPERADMIN (controlado en las rutas).

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { camposFaltantes, esCorreoValido } = require('../utils/validarCampos');

const SELECT_BASE = `
  SELECT u.id, u.nombre, u.correo, u.telefono, u.activo, u.ultimo_login,
         u.rol_id, r.nombre AS rol, u.created_at
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id`;

// GET /api/usuarios
async function listar(req, res, next) {
  try {
    const [rows] = await pool.query(`${SELECT_BASE} ORDER BY u.created_at DESC`);
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/usuarios/:id
async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE u.id = ? LIMIT 1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    res.json({ ok: true, datos: rows[0] });
  } catch (err) { next(err); }
}

// POST /api/usuarios
async function crear(req, res, next) {
  try {
    const { nombre, correo, password, rol_id, telefono } = req.body;
    const faltantes = camposFaltantes(req.body, ['nombre', 'correo', 'password', 'rol_id']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    if (!esCorreoValido(correo)) {
      return res.status(400).json({ ok: false, mensaje: 'Correo inválido.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password_hash, rol_id, telefono) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hash, rol_id, telefono || null]
    );
    res.status(201).json({ ok: true, mensaje: 'Usuario creado.', id: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/usuarios/:id
async function actualizar(req, res, next) {
  try {
    const { nombre, correo, rol_id, telefono, activo, password } = req.body;
    if (correo && !esCorreoValido(correo)) {
      return res.status(400).json({ ok: false, mensaje: 'Correo inválido.' });
    }

    // Construye actualización dinámica solo con los campos enviados
    const campos = [];
    const valores = [];
    if (nombre !== undefined) { campos.push('nombre = ?'); valores.push(nombre); }
    if (correo !== undefined) { campos.push('correo = ?'); valores.push(correo); }
    if (rol_id !== undefined) { campos.push('rol_id = ?'); valores.push(rol_id); }
    if (telefono !== undefined) { campos.push('telefono = ?'); valores.push(telefono); }
    if (activo !== undefined) { campos.push('activo = ?'); valores.push(activo ? 1 : 0); }
    if (password) { campos.push('password_hash = ?'); valores.push(await bcrypt.hash(password, 10)); }

    if (!campos.length) return res.status(400).json({ ok: false, mensaje: 'Nada que actualizar.' });

    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    res.json({ ok: true, mensaje: 'Usuario actualizado.' });
  } catch (err) { next(err); }
}

// DELETE /api/usuarios/:id  -> soft delete (activo = 0)
async function eliminar(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    res.json({ ok: true, mensaje: 'Usuario desactivado.' });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
