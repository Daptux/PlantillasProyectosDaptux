/**
 * backend/src/controllers/planesTratamiento.controller.js
 * Planes de tratamiento y sus detalles (procedimientos). Recalcula totales.
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

/** Recalcula total / total_final del plan a partir de sus detalles. */
async function recalcularTotales(planId) {
  const [[{ total }]] = await pool.query(
    'SELECT COALESCE(SUM(subtotal),0) AS total FROM detalle_planes_tratamiento WHERE plan_id = ?',
    [planId]
  );
  const [[plan]] = await pool.query('SELECT descuento FROM planes_tratamiento WHERE id = ?', [planId]);
  const descuento = Number(plan?.descuento || 0);
  const totalFinal = Math.max(0, Number(total) - descuento);
  await pool.query('UPDATE planes_tratamiento SET total = ?, total_final = ? WHERE id = ?', [total, totalFinal, planId]);
  return { total, totalFinal };
}

/** GET /api/planes?paciente_id= */
const listar = asyncHandler(async (req, res) => {
  const { paciente_id } = req.query;
  const where = [];
  const params = [];
  if (paciente_id) { where.push('p.paciente_id = ?'); params.push(paciente_id); }
  const [rows] = await pool.query(
    `SELECT p.*, CONCAT(pa.nombres,' ',pa.apellidos) AS paciente_nombre, o.nombre AS odontologo_nombre
     FROM planes_tratamiento p
     LEFT JOIN pacientes pa ON pa.id = p.paciente_id
     LEFT JOIN odontologos o ON o.id = p.odontologo_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY p.created_at DESC`,
    params
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/planes/:id  -> plan + detalles + abonos */
const obtener = asyncHandler(async (req, res) => {
  const [planes] = await pool.query(
    `SELECT p.*, CONCAT(pa.nombres,' ',pa.apellidos) AS paciente_nombre, o.nombre AS odontologo_nombre
     FROM planes_tratamiento p
     LEFT JOIN pacientes pa ON pa.id = p.paciente_id
     LEFT JOIN odontologos o ON o.id = p.odontologo_id WHERE p.id = ?`,
    [req.params.id]
  );
  if (!planes[0]) return res.status(404).json({ ok: false, mensaje: 'Plan no encontrado.' });

  const [detalles] = await pool.query(
    `SELECT d.*, s.nombre AS servicio_nombre FROM detalle_planes_tratamiento d
     LEFT JOIN servicios s ON s.id = d.servicio_id WHERE d.plan_id = ? ORDER BY d.id`,
    [req.params.id]
  );
  const [[{ abonado }]] = await pool.query(
    'SELECT COALESCE(SUM(monto),0) AS abonado FROM pagos WHERE plan_id = ?',
    [req.params.id]
  );
  const plan = planes[0];
  plan.detalles = detalles;
  plan.total_abonado = Number(abonado);
  plan.saldo_pendiente = Math.max(0, Number(plan.total_final) - Number(abonado));
  res.json({ ok: true, data: plan });
});

/** POST /api/planes */
const crear = asyncHandler(async (req, res) => {
  const { paciente_id, odontologo_id, nombre, diagnostico_general, descripcion, descuento } = req.body;
  const faltantes = camposRequeridos(req.body, ['paciente_id', 'nombre']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });

  const [result] = await pool.query(
    `INSERT INTO planes_tratamiento (paciente_id, odontologo_id, nombre, diagnostico_general, descripcion, descuento, total, total_final)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
    [paciente_id, odontologo_id || null, nombre, diagnostico_general || null, descripcion || null, descuento || 0]
  );

  // detalles iniciales opcionales
  if (Array.isArray(req.body.detalles) && req.body.detalles.length) {
    for (const d of req.body.detalles) {
      const subtotal = Number(d.precio || 0) * Number(d.cantidad || 1);
      await pool.query(
        `INSERT INTO detalle_planes_tratamiento (plan_id, servicio_id, numero_diente, descripcion, precio, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [result.insertId, d.servicio_id || null, d.numero_diente || null, d.descripcion || null,
         d.precio || 0, d.cantidad || 1, subtotal]
      );
    }
    await recalcularTotales(result.insertId);
  }

  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_PLAN', entidad: 'planes_tratamiento', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Plan de tratamiento creado.', id: result.insertId });
});

