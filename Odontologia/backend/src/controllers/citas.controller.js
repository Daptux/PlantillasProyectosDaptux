/**
 * backend/src/controllers/citas.controller.js
 * Gestión de citas: CRUD, solicitud pública, cambio de estado y validaciones de agenda.
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, fechaNoPasada, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

const ESTADOS = ['SOLICITADA', 'CONFIRMADA', 'EN_ESPERA', 'EN_ATENCION',
  'FINALIZADA', 'CANCELADA', 'NO_ASISTIO', 'REPROGRAMADA'];

/** Verifica solapamiento de agenda para un odontólogo en una fecha/hora. */
async function hayConflictoAgenda({ odontologoId, fecha, horaInicio, horaFin, excluirId = null }) {
  if (!odontologoId) return false;
  const finCalc = horaFin || horaInicio;
  const [rows] = await pool.query(
    `SELECT id FROM citas
     WHERE odontologo_id = ? AND fecha = ?
       AND estado NOT IN ('CANCELADA','NO_ASISTIO','REPROGRAMADA')
       AND (? IS NULL OR id <> ?)
       AND (hora_inicio < ? AND COALESCE(hora_fin, hora_inicio) > ?)`,
    [odontologoId, fecha, excluirId, excluirId, finCalc, horaInicio]
  );
  return rows.length > 0;
}

/** GET /api/citas?fecha=&estado=&odontologo_id=&paciente_id= */
const listar = asyncHandler(async (req, res) => {
  const { fecha, estado, odontologo_id, paciente_id } = req.query;
  const where = [];
  const params = [];
  if (fecha) { where.push('c.fecha = ?'); params.push(fecha); }
  if (estado) { where.push('c.estado = ?'); params.push(estado); }
  if (odontologo_id) { where.push('c.odontologo_id = ?'); params.push(odontologo_id); }
  if (paciente_id) { where.push('c.paciente_id = ?'); params.push(paciente_id); }

  const [rows] = await pool.query(
    `SELECT c.*,
            CONCAT(p.nombres, ' ', p.apellidos) AS paciente_nombre,
            o.nombre AS odontologo_nombre,
            s.nombre AS servicio_nombre
     FROM citas c
     LEFT JOIN pacientes p ON p.id = c.paciente_id
     LEFT JOIN odontologos o ON o.id = c.odontologo_id
     LEFT JOIN servicios s ON s.id = c.servicio_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY c.fecha DESC, c.hora_inicio`,
    params
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/citas/:id */
const obtener = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, CONCAT(p.nombres,' ',p.apellidos) AS paciente_nombre,
            o.nombre AS odontologo_nombre, s.nombre AS servicio_nombre
     FROM citas c
     LEFT JOIN pacientes p ON p.id = c.paciente_id
     LEFT JOIN odontologos o ON o.id = c.odontologo_id
     LEFT JOIN servicios s ON s.id = c.servicio_id
     WHERE c.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
  res.json({ ok: true, data: rows[0] });
});

/** POST /api/citas  (interno, requiere auth) */
const crear = asyncHandler(async (req, res) => {
  const { paciente_id, odontologo_id, servicio_id, fecha, hora_inicio, hora_fin,
    motivo, observaciones, origen } = req.body;

  const faltantes = camposRequeridos(req.body, ['fecha', 'hora_inicio']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });
  if (!fechaNoPasada(fecha)) return badRequest(res, 'No se pueden agendar citas en fechas pasadas.');

  if (await hayConflictoAgenda({ odontologoId: odontologo_id, fecha, horaInicio: hora_inicio, horaFin: hora_fin })) {
    return res.status(409).json({ ok: false, mensaje: 'El odontólogo ya tiene una cita en ese horario.' });
  }

  const [result] = await pool.query(
    `INSERT INTO citas (paciente_id, odontologo_id, servicio_id, fecha, hora_inicio, hora_fin,
                        motivo, observaciones, estado, origen, confirmada, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMADA', ?, 1, ?)`,
    [paciente_id || null, odontologo_id || null, servicio_id || null, fecha, hora_inicio,
     hora_fin || null, motivo || null, observaciones || null, origen || 'PRESENCIAL', req.usuario.id]
  );
  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_CITA', entidad: 'citas', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Cita creada.', id: result.insertId });
});

