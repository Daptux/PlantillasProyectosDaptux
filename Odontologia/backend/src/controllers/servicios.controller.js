/**
 * backend/src/controllers/servicios.controller.js
 * CRUD de servicios. Listado público para landing (solo visibles y activos).
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

const CAMPOS = ['nombre', 'categoria', 'descripcion_corta', 'descripcion_larga',
  'precio_base', 'duracion_min', 'imagen_url', 'icono', 'visible_landing', 'activo', 'orden'];

/** GET /api/servicios  (admin: todos) */
const listar = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM servicios ORDER BY orden, nombre');
  res.json({ ok: true, data: rows });
});

/** GET /api/servicios/publicos  (landing) */
const listarPublicos = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, nombre, categoria, descripcion_corta, descripcion_larga, precio_base,
            duracion_min, imagen_url, icono
     FROM servicios WHERE activo = 1 AND visible_landing = 1 ORDER BY orden, nombre`
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/servicios/:id */
const obtener = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM servicios WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
  res.json({ ok: true, data: rows[0] });
});

/** POST /api/servicios */
const crear = asyncHandler(async (req, res) => {
  const faltantes = camposRequeridos(req.body, ['nombre']);
  if (faltantes.length) return badRequest(res, 'El nombre es requerido.', { faltantes });

  const valores = CAMPOS.map((c) => {
    if (c === 'visible_landing' || c === 'activo') return req.body[c] === undefined ? 1 : (req.body[c] ? 1 : 0);
    if (c === 'precio_base') return req.body[c] ?? 0;
    if (c === 'duracion_min') return req.body[c] ?? 30;
    if (c === 'orden') return req.body[c] ?? 0;
    if (c === 'categoria') return req.body[c] || 'General';
    return req.body[c] !== undefined && req.body[c] !== '' ? req.body[c] : null;
  });

  const [result] = await pool.query(
    `INSERT INTO servicios (${CAMPOS.join(', ')}) VALUES (${CAMPOS.map(() => '?').join(', ')})`,
    valores
  );
  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_SERVICIO', entidad: 'servicios', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Servicio creado.', id: result.insertId });
});

/** PUT /api/servicios/:id */
const actualizar = asyncHandler(async (req, res) => {
  const campos = [];
  const valores = [];
  for (const c of CAMPOS) {
    if (req.body[c] !== undefined) {
      campos.push(`${c} = ?`);
      if (c === 'visible_landing' || c === 'activo') valores.push(req.body[c] ? 1 : 0);
      else valores.push(req.body[c] === '' ? null : req.body[c]);
    }
  }
  if (!campos.length) return badRequest(res, 'Nada que actualizar.');
  valores.push(req.params.id);
  const [result] = await pool.query(`UPDATE servicios SET ${campos.join(', ')} WHERE id = ?`, valores);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
  await registrarLog({ usuarioId: req.usuario.id, accion: 'ACTUALIZAR_SERVICIO', entidad: 'servicios', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Servicio actualizado.' });
});

/** DELETE /api/servicios/:id  (soft delete) */
const eliminar = asyncHandler(async (req, res) => {
  const [result] = await pool.query('UPDATE servicios SET activo = 0 WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
  await registrarLog({ usuarioId: req.usuario.id, accion: 'INACTIVAR_SERVICIO', entidad: 'servicios', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Servicio inactivado.' });
});

module.exports = { listar, listarPublicos, obtener, crear, actualizar, eliminar };
