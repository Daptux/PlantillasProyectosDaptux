// backend/src/controllers/citas.controller.js
// Gestión de citas: CRUD, cambio de estado, reserva pública desde la landing.

const { pool } = require('../config/db');
const { camposFaltantes, fechaNoPasada } = require('../utils/validarCampos');

const ESTADOS_VALIDOS = ['SOLICITADA', 'CONFIRMADA', 'EN_ESPERA', 'EN_ATENCION',
  'FINALIZADA', 'CANCELADA', 'NO_ASISTIO', 'REPROGRAMADA'];

const SELECT_BASE = `
  SELECT c.*,
         p.nombre AS paciente_nombre,
         o.nombre AS odontologo_nombre,
         s.nombre AS servicio_nombre
    FROM citas c
    LEFT JOIN pacientes p   ON p.id = c.paciente_id
    LEFT JOIN odontologos o ON o.id = c.odontologo_id
    LEFT JOIN servicios s   ON s.id = c.servicio_id`;

// Verifica que el odontólogo no tenga otra cita activa en la misma fecha/hora.
async function hayChoqueHorario(odontologo_id, fecha, hora_inicio, excluirCitaId = null) {
  if (!odontologo_id) return false;
  let sql = `SELECT id FROM citas
              WHERE odontologo_id = ? AND fecha = ? AND hora_inicio = ?
                AND estado NOT IN ('CANCELADA','NO_ASISTIO','REPROGRAMADA')`;
  const params = [odontologo_id, fecha, hora_inicio];
  if (excluirCitaId) { sql += ' AND id <> ?'; params.push(excluirCitaId); }
  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
}

// GET /api/citas  -> ?fecha=&estado=&odontologo_id=&paciente_id=
async function listar(req, res, next) {
  try {
    const { fecha, estado, odontologo_id, paciente_id } = req.query;
    const where = [];
    const params = [];
    if (fecha) { where.push('c.fecha = ?'); params.push(fecha); }
    if (estado) { where.push('c.estado = ?'); params.push(estado); }
    if (odontologo_id) { where.push('c.odontologo_id = ?'); params.push(odontologo_id); }
    if (paciente_id) { where.push('c.paciente_id = ?'); params.push(paciente_id); }
    const clausula = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `${SELECT_BASE} ${clausula} ORDER BY c.fecha DESC, c.hora_inicio ASC LIMIT 500`, params
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/citas/:id
async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE c.id = ? LIMIT 1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
    res.json({ ok: true, datos: rows[0] });
  } catch (err) { next(err); }
}

// POST /api/citas  (interno: recepción/admin)
async function crear(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['fecha', 'hora_inicio']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const {
      paciente_id = null, odontologo_id = null, servicio_id = null,
      nombre_contacto = null, telefono_contacto = null, correo_contacto = null,
      fecha, hora_inicio, hora_fin = null, motivo = null,
      estado = 'CONFIRMADA', origen = 'PRESENCIAL', confirmada = 0, observaciones = null,
    } = req.body;

    if (!fechaNoPasada(fecha)) {
      return res.status(400).json({ ok: false, mensaje: 'No se pueden agendar citas en fechas pasadas.' });
    }
    if (await hayChoqueHorario(odontologo_id, fecha, hora_inicio)) {
      return res.status(409).json({ ok: false, mensaje: 'El odontólogo ya tiene una cita en ese horario.' });
    }

    const [result] = await pool.query(
      `INSERT INTO citas
        (paciente_id, odontologo_id, servicio_id, nombre_contacto, telefono_contacto, correo_contacto,
         fecha, hora_inicio, hora_fin, motivo, estado, origen, confirmada, observaciones, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, odontologo_id, servicio_id, nombre_contacto, telefono_contacto, correo_contacto,
       fecha, hora_inicio, hora_fin, motivo, estado, origen, confirmada ? 1 : 0, observaciones,
       req.usuario ? req.usuario.id : null]
    );
    res.status(201).json({ ok: true, mensaje: 'Cita creada.', id: result.insertId });
  } catch (err) { next(err); }
}

// POST /api/citas/publica  (landing: queda en estado SOLICITADA, sin auth)
async function crearPublica(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['nombre_contacto', 'telefono_contacto', 'fecha']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    if (!req.body.acepta_datos) {
      return res.status(400).json({ ok: false, mensaje: 'Debes aceptar el tratamiento de datos.' });
    }
    if (!fechaNoPasada(req.body.fecha)) {
      return res.status(400).json({ ok: false, mensaje: 'La fecha deseada no puede ser pasada.' });
    }

    const {
      nombre_contacto, telefono_contacto, correo_contacto = null,
      servicio_id = null, fecha, hora_inicio = null, motivo = null,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO citas
        (servicio_id, nombre_contacto, telefono_contacto, correo_contacto, fecha, hora_inicio, motivo, estado, origen)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'SOLICITADA', 'WEB')`,
      [servicio_id, nombre_contacto, telefono_contacto, correo_contacto, fecha, hora_inicio, motivo]
    );
    res.status(201).json({
      ok: true,
      mensaje: 'Tu solicitud de cita fue recibida. Pronto te contactaremos para confirmar.',
      id: result.insertId,
    });
  } catch (err) { next(err); }
}