/** POST /api/citas/solicitud  (PÚBLICA, desde la landing) */
const solicitudPublica = asyncHandler(async (req, res) => {
  const { nombre_contacto, telefono_contacto, correo_contacto, servicio_id,
    fecha, hora_inicio, motivo, acepta_datos } = req.body;

  const faltantes = camposRequeridos(req.body, ['nombre_contacto', 'telefono_contacto', 'fecha', 'hora_inicio']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });
  if (!acepta_datos) return badRequest(res, 'Debes aceptar el tratamiento de datos.');
  if (!fechaNoPasada(fecha)) return badRequest(res, 'La fecha deseada no puede ser pasada.');

  const [result] = await pool.query(
    `INSERT INTO citas (servicio_id, nombre_contacto, telefono_contacto, correo_contacto,
                        fecha, hora_inicio, motivo, estado, origen, confirmada)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'SOLICITADA', 'WEB', 0)`,
    [servicio_id || null, nombre_contacto, telefono_contacto, correo_contacto || null,
     fecha, hora_inicio, motivo || null]
  );
  res.status(201).json({
    ok: true,
    mensaje: '¡Solicitud recibida! Pronto te contactaremos para confirmar tu cita.',
    id: result.insertId,
  });
});

/** PUT /api/citas/:id */
const actualizar = asyncHandler(async (req, res) => {
  const campos = [];
  const valores = [];
  const editables = ['paciente_id', 'odontologo_id', 'servicio_id', 'fecha', 'hora_inicio',
    'hora_fin', 'motivo', 'observaciones', 'origen'];

  // Validar conflicto si cambian fecha/hora/odontólogo
  if (req.body.fecha || req.body.hora_inicio || req.body.odontologo_id) {
    const [actual] = await pool.query('SELECT * FROM citas WHERE id = ?', [req.params.id]);
    if (!actual[0]) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
    const odontologoId = req.body.odontologo_id ?? actual[0].odontologo_id;
    const fecha = req.body.fecha ?? actual[0].fecha;
    const horaInicio = req.body.hora_inicio ?? actual[0].hora_inicio;
    const horaFin = req.body.hora_fin ?? actual[0].hora_fin;
    if (fecha && !fechaNoPasada(fecha)) return badRequest(res, 'No se permiten fechas pasadas.');
    if (await hayConflictoAgenda({ odontologoId, fecha, horaInicio, horaFin, excluirId: req.params.id })) {
      return res.status(409).json({ ok: false, mensaje: 'El odontólogo ya tiene una cita en ese horario.' });
    }
  }

  for (const c of editables) {
    if (req.body[c] !== undefined) { campos.push(`${c} = ?`); valores.push(req.body[c] === '' ? null : req.body[c]); }
  }
  if (!campos.length) return badRequest(res, 'Nada que actualizar.');
  valores.push(req.params.id);
  const [result] = await pool.query(`UPDATE citas SET ${campos.join(', ')} WHERE id = ?`, valores);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
  await registrarLog({ usuarioId: req.usuario.id, accion: 'ACTUALIZAR_CITA', entidad: 'citas', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Cita actualizada.' });
});

/** PATCH /api/citas/:id/estado */
const cambiarEstado = asyncHandler(async (req, res) => {
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) return badRequest(res, 'Estado inválido.', { estadosValidos: ESTADOS });

  const confirmada = estado === 'CONFIRMADA' ? 1 : undefined;
  const sql = confirmada !== undefined
    ? 'UPDATE citas SET estado = ?, confirmada = 1 WHERE id = ?'
    : 'UPDATE citas SET estado = ? WHERE id = ?';
  const [result] = await pool.query(sql, [estado, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });

  await registrarLog({ usuarioId: req.usuario.id, accion: `CITA_${estado}`, entidad: 'citas', entidadId: req.params.id });
  res.json({ ok: true, mensaje: `Cita marcada como ${estado}.` });
});

/** DELETE /api/citas/:id */
const eliminar = asyncHandler(async (req, res) => {
  const [result] = await pool.query("UPDATE citas SET estado = 'CANCELADA' WHERE id = ?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
  await registrarLog({ usuarioId: req.usuario.id, accion: 'CANCELAR_CITA', entidad: 'citas', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Cita cancelada.' });
});

module.exports = { listar, obtener, crear, solicitudPublica, actualizar, cambiarEstado, eliminar };
