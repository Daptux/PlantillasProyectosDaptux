// backend/src/controllers/planesTratamiento.controller.js
// Planes de tratamiento + detalle (procedimientos). Recalcula totales automáticamente.

const { pool } = require('../config/db');
const { camposFaltantes } = require('../utils/validarCampos');

// Recalcula total/total_final del plan a partir de su detalle.
async function recalcularTotales(plan_id) {
  const [[{ suma }]] = await pool.query(
    'SELECT COALESCE(SUM(subtotal), 0) AS suma FROM detalle_planes_tratamiento WHERE plan_id = ? AND estado <> "CANCELADO"',
    [plan_id]
  );
  const [[plan]] = await pool.query('SELECT descuento FROM planes_tratamiento WHERE id = ?', [plan_id]);
  const descuento = plan ? Number(plan.descuento) : 0;
  const totalFinal = Math.max(0, Number(suma) - descuento);
  await pool.query('UPDATE planes_tratamiento SET total = ?, total_final = ? WHERE id = ?',
    [suma, totalFinal, plan_id]);
}

// GET /api/planes  -> ?paciente_id=&estado=
async function listar(req, res, next) {
  try {
    const { paciente_id, estado } = req.query;
    const where = [];
    const params = [];
    if (paciente_id) { where.push('pt.paciente_id = ?'); params.push(paciente_id); }
    if (estado) { where.push('pt.estado = ?'); params.push(estado); }
    const clausula = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT pt.*, p.nombre AS paciente_nombre, o.nombre AS odontologo_nombre
         FROM planes_tratamiento pt
         LEFT JOIN pacientes p ON p.id = pt.paciente_id
         LEFT JOIN odontologos o ON o.id = pt.odontologo_id
         ${clausula}
        ORDER BY pt.created_at DESC`, params
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/planes/:id  -> plan + detalle
async function obtener(req, res, next) {
  try {
    const [plan] = await pool.query(
      `SELECT pt.*, p.nombre AS paciente_nombre, o.nombre AS odontologo_nombre
         FROM planes_tratamiento pt
         LEFT JOIN pacientes p ON p.id = pt.paciente_id
         LEFT JOIN odontologos o ON o.id = pt.odontologo_id
        WHERE pt.id = ? LIMIT 1`, [req.params.id]
    );
    if (!plan[0]) return res.status(404).json({ ok: false, mensaje: 'Plan no encontrado.' });
    const [detalle] = await pool.query(
      `SELECT d.*, s.nombre AS servicio_nombre
         FROM detalle_planes_tratamiento d
         LEFT JOIN servicios s ON s.id = d.servicio_id
        WHERE d.plan_id = ? ORDER BY d.id ASC`, [req.params.id]
    );
    res.json({ ok: true, datos: { ...plan[0], detalle } });
  } catch (err) { next(err); }
}

// POST /api/planes
async function crear(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['paciente_id', 'nombre']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const { paciente_id, odontologo_id = null, nombre, diagnostico_general = null,
      descripcion = null, estado = 'PROPUESTO', descuento = 0 } = req.body;
    const [result] = await pool.query(
      `INSERT INTO planes_tratamiento
        (paciente_id, odontologo_id, nombre, diagnostico_general, descripcion, estado, descuento)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, odontologo_id, nombre, diagnostico_general, descripcion, estado, descuento]
    );
    res.status(201).json({ ok: true, mensaje: 'Plan creado.', id: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/planes/:id
async function actualizar(req, res, next) {
  try {
    const permitidos = ['nombre', 'odontologo_id', 'diagnostico_general', 'descripcion', 'estado', 'descuento'];
    const campos = [];
    const valores = [];
    for (const k of permitidos) {
      if (req.body[k] !== undefined) { campos.push(`${k} = ?`); valores.push(req.body[k]); }
    }
    if (!campos.length) return res.status(400).json({ ok: false, mensaje: 'Nada que actualizar.' });
    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE planes_tratamiento SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Plan no encontrado.' });
    await recalcularTotales(req.params.id);
    res.json({ ok: true, mensaje: 'Plan actualizado.' });
  } catch (err) { next(err); }
}

// POST /api/planes/:id/detalles  -> agrega un procedimiento al plan
async function agregarDetalle(req, res, next) {
  try {
    const { servicio_id = null, numero_diente = null, descripcion = null,
      precio = 0, cantidad = 1 } = req.body;
    const subtotal = Number(precio) * Number(cantidad);
    const [result] = await pool.query(
      `INSERT INTO detalle_planes_tratamiento
        (plan_id, servicio_id, numero_diente, descripcion, precio, cantidad, subtotal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, servicio_id, numero_diente, descripcion, precio, cantidad, subtotal]
    );
    await recalcularTotales(req.params.id);
    res.status(201).json({ ok: true, mensaje: 'Procedimiento agregado.', id: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/planes/detalles/:id  -> actualiza un procedimiento
async function actualizarDetalle(req, res, next) {
  try {
    const [actual] = await pool.query('SELECT * FROM detalle_planes_tratamiento WHERE id = ? LIMIT 1', [req.params.id]);
    if (!actual[0]) return res.status(404).json({ ok: false, mensaje: 'Detalle no encontrado.' });

    const precio = req.body.precio !== undefined ? Number(req.body.precio) : Number(actual[0].precio);
    const cantidad = req.body.cantidad !== undefined ? Number(req.body.cantidad) : Number(actual[0].cantidad);
    const subtotal = precio * cantidad;

    const { servicio_id, numero_diente, descripcion, estado } = req.body;
    await pool.query(
      `UPDATE detalle_planes_tratamiento
          SET servicio_id = ?, numero_diente = ?, descripcion = ?, precio = ?, cantidad = ?, subtotal = ?, estado = ?
        WHERE id = ?`,
      [servicio_id ?? actual[0].servicio_id, numero_diente ?? actual[0].numero_diente,
       descripcion ?? actual[0].descripcion, precio, cantidad, subtotal,
       estado ?? actual[0].estado, req.params.id]
    );
    await recalcularTotales(actual[0].plan_id);
    res.json({ ok: true, mensaje: 'Procedimiento actualizado.' });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, agregarDetalle, actualizarDetalle };