// PUT /api/citas/:id
async function actualizar(req, res, next) {
  try {
    const permitidos = ['paciente_id', 'odontologo_id', 'servicio_id', 'nombre_contacto',
      'telefono_contacto', 'correo_contacto', 'fecha', 'hora_inicio', 'hora_fin',
      'motivo', 'estado', 'origen', 'confirmada', 'observaciones'];

    // Si cambia fecha/hora/odontólogo, valida choque de horario
    if (req.body.fecha || req.body.hora_inicio || req.body.odontologo_id) {
      const [actualRows] = await pool.query('SELECT * FROM citas WHERE id = ? LIMIT 1', [req.params.id]);
      if (!actualRows[0]) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
      const actual = actualRows[0];
      const odo = req.body.odontologo_id ?? actual.odontologo_id;
      const fec = req.body.fecha ?? actual.fecha;
      const hin = req.body.hora_inicio ?? actual.hora_inicio;
      if (await hayChoqueHorario(odo, fec, hin, req.params.id)) {
        return res.status(409).json({ ok: false, mensaje: 'El odontólogo ya tiene una cita en ese horario.' });
      }
    }

    const campos = [];
    const valores = [];
    for (const k of permitidos) {
      if (req.body[k] !== undefined) {
        campos.push(`${k} = ?`);
        valores.push(k === 'confirmada' ? (req.body[k] ? 1 : 0) : req.body[k]);
      }
    }
    if (!campos.length) return res.status(400).json({ ok: false, mensaje: 'Nada que actualizar.' });
    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE citas SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
    res.json({ ok: true, mensaje: 'Cita actualizada.' });
  } catch (err) { next(err); }
}

// PATCH /api/citas/:id/estado  -> { estado }
async function cambiarEstado(req, res, next) {
  try {
    const { estado } = req.body;
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ ok: false, mensaje: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}` });
    }
    const confirmada = estado === 'CONFIRMADA' ? 1 : null;
    const [result] = await pool.query(
      `UPDATE citas SET estado = ? ${confirmada !== null ? ', confirmada = 1' : ''} WHERE id = ?`,
      [estado, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });

    if (req.usuario) {
      pool.query(
        'INSERT INTO logs_actividad (usuario_id, accion, entidad, entidad_id, detalle) VALUES (?, ?, ?, ?, ?)',
        [req.usuario.id, 'CAMBIO_ESTADO_CITA', 'citas', req.params.id, `Estado -> ${estado}`]
      ).catch(() => {});
    }
    res.json({ ok: true, mensaje: `Cita marcada como ${estado}.` });
  } catch (err) { next(err); }
}

// DELETE /api/citas/:id  -> marca como CANCELADA (no se borra físicamente)
async function eliminar(req, res, next) {
  try {
    const [result] = await pool.query("UPDATE citas SET estado = 'CANCELADA' WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
    res.json({ ok: true, mensaje: 'Cita cancelada.' });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, crearPublica, actualizar, cambiarEstado, eliminar };
