// backend/src/controllers/pacientes.controller.js
// CRUD de pacientes con búsqueda por nombre, documento o teléfono.

const { pool } = require('../config/db');
const { camposFaltantes } = require('../utils/validarCampos');

const CAMPOS = [
  'nombre', 'tipo_documento', 'numero_documento', 'fecha_nacimiento', 'genero',
  'telefono', 'correo', 'direccion', 'ocupacion',
  'contacto_emergencia_nombre', 'contacto_emergencia_telefono',
  'alergias', 'enfermedades', 'medicamentos', 'antecedentes_medicos',
  'antecedentes_odontologicos', 'observaciones', 'acepta_tratamiento_datos', 'estado',
];

// GET /api/pacientes  -> ?buscar=texto
async function listar(req, res, next) {
  try {
    const { buscar } = req.query;
    let sql = 'SELECT * FROM pacientes';
    const params = [];
    if (buscar) {
      sql += ' WHERE nombre LIKE ? OR numero_documento LIKE ? OR telefono LIKE ?';
      const like = `%${buscar}%`;
      params.push(like, like, like);
    }
    sql += ' ORDER BY created_at DESC LIMIT 500';
    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/pacientes/:id
async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM pacientes WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Paciente no encontrado.' });
    res.json({ ok: true, datos: rows[0] });
  } catch (err) { next(err); }
}

// POST /api/pacientes
async function crear(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['nombre', 'numero_documento']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const columnas = CAMPOS.filter((c) => req.body[c] !== undefined);
    const valores = columnas.map((c) => {
      if (['acepta_tratamiento_datos', 'estado'].includes(c)) return req.body[c] ? 1 : 0;
      return req.body[c];
    });
    const placeholders = columnas.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO pacientes (${columnas.join(', ')}) VALUES (${placeholders})`,
      valores
    );
    res.status(201).json({ ok: true, mensaje: 'Paciente creado.', id: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/pacientes/:id
async function actualizar(req, res, next) {
  try {
    const campos = [];
    const valores = [];
    for (const c of CAMPOS) {
      if (req.body[c] !== undefined) {
        campos.push(`${c} = ?`);
        valores.push(['acepta_tratamiento_datos', 'estado'].includes(c) ? (req.body[c] ? 1 : 0) : req.body[c]);
      }
    }
    if (!campos.length) return res.status(400).json({ ok: false, mensaje: 'Nada que actualizar.' });
    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE pacientes SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Paciente no encontrado.' });
    res.json({ ok: true, mensaje: 'Paciente actualizado.' });
  } catch (err) { next(err); }
}

// DELETE /api/pacientes/:id  -> soft delete (estado = 0)
async function eliminar(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE pacientes SET estado = 0 WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Paciente no encontrado.' });
    res.json({ ok: true, mensaje: 'Paciente desactivado.' });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
