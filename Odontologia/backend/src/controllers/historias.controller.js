/**
 * backend/src/controllers/historias.controller.js
 * Historia clínica (1 por paciente) y evoluciones (append-only, no se eliminan).
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

/** GET /api/historias/paciente/:pacienteId  -> historia + evoluciones */
const obtenerPorPaciente = asyncHandler(async (req, res) => {
  const { pacienteId } = req.params;
  const [historias] = await pool.query(
    `SELECT h.*, o.nombre AS odontologo_nombre FROM historias_clinicas h
     LEFT JOIN odontologos o ON o.id = h.odontologo_id WHERE h.paciente_id = ?`,
    [pacienteId]
  );
  const [evoluciones] = await pool.query(
    `SELECT e.*, o.nombre AS odontologo_nombre FROM evoluciones_clinicas e
     LEFT JOIN odontologos o ON o.id = e.odontologo_id
     WHERE e.paciente_id = ? ORDER BY e.created_at DESC`,
    [pacienteId]
  );
  res.json({ ok: true, data: { historia: historias[0] || null, evoluciones } });
});

/** POST /api/historias  (crea o actualiza la historia principal del paciente) */
const crearOActualizar = asyncHandler(async (req, res) => {
  const { paciente_id, odontologo_id, motivo_consulta, antecedentes, diagnostico, observaciones } = req.body;
  const faltantes = camposRequeridos(req.body, ['paciente_id']);
  if (faltantes.length) return badRequest(res, 'paciente_id es requerido.', { faltantes });

  const [existe] = await pool.query('SELECT id FROM historias_clinicas WHERE paciente_id = ?', [paciente_id]);

  if (existe[0]) {
    await pool.query(
      `UPDATE historias_clinicas SET odontologo_id = ?, motivo_consulta = ?, antecedentes = ?,
              diagnostico = ?, observaciones = ? WHERE paciente_id = ?`,
      [odontologo_id || null, motivo_consulta || null, antecedentes || null, diagnostico || null, observaciones || null, paciente_id]
    );
    await registrarLog({ usuarioId: req.usuario.id, accion: 'ACTUALIZAR_HISTORIA', entidad: 'historias_clinicas', entidadId: existe[0].id });
    return res.json({ ok: true, mensaje: 'Historia clínica actualizada.', id: existe[0].id });
  }

  const [result] = await pool.query(
    `INSERT INTO historias_clinicas (paciente_id, odontologo_id, motivo_consulta, antecedentes, diagnostico, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [paciente_id, odontologo_id || null, motivo_consulta || null, antecedentes || null, diagnostico || null, observaciones || null]
  );
  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_HISTORIA', entidad: 'historias_clinicas', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Historia clínica creada.', id: result.insertId });
});

/** POST /api/historias/evoluciones */
const crearEvolucion = asyncHandler(async (req, res) => {
  const { paciente_id, cita_id, odontologo_id, procedimiento, diagnostico,
    descripcion, recomendaciones, medicamentos, proxima_cita_sugerida } = req.body;
  const faltantes = camposRequeridos(req.body, ['paciente_id']);
  if (faltantes.length) return badRequest(res, 'paciente_id es requerido.', { faltantes });

  // Asegurar que exista la historia principal
  let [historia] = await pool.query('SELECT id FROM historias_clinicas WHERE paciente_id = ?', [paciente_id]);
  let historiaId = historia[0]?.id;
  if (!historiaId) {
    const [nueva] = await pool.query(
      'INSERT INTO historias_clinicas (paciente_id, odontologo_id) VALUES (?, ?)',
      [paciente_id, odontologo_id || null]
    );
    historiaId = nueva.insertId;
  }

  const [result] = await pool.query(
    `INSERT INTO evoluciones_clinicas (historia_id, paciente_id, cita_id, odontologo_id, procedimiento,
            diagnostico, descripcion, recomendaciones, medicamentos, proxima_cita_sugerida)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [historiaId, paciente_id, cita_id || null, odontologo_id || null, procedimiento || null,
     diagnostico || null, descripcion || null, recomendaciones || null, medicamentos || null,
     proxima_cita_sugerida || null]
  );
  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_EVOLUCION', entidad: 'evoluciones_clinicas', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Evolución registrada.', id: result.insertId });
});

/** GET /api/historias/evoluciones/:pacienteId */
const listarEvoluciones = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT e.*, o.nombre AS odontologo_nombre FROM evoluciones_clinicas e
     LEFT JOIN odontologos o ON o.id = e.odontologo_id
     WHERE e.paciente_id = ? ORDER BY e.created_at DESC`,
    [req.params.pacienteId]
  );
  res.json({ ok: true, data: rows });
});

module.exports = { obtenerPorPaciente, crearOActualizar, crearEvolucion, listarEvoluciones };
