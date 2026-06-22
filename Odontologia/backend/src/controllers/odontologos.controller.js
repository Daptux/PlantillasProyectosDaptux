/**
 * backend/src/controllers/odontologos.controller.js
 * CRUD de odontólogos. Soporta listado público (visibles en landing).
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

/** GET /api/odontologos  (admin) */
const listar = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT o.*, e.nombre AS especialidad
     FROM odontologos o
     LEFT JOIN especialidades e ON e.id = o.especialidad_id
     WHERE o.estado = 1
     ORDER BY o.nombre`
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/odontologos/publicos  (landing, sin auth) */
const listarPublicos = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT o.id, o.nombre, o.foto_url, o.biografia, e.nombre AS especialidad
     FROM odontologos o
     LEFT JOIN especialidades e ON e.id = o.especialidad_id
     WHERE o.estado = 1 AND o.visible_landing = 1
     ORDER BY o.nombre`
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/odontologos/:id */
const obtener = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT o.*, e.nombre AS especialidad FROM odontologos o
     LEFT JOIN especialidades e ON e.id = o.especialidad_id WHERE o.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Odontólogo no encontrado.' });

  const [servicios] = await pool.query(
    `SELECT s.id, s.nombre FROM odontologo_servicios os
     JOIN servicios s ON s.id = os.servicio_id WHERE os.odontologo_id = ?`,
    [req.params.id]
  );
  rows[0].servicios = servicios;
  res.json({ ok: true, data: rows[0] });
});

const CAMPOS = ['usuario_id', 'especialidad_id', 'nombre', 'documento', 'registro_profesional',
  'telefono', 'correo', 'foto_url', 'biografia', 'visible_landing'];

/** POST /api/odontologos */
const crear = asyncHandler(async (req, res) => {
  const faltantes = camposRequeridos(req.body, ['nombre']);
  if (faltantes.length) return badRequest(res, 'El nombre es requerido.', { faltantes });

  const valores = CAMPOS.map((c) => {
    if (c === 'visible_landing') return req.body[c] === undefined ? 1 : (req.body[c] ? 1 : 0);
    return req.body[c] !== undefined && req.body[c] !== '' ? req.body[c] : null;
  });
  // horarios (JSON) opcional
  const horarios = req.body.horarios ? JSON.stringify(req.body.horarios) : null;

  const [result] = await pool.query(
    `INSERT INTO odontologos (${CAMPOS.join(', ')}, horarios) VALUES (${CAMPOS.map(() => '?').join(', ')}, ?)`,
    [...valores, horarios]
  );

  // servicios relacionados
  if (Array.isArray(req.body.servicios) && req.body.servicios.length) {
    const values = req.body.servicios.map((sid) => [result.insertId, sid]);
    await pool.query('INSERT INTO odontologo_servicios (odontologo_id, servicio_id) VALUES ?', [values]);
  }

  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_ODONTOLOGO', entidad: 'odontologos', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Odontólogo creado.', id: result.insertId });
});

/** PUT /api/odontologos/:id */
const actualizar = asyncHandler(async (req, res) => {
  const campos = [];
  const valores = [];
  for (const c of CAMPOS) {
    if (req.body[c] !== undefined) {
      campos.push(`${c} = ?`);
      valores.push(c === 'visible_landing' ? (req.body[c] ? 1 : 0) : (req.body[c] === '' ? null : req.body[c]));
    }
  }
  if (req.body.horarios !== undefined) { campos.push('horarios = ?'); valores.push(req.body.horarios ? JSON.stringify(req.body.horarios) : null); }
  if (req.body.estado !== undefined) { campos.push('estado = ?'); valores.push(req.body.estado ? 1 : 0); }
  if (!campos.length && !req.body.servicios) return badRequest(res, 'Nada que actualizar.');

  if (campos.length) {
    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE odontologos SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Odontólogo no encontrado.' });
  }

  if (Array.isArray(req.body.servicios)) {
    await pool.query('DELETE FROM odontologo_servicios WHERE odontologo_id = ?', [req.params.id]);
    if (req.body.servicios.length) {
      const values = req.body.servicios.map((sid) => [req.params.id, sid]);
      await pool.query('INSERT INTO odontologo_servicios (odontologo_id, servicio_id) VALUES ?', [values]);
    }
  }

  await registrarLog({ usuarioId: req.usuario.id, accion: 'ACTUALIZAR_ODONTOLOGO', entidad: 'odontologos', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Odontólogo actualizado.' });
});

/** DELETE /api/odontologos/:id */
const eliminar = asyncHandler(async (req, res) => {
  const [result] = await pool.query('UPDATE odontologos SET estado = 0 WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Odontólogo no encontrado.' });
  await registrarLog({ usuarioId: req.usuario.id, accion: 'INACTIVAR_ODONTOLOGO', entidad: 'odontologos', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Odontólogo inactivado.' });
});

/** GET /api/odontologos/especialidades/all */
const listarEspecialidades = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, nombre FROM especialidades WHERE activo = 1 ORDER BY nombre');
  res.json({ ok: true, data: rows });
});

module.exports = { listar, listarPublicos, obtener, crear, actualizar, eliminar, listarEspecialidades };