/** PUT /api/planes/:id */
const actualizar = asyncHandler(async (req, res) => {
  const campos = [];
  const valores = [];
  for (const c of ['nombre', 'diagnostico_general', 'descripcion', 'estado', 'descuento', 'odontologo_id']) {
    if (req.body[c] !== undefined) { campos.push(`${c} = ?`); valores.push(req.body[c] === '' ? null : req.body[c]); }
  }
  if (!campos.length) return badRequest(res, 'Nada que actualizar.');
  valores.push(req.params.id);
  const [result] = await pool.query(`UPDATE planes_tratamiento SET ${campos.join(', ')} WHERE id = ?`, valores);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Plan no encontrado.' });
  await recalcularTotales(req.params.id);
  await registrarLog({ usuarioId: req.usuario.id, accion: 'ACTUALIZAR_PLAN', entidad: 'planes_tratamiento', entidadId: req.params.id });
  res.json({ ok: true, mensaje: 'Plan actualizado.' });
});

/** POST /api/planes/:id/detalles */
const agregarDetalle = asyncHandler(async (req, res) => {
  const { servicio_id, numero_diente, descripcion, precio, cantidad } = req.body;
  const subtotal = Number(precio || 0) * Number(cantidad || 1);
  const [result] = await pool.query(
    `INSERT INTO detalle_planes_tratamiento (plan_id, servicio_id, numero_diente, descripcion, precio, cantidad, subtotal)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.params.id, servicio_id || null, numero_diente || null, descripcion || null, precio || 0, cantidad || 1, subtotal]
  );
  await recalcularTotales(req.params.id);
  res.status(201).json({ ok: true, mensaje: 'Procedimiento agregado al plan.', id: result.insertId });
});

/** PUT /api/planes/detalles/:id */
const actualizarDetalle = asyncHandler(async (req, res) => {
  const [actual] = await pool.query('SELECT * FROM detalle_planes_tratamiento WHERE id = ?', [req.params.id]);
  if (!actual[0]) return res.status(404).json({ ok: false, mensaje: 'Detalle no encontrado.' });

  const precio = req.body.precio ?? actual[0].precio;
  const cantidad = req.body.cantidad ?? actual[0].cantidad;
  const subtotal = Number(precio) * Number(cantidad);

  await pool.query(
    `UPDATE detalle_planes_tratamiento SET servicio_id = ?, numero_diente = ?, descripcion = ?,
            precio = ?, cantidad = ?, subtotal = ?, estado = ? WHERE id = ?`,
    [req.body.servicio_id ?? actual[0].servicio_id, req.body.numero_diente ?? actual[0].numero_diente,
     req.body.descripcion ?? actual[0].descripcion, precio, cantidad, subtotal,
     req.body.estado ?? actual[0].estado, req.params.id]
  );
  await recalcularTotales(actual[0].plan_id);
  res.json({ ok: true, mensaje: 'Procedimiento actualizado.' });
});

/** DELETE /api/planes/detalles/:id */
const eliminarDetalle = asyncHandler(async (req, res) => {
  const [actual] = await pool.query('SELECT plan_id FROM detalle_planes_tratamiento WHERE id = ?', [req.params.id]);
  if (!actual[0]) return res.status(404).json({ ok: false, mensaje: 'Detalle no encontrado.' });
  await pool.query('DELETE FROM detalle_planes_tratamiento WHERE id = ?', [req.params.id]);
  await recalcularTotales(actual[0].plan_id);
  res.json({ ok: true, mensaje: 'Procedimiento eliminado del plan.' });
});

module.exports = { listar, obtener, crear, actualizar, agregarDetalle, actualizarDetalle, eliminarDetalle };
