/**
 * backend/src/controllers/pagos.controller.js
 * Registro de pagos/abonos y cálculo de saldos.
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'NEQUI', 'DAVIPLATA', 'OTRO'];

/** GET /api/pagos?desde=&hasta= */
const listar = asyncHandler(async (req, res) => {
  const { desde, hasta } = req.query;
  const where = [];
  const params = [];
  if (desde) { where.push('DATE(pg.fecha) >= ?'); params.push(desde); }
  if (hasta) { where.push('DATE(pg.fecha) <= ?'); params.push(hasta); }
  const [rows] = await pool.query(
    `SELECT pg.*, CONCAT(p.nombres,' ',p.apellidos) AS paciente_nombre, u.nombre AS registrado_por_nombre
     FROM pagos pg
     LEFT JOIN pacientes p ON p.id = pg.paciente_id
     LEFT JOIN usuarios u ON u.id = pg.registrado_por
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY pg.fecha DESC`,
    params
  );
  res.json({ ok: true, data: rows });
});

/** POST /api/pagos */
const crear = asyncHandler(async (req, res) => {
  const { paciente_id, plan_id, cita_id, monto, metodo, concepto, observaciones } = req.body;
  const faltantes = camposRequeridos(req.body, ['paciente_id', 'monto']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });
  if (Number(monto) <= 0) return badRequest(res, 'El monto debe ser mayor a cero.');
  if (metodo && !METODOS.includes(metodo)) return badRequest(res, 'Método de pago inválido.', { metodos: METODOS });

  const [result] = await pool.query(
    `INSERT INTO pagos (paciente_id, plan_id, cita_id, monto, metodo, concepto, observaciones, registrado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [paciente_id, plan_id || null, cita_id || null, monto, metodo || 'EFECTIVO',
     concepto || null, observaciones || null, req.usuario.id]
  );
  await registrarLog({ usuarioId: req.usuario.id, accion: 'REGISTRAR_PAGO', entidad: 'pagos', entidadId: result.insertId, detalle: `Monto: ${monto}` });
  res.status(201).json({ ok: true, mensaje: 'Pago registrado.', id: result.insertId });
});

/** GET /api/pagos/paciente/:pacienteId */
const porPaciente = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT pg.*, pt.nombre AS plan_nombre, u.nombre AS registrado_por_nombre
     FROM pagos pg
     LEFT JOIN planes_tratamiento pt ON pt.id = pg.plan_id
     LEFT JOIN usuarios u ON u.id = pg.registrado_por
     WHERE pg.paciente_id = ? ORDER BY pg.fecha DESC`,
    [req.params.pacienteId]
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/pagos/saldo/:pacienteId  -> total tratamientos, abonado y saldo */
const saldoPaciente = asyncHandler(async (req, res) => {
  const { pacienteId } = req.params;
  const [[{ total_tratamientos }]] = await pool.query(
    `SELECT COALESCE(SUM(total_final),0) AS total_tratamientos FROM planes_tratamiento
     WHERE paciente_id = ? AND estado <> 'CANCELADO'`,
    [pacienteId]
  );
  const [[{ total_abonado }]] = await pool.query(
    'SELECT COALESCE(SUM(monto),0) AS total_abonado FROM pagos WHERE paciente_id = ?',
    [pacienteId]
  );
  const saldo = Number(total_tratamientos) - Number(total_abonado);
  res.json({
    ok: true,
    data: {
      total_tratamientos: Number(total_tratamientos),
      total_abonado: Number(total_abonado),
      saldo_pendiente: saldo > 0 ? saldo : 0,
      saldo_a_favor: saldo < 0 ? Math.abs(saldo) : 0,
    },
  });
});

module.exports = { listar, crear, porPaciente, saldoPaciente };
