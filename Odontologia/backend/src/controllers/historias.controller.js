// backend/src/controllers/historias.controller.js
// Historia clínica (una por paciente) y evoluciones (registros inmutables).
// IMPORTANTE: nada se elimina físicamente; las correcciones se hacen con nuevas evoluciones.

const { pool } = require('../config/db');
const { camposFaltantes } = require('../utils/validarCampos');

// GET /api/historias/paciente/:pacienteId  -> historia + evoluciones
async function obtenerPorPaciente(req, res, next) {
  try {
    const { pacienteId } = req.params;
    const [hist] = await pool.query(
      `SELECT h.*, o.nombre AS odontologo_nombre
         FROM historias_clinicas h
         LEFT JOIN odontologos o ON o.id = h.odontologo_id
        WHERE h.paciente_id = ? LIMIT 1`, [pacienteId]
    );
    const [evol] = await pool.query(
      `SELECT e.*, o.nombre AS odontologo_nombre
         FROM evoluciones_clinicas e
         LEFT JOIN odontologos o ON o.id = e.odontologo_id
        WHERE e.paciente_id = ?
        ORDER BY e.created_at DESC`, [pacienteId]
    );
    res.json({ ok: true, datos: { historia: hist[0] || null, evoluciones: evol } });
  } catch (err) { next(err); }
}

// POST /api/historias  -> crea la historia principal (si no existe)
async function crear(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['paciente_id']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const { paciente_id, odontologo_id = null, motivo_consulta = null,
      antecedentes = null, diagnostico = null, observaciones = null } = req.body;

    const [existe] = await pool.query('SELECT id FROM historias_clinicas WHERE paciente_id = ?', [paciente_id]);
    if (existe[0]) {
      return res.status(409).json({ ok: false, mensaje: 'El paciente ya tiene historia clínica.', id: existe[0].id });
    }

    const [result] = await pool.query(
      `INSERT INTO historias_clinicas
        (paciente_id, odontologo_id, motivo_consulta, antecedentes, diagnostico, observaciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paciente_id, odontologo_id, motivo_consulta, antecedentes, diagnostico, observaciones]
    );
    res.status(201).json({ ok: true, mensaje: 'Historia clínica creada.', id: result.insertId });
  } catch (err) { next(err); }
}

// POST /api/historias/evoluciones  -> agrega una evolución (no editable)
async function crearEvolucion(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['paciente_id']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    let { historia_id } = req.body;
    const { paciente_id, cita_id = null, odontologo_id = null, procedimiento = null,
      diagnostico = null, descripcion = null, recomendaciones = null,
      medicamentos = null, proxima_cita_sugerida = null } = req.body;

    // Si no llega historia_id, busca o crea la historia del paciente
    if (!historia_id) {
      const [h] = await pool.query('SELECT id FROM historias_clinicas WHERE paciente_id = ?', [paciente_id]);
      if (h[0]) historia_id = h[0].id;
      else {
        const [nueva] = await pool.query(
          'INSERT INTO historias_clinicas (paciente_id, odontologo_id) VALUES (?, ?)', [paciente_id, odontologo_id]
        );
        historia_id = nueva.insertId;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO evoluciones_clinicas
        (historia_id, paciente_id, cita_id, odontologo_id, procedimiento, diagnostico,
         descripcion, recomendaciones, medicamentos, proxima_cita_sugerida)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [historia_id, paciente_id, cita_id, odontologo_id, procedimiento, diagnostico,
       descripcion, recomendaciones, medicamentos, proxima_cita_sugerida]
    );
    res.status(201).json({ ok: true, mensaje: 'Evolución registrada.', id: result.insertId });
  } catch (err) { next(err); }
}

// GET /api/historias/evoluciones/:pacienteId
async function listarEvoluciones(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, o.nombre AS odontologo_nombre
         FROM evoluciones_clinicas e
         LEFT JOIN odontologos o ON o.id = e.odontologo_id
        WHERE e.paciente_id = ?
        ORDER BY e.created_at DESC`, [req.params.pacienteId]
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

module.exports = { obtenerPorPaciente, crear, crearEvolucion, listarEvoluciones };
