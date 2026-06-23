// backend/src/controllers/servicios.controller.js
// CRUD de servicios + listado público para la landing.

const { pool } = require('../config/db');
const { camposFaltantes } = require('../utils/validarCampos');

// GET /api/servicios  (admin: todos)  -> ?categoria=&activo=
async function listar(req, res, next) {
  try {
    const { categoria, activo } = req.query;
    const where = [];
    const params = [];
    if (categoria) { where.push('categoria = ?'); params.push(categoria); }
    if (activo !== undefined) { where.push('activo = ?'); params.push(activo === 'true' || activo === '1' ? 1 : 0); }
    const clausula = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT * FROM servicios ${clausula} ORDER BY nombre ASC`, params);
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/servicios/publicos  (landing: solo visibles y activos)
async function listarPublicos(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, categoria, descripcion_corta, descripcion_larga,
              precio_base, duracion_min, imagen_url, icono
         FROM servicios
        WHERE visible_landing = 1 AND activo = 1
        ORDER BY nombre ASC`
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/servicios/:id
async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM servicios WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
    res.json({ ok: true, datos: rows[0] });
  } catch (err) { next(err); }
}

// POST /api/servicios
async function crear(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['nombre']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const {
      nombre, categoria = 'General', descripcion_corta = null, descripcion_larga = null,
      precio_base = 0, duracion_min = 30, imagen_url = null, icono = null,
      visible_landing = 1, activo = 1,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO servicios
        (nombre, categoria, descripcion_corta, descripcion_larga, precio_base, duracion_min, imagen_url, icono, visible_landing, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, categoria, descripcion_corta, descripcion_larga, precio_base, duracion_min, imagen_url, icono,
       visible_landing ? 1 : 0, activo ? 1 : 0]
    );
    res.status(201).json({ ok: true, mensaje: 'Servicio creado.', id: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/servicios/:id
async function actualizar(req, res, next) {
  try {
    const permitidos = ['nombre', 'categoria', 'descripcion_corta', 'descripcion_larga',
      'precio_base', 'duracion_min', 'imagen_url', 'icono', 'visible_landing', 'activo'];
    const campos = [];
    const valores = [];
    for (const k of permitidos) {
      if (req.body[k] !== undefined) {
        campos.push(`${k} = ?`);
        valores.push(['visible_landing', 'activo'].includes(k) ? (req.body[k] ? 1 : 0) : req.body[k]);
      }
    }
    if (!campos.length) return res.status(400).json({ ok: false, mensaje: 'Nada que actualizar.' });
    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE servicios SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
    res.json({ ok: true, mensaje: 'Servicio actualizado.' });
  } catch (err) { next(err); }
}

// DELETE /api/servicios/:id  -> soft delete (activo = 0)
async function eliminar(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE servicios SET activo = 0 WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
    res.json({ ok: true, mensaje: 'Servicio desactivado.' });
  } catch (err) { next(err); }
}

module.exports = { listar, listarPublicos, obtener, crear, actualizar, eliminar };
