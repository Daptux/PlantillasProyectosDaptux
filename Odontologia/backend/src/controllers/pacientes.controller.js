/**
 * backend/src/controllers/pacientes.controller.js
 * CRUD de pacientes con búsqueda y soft delete.
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

const CAMPOS = [
  'tipo_documento', 'numero_documento', 'nombres', 'apellidos', 'fecha_nacimiento',
  'genero', 'telefono', 'correo', 'direccion', 'ciudad', 'ocupacion',
  'contacto_emergencia', 'telefono_emergencia', 'alergias', 'enfermedades',
  'medicamentos', 'antecedentes_medicos', 'antecedentes_odontologicos',
  'observaciones', 'acepta_tratamiento_datos',
];

/** GET /api/pacientes?buscar=&estado= */
const listar = asyncHandler(async (req, res) => {
  const { buscar = '', estado } = req.query;
  const where = [];
  const params = [];

  if (estado !== undefined && estado !== '') { where.push('estado = ?'); params.push(Number(estado)); }
  else { where.push('estado = 1'); } // por defecto solo activos

  if (buscar) {
    where.push('(nombres LIKE ? OR apellidos LIKE ? OR numero_documento LIKE ? OR telefono LIKE ?)');
    const like = `%${buscar}%`;
    params.push(like, like, like, like);
  }

  const sql = `SELECT id, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento,
                      genero, telefono, correo, ciudad, estado, created_at,
                      TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) AS edad
               FROM pacientes
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY apellidos, nombres`;
  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

/** GET /api/pacientes/:id */
const obtener = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT *, TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) AS edad
     FROM pacientes WHERE id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Paciente no encontrado.' });
  res.json({ ok: true, data: rows[0] });
});

/** POST /api/pacientes */
const crear = asyncHandler(async (req, res) => {
  const faltantes = camposRequeridos(req.body, ['numero_documento', 'nombres', 'apellidos']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });

  const valores = CAMPOS.map((c) => {
    if (c === 'acepta_tratamiento_datos') return req.body[c] ? 1 : 0;
    return req.body[c] !== undefined && req.body[c] !== '' ? req.body[c] : null;
  });

  const placeholders = CAMPOS.map(() => '?').join(', ');
  const [result] = await pool.query(
    `INSERT INTO pacientes (${CAMPOS.join(', ')}) VALUES (${placeholders})`,
    valores
  );

  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_PACIENTE', entidad: 'pacientes', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Paciente creado.', id: result.insertId });
});

/** PUT /api/pacientes/:id */
const actualizar = asyncHandler(async (req, res) => {
  const campos = [];
  const valores = [];
  for (const c of CAMPOS) {
    if (req.body[c] !== undefined) {
      campos.push(`${c} = ?`);
      valores.push(c === 'acepta_tratamiento_datos' ? (req.body[c] ? 1 : 0) : (req.body[c] === '' ? null : req.body[c]));
    }
  }
  if (req.body.estado !== undefined) { campos.push('estado = ?'); valores.push(req.body.estado ? 1 : 0); }
  if (!campos.length) return badRequest(res, 'Nada que actualizar.');

  valores.push(req.params.id);
  const [result] = await pool.query(`UPDATE pacientes SET ${campos.join(', ')} WHERE id = ?`, valores);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Paciente no encontrado.' });

  await registrarLog({ usuarioId: req.usuario.id, accion: 'ACTUALIZAR_PACIENTE', entidad: 'pacientes', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Paciente actualizado.' });
});

/** DELETE /api/pacientes/:id  (soft delete) */
const eliminar = asyncHandler(async (req, res) => {
  const [result] = await pool.query('UPDATE pacientes SET estado = 0 WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Paciente no encontrado.' });
  await registrarLog({ usuarioId: req.usuario.id, accion: 'INACTIVAR_PACIENTE', entidad: 'pacientes', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Paciente inactivado.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
