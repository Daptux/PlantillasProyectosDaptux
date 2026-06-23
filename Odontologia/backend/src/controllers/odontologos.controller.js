// backend/src/controllers/odontologos.controller.js
// CRUD de odontólogos + listado público para la landing / equipo.

const { pool } = require('../config/db');
const { camposFaltantes } = require('../utils/validarCampos');

const SELECT_BASE = `
  SELECT o.*, e.nombre AS especialidad
    FROM odontologos o
    LEFT JOIN especialidades e ON e.id = o.especialidad_id`;

// GET /api/odontologos
async function listar(req, res, next) {
  try {
    const [rows] = await pool.query(`${SELECT_BASE} ORDER BY o.nombre ASC`);
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/odontologos/publicos  (landing: visibles y activos)
async function listarPublicos(req, res, next) {
  try {
    const [rows] = await pool.query(
      `${SELECT_BASE} WHERE o.visible_landing = 1 AND o.estado = 1 ORDER BY o.nombre ASC`
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/odontologos/:id
async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE o.id = ? LIMIT 1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Odontólogo no encontrado.' });
    res.json({ ok: true, datos: rows[0] });
  } catch (err) { next(err); }
}

const CAMPOS = ['usuario_id', 'especialidad_id', 'nombre', 'documento', 'registro_profesional',
  'telefono', 'correo', 'foto_url', 'biografia', 'horarios', 'visible_landing', 'estado'];

// POST /api/odontologos
async function crear(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['nombre']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const columnas = CAMPOS.filter((c) => req.body[c] !== undefined);
    const valores = columnas.map((c) => {
      if (['visible_landing', 'estado'].includes(c)) return req.body[c] ? 1 : 0;
      if (c === 'horarios' && typeof req.body[c] === 'object') return JSON.stringify(req.body[c]);
      return req.body[c];
    });
    const placeholders = columnas.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO odontologos (${columnas.join(', ')}) VALUES (${placeholders})`, valores
    );
    res.status(201).json({ ok: true, mensaje: 'Odontólogo creado.', id: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/odontologos/:id
async function actualizar(req, res, next) {
  try {
    const campos = [];
    const valores = [];
    for (const c of CAMPOS) {
      if (req.body[c] !== undefined) {
        campos.push(`${c} = ?`);
        if (['visible_landing', 'estado'].includes(c)) valores.push(req.body[c] ? 1 : 0);
        else if (c === 'horarios' && typeof req.body[c] === 'object') valores.push(JSON.stringify(req.body[c]));
        else valores.push(req.body[c]);
      }
    }
    if (!campos.length) return res.status(400).json({ ok: false, mensaje: 'Nada que actualizar.' });
    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE odontologos SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Odontólogo no encontrado.' });
    res.json({ ok: true, mensaje: 'Odontólogo actualizado.' });
  } catch (err) { next(err); }
}

// DELETE /api/odontologos/:id  -> soft delete (estado = 0)
async function eliminar(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE odontologos SET estado = 0 WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Odontólogo no encontrado.' });
    res.json({ ok: true, mensaje: 'Odontólogo desactivado.' });
  } catch (err) { next(err); }
}

module.exports = { listar, listarPublicos, obtener, crear, actualizar, eliminar };
