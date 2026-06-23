// backend/src/controllers/pagos.controller.js
// Pagos/abonos y cálculo de saldos por paciente.

const { pool } = require('../config/db');
const { camposFaltantes, esNoNegativo } = require('../utils/validarCampos');

// GET /api/pagos  -> ?paciente_id=&desde=&hasta=
async function listar(req, res, next) {
  try {
    const { paciente_id, desde, hasta } = req.query;
    const where = [];
    const params = [];
    if (paciente_id) { where.push('pg.paciente_id = ?'); params.push(paciente_id); }
    if (desde) { where.push('pg.fecha >= ?'); params.push(desde); }
    if (hasta) { where.push('pg.fecha <= ?'); params.push(`${hasta} 23:59:59`); }
    const clausula = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT pg.*, p.nombre AS paciente_nombre, u.nombre AS registrado_por_nombre
         FROM pagos pg
         LEFT JOIN pacientes p ON p.id = pg.paciente_id
         LEFT JOIN usuarios u ON u.id = pg.registrado_por
         ${clausula}
        ORDER BY pg.fecha DESC LIMIT 500`, params
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// POST /api/pagos
async function crear(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['paciente_id', 'monto']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    if (!esNoNegativo(req.body.monto) || Number(req.body.monto) <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'El monto debe ser mayor a 0.' });
    }
    const { paciente_id, plan_id = null, cita_id = null, monto,
      metodo = 'EFECTIVO', concepto = null, observaciones = null } = req.body;
    const [result] = await pool.query(
      `INSERT INTO pagos (paciente_id, plan_id, cita_id, monto, metodo, concepto, observaciones, registrado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, plan_id, cita_id, monto, metodo, concepto, observaciones,
       req.usuario ? req.usuario.id : null]
    );
    res.status(201).json({ ok: true, mensaje: 'Pago registrado.', id: result.insertId });
  } catch (err) { next(err); }
}

// GET /api/pagos/paciente/:pacienteId  -> historial de pagos del paciente
async function porPaciente(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM pagos WHERE paciente_id = ? ORDER BY fecha DESC', [req.params.pacienteId]
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/pagos/saldo/:pacienteId  -> total tratamientos, abonado y saldo
async function saldo(req, res, next) {
  try {
    const { pacienteId } = req.params;
    const [[{ total_tratamientos }]] = await pool.query(
      `SELECT COALESCE(SUM(total_final), 0) AS total_tratamientos
         FROM planes_tratamiento
        WHERE paciente_id = ? AND estado IN ('ACEPTADO','EN_PROCESO','FINALIZADO')`,
      [pacienteId]
    );
    const [[{ total_abonado }]] = await pool.query(
      'SELECT COALESCE(SUM(monto), 0) AS total_abonado FROM pagos WHERE paciente_id = ?', [pacienteId]
    );
    const saldoPendiente = Number(total_tratamientos) - Number(total_abonado);
    res.json({
      ok: true,
      datos: {
        total_tratamientos: Number(total_tratamientos),
        total_abonado: Number(total_abonado),
        saldo_pendiente: saldoPendiente,
      },
    });
  } catch (err) { next(err); }
}

module.exports = { listar, crear, porPaciente, saldo };
