/**
 * backend/src/controllers/odontograma.controller.js
 * Odontograma por paciente: estado de cada pieza dental (notación FDI).
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

const ESTADOS = ['SANO', 'CARIES', 'RESTAURADO', 'CORONA', 'IMPLANTE', 'AUSENTE',
  'ENDODONCIA', 'FRACTURA', 'EXTRACCION_INDICADA', 'MOVILIDAD', 'EN_TRATAMIENTO'];

/** GET /api/odontograma/:pacienteId */
const obtenerPorPaciente = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT od.*, o.nombre AS odontologo_nombre FROM odontograma od
     LEFT JOIN odontologos o ON o.id = od.odontologo_id
     WHERE od.paciente_id = ? ORDER BY od.numero_diente`,
    [req.params.pacienteId]
  );
  res.json({ ok: true, data: rows, estadosValidos: ESTADOS });
});

/** POST /api/odontograma  (crea o actualiza el estado de un diente - upsert) */
const guardar = asyncHandler(async (req, res) => {
  const { paciente_id, numero_diente, estado, observaciones,
    tratamiento_sugerido, tratamiento_realizado, odontologo_id, fecha } = req.body;
  const faltantes = camposRequeridos(req.body, ['paciente_id', 'numero_diente', 'estado']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });
  if (!ESTADOS.includes(estado)) return badRequest(res, 'Estado de diente inválido.', { estadosValidos: ESTADOS });

  const [result] = await pool.query(
    `INSERT INTO odontograma (paciente_id, numero_diente, estado, observaciones,
            tratamiento_sugerido, tratamiento_realizado, odontologo_id, fecha)
     VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURDATE()))
     ON DUPLICATE KEY UPDATE
        estado = VALUES(estado),
        observaciones = VALUES(observaciones),
        tratamiento_sugerido = VALUES(tratamiento_sugerido),
        tratamiento_realizado = VALUES(tratamiento_realizado),
        odontologo_id = VALUES(odontologo_id),
        fecha = VALUES(fecha)`,
    [paciente_id, numero_diente, estado, observaciones || null,
     tratamiento_sugerido || null, tratamiento_realizado || null, odontologo_id || null, fecha || null]
  );
  await registrarLog({ usuarioId: req.usuario.id, accion: 'GUARDAR_ODONTOGRAMA', entidad: 'odontograma', entidadId: result.insertId, detalle: `Diente ${numero_diente}` });
  res.status(201).json({ ok: true, mensaje: 'Diente actualizado en el odontograma.' });
});

/** PUT /api/odontograma/:id */
const actualizar = asyncHandler(async (req, res) => {
  const campos = [];
  const valores = [];
  for (const c of ['estado', 'observaciones', 'tratamiento_sugerido', 'tratamiento_realizado', 'odontologo_id', 'fecha']) {
    if (req.body[c] !== undefined) {
      if (c === 'estado' && !ESTADOS.includes(req.body[c])) return badRequest(res, 'Estado inválido.');
      campos.push(`${c} = ?`); valores.push(req.body[c] === '' ? null : req.body[c]);
    }
  }
  if (!campos.length) return badRequest(res, 'Nada que actualizar.');
  valores.push(req.params.id);
  const [result] = await pool.query(`UPDATE odontograma SET ${campos.join(', ')} WHERE id = ?`, valores);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado.' });
  res.json({ ok: true, mensaje: 'Odontograma actualizado.' });
});

module.exports = { obtenerPorPaciente, guardar, actualizar };
