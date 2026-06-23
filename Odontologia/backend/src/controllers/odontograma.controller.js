// backend/src/controllers/odontograma.controller.js
// Estado de cada pieza dental por paciente.

const { pool } = require('../config/db');
const { camposFaltantes } = require('../utils/validarCampos');

const ESTADOS = ['SANO', 'CARIES', 'RESTAURADO', 'CORONA', 'IMPLANTE', 'AUSENTE',
  'ENDODONCIA', 'FRACTURA', 'EXTRACCION_INDICADA', 'MOVILIDAD', 'EN_TRATAMIENTO'];

// GET /api/odontograma/:pacienteId
async function obtenerPorPaciente(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT od.*, o.nombre AS odontologo_nombre
         FROM odontograma od
         LEFT JOIN odontologos o ON o.id = od.odontologo_id
        WHERE od.paciente_id = ?
        ORDER BY od.numero_diente ASC`, [req.params.pacienteId]
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// POST /api/odontograma  -> crea/actualiza el estado de un diente (upsert por paciente+diente)
async function guardar(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['paciente_id', 'numero_diente']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const { paciente_id, numero_diente, estado = 'SANO', observaciones = null,
      tratamiento_sugerido = null, tratamiento_realizado = null, odontologo_id = null } = req.body;

    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ ok: false, mensaje: `Estado inválido. Válidos: ${ESTADOS.join(', ')}` });
    }

    const [existe] = await pool.query(
      'SELECT id FROM odontograma WHERE paciente_id = ? AND numero_diente = ? LIMIT 1',
      [paciente_id, numero_diente]
    );

    if (existe[0]) {
      await pool.query(
        `UPDATE odontograma
            SET estado = ?, observaciones = ?, tratamiento_sugerido = ?,
                tratamiento_realizado = ?, odontologo_id = ?, fecha = CURRENT_DATE
          WHERE id = ?`,
        [estado, observaciones, tratamiento_sugerido, tratamiento_realizado, odontologo_id, existe[0].id]
      );
      return res.json({ ok: true, mensaje: 'Diente actualizado.', id: existe[0].id });
    }

    const [result] = await pool.query(
      `INSERT INTO odontograma
        (paciente_id, numero_diente, estado, observaciones, tratamiento_sugerido, tratamiento_realizado, odontologo_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, numero_diente, estado, observaciones, tratamiento_sugerido, tratamiento_realizado, odontologo_id]
    );
    res.status(201).json({ ok: true, mensaje: 'Diente registrado.', id: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/odontograma/:id
async function actualizar(req, res, next) {
  try {
    const permitidos = ['estado', 'observaciones', 'tratamiento_sugerido', 'tratamiento_realizado', 'odontologo_id'];
    if (req.body.estado && !ESTADOS.includes(req.body.estado)) {
      return res.status(400).json({ ok: false, mensaje: 'Estado inválido.' });
    }
    const campos = [];
    const valores = [];
    for (const k of permitidos) {
      if (req.body[k] !== undefined) { campos.push(`${k} = ?`); valores.push(req.body[k]); }
    }
    if (!campos.length) return res.status(400).json({ ok: false, mensaje: 'Nada que actualizar.' });
    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE odontograma SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado.' });
    res.json({ ok: true, mensaje: 'Registro actualizado.' });
  } catch (err) { next(err); }
}

module.exports = { obtenerPorPaciente, guardar, actualizar };
