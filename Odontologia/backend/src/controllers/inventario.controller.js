/**
 * backend/src/controllers/inventario.controller.js
 * Inventario de insumos, movimientos (entrada/salida) y alertas.
 */
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { camposRequeridos, badRequest } = require('../utils/validarCampos');
const { registrarLog } = require('../utils/logger');

const CAMPOS = ['nombre', 'categoria', 'descripcion', 'stock_actual', 'stock_minimo',
  'unidad_medida', 'fecha_vencimiento', 'proveedor_id', 'costo_unitario'];

/** GET /api/inventario?categoria=&buscar= */
const listar = asyncHandler(async (req, res) => {
  const { categoria, buscar } = req.query;
  const where = ['i.estado = 1'];
  const params = [];
  if (categoria) { where.push('i.categoria = ?'); params.push(categoria); }
  if (buscar) { where.push('i.nombre LIKE ?'); params.push(`%${buscar}%`); }
  const [rows] = await pool.query(
    `SELECT i.*, pr.nombre AS proveedor_nombre,
            (i.stock_actual <= i.stock_minimo) AS stock_bajo
     FROM inventario i
     LEFT JOIN proveedores pr ON pr.id = i.proveedor_id
     WHERE ${where.join(' AND ')}
     ORDER BY i.nombre`,
    params
  );
  res.json({ ok: true, data: rows });
});

/** GET /api/inventario/:id */
const obtener = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT i.*, pr.nombre AS proveedor_nombre FROM inventario i
     LEFT JOIN proveedores pr ON pr.id = i.proveedor_id WHERE i.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
  const [movs] = await pool.query(
    `SELECT m.*, u.nombre AS usuario_nombre FROM movimientos_inventario m
     LEFT JOIN usuarios u ON u.id = m.usuario_id WHERE m.inventario_id = ? ORDER BY m.fecha DESC LIMIT 50`,
    [req.params.id]
  );
  rows[0].movimientos = movs;
  res.json({ ok: true, data: rows[0] });
});

/** POST /api/inventario */
const crear = asyncHandler(async (req, res) => {
  const faltantes = camposRequeridos(req.body, ['nombre']);
  if (faltantes.length) return badRequest(res, 'El nombre es requerido.', { faltantes });

  const valores = CAMPOS.map((c) => {
    if (c === 'stock_actual' || c === 'stock_minimo') return req.body[c] ?? 0;
    if (c === 'costo_unitario') return req.body[c] ?? 0;
    if (c === 'categoria') return req.body[c] || 'Otros';
    if (c === 'unidad_medida') return req.body[c] || 'unidad';
    return req.body[c] !== undefined && req.body[c] !== '' ? req.body[c] : null;
  });
  const [result] = await pool.query(
    `INSERT INTO inventario (${CAMPOS.join(', ')}) VALUES (${CAMPOS.map(() => '?').join(', ')})`,
    valores
  );
  await registrarLog({ usuarioId: req.usuario.id, accion: 'CREAR_INSUMO', entidad: 'inventario', entidadId: result.insertId });
  res.status(201).json({ ok: true, mensaje: 'Insumo creado.', id: result.insertId });
});

/** PUT /api/inventario/:id */
const actualizar = asyncHandler(async (req, res) => {
  const campos = [];
  const valores = [];
  for (const c of CAMPOS) {
    if (req.body[c] !== undefined) { campos.push(`${c} = ?`); valores.push(req.body[c] === '' ? null : req.body[c]); }
  }
  if (!campos.length) return badRequest(res, 'Nada que actualizar.');
  valores.push(req.params.id);
  const [result] = await pool.query(`UPDATE inventario SET ${campos.join(', ')} WHERE id = ?`, valores);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
  res.json({ ok: true, mensaje: 'Insumo actualizado.' });
});

/** DELETE /api/inventario/:id  (soft delete) */
const eliminar = asyncHandler(async (req, res) => {
  const [result] = await pool.query('UPDATE inventario SET estado = 0 WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
  res.json({ ok: true, mensaje: 'Insumo inactivado.' });
});

/** POST /api/inventario/movimientos  (entrada/salida con actualización de stock en transacción) */
const registrarMovimiento = asyncHandler(async (req, res) => {
  const { inventario_id, tipo, cantidad, motivo } = req.body;
  const faltantes = camposRequeridos(req.body, ['inventario_id', 'tipo', 'cantidad']);
  if (faltantes.length) return badRequest(res, 'Faltan campos requeridos.', { faltantes });
  if (!['ENTRADA', 'SALIDA'].includes(tipo)) return badRequest(res, 'Tipo de movimiento inválido.');
  if (Number(cantidad) <= 0) return badRequest(res, 'La cantidad debe ser mayor a cero.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT stock_actual FROM inventario WHERE id = ? FOR UPDATE', [inventario_id]);
    if (!rows[0]) { await conn.rollback(); return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' }); }

    const stockActual = Number(rows[0].stock_actual);
    const nuevoStock = tipo === 'ENTRADA' ? stockActual + Number(cantidad) : stockActual - Number(cantidad);
    if (nuevoStock < 0) {
      await conn.rollback();
      return badRequest(res, 'Stock insuficiente: la cantidad supera el stock disponible.');
    }

    await conn.query('UPDATE inventario SET stock_actual = ? WHERE id = ?', [nuevoStock, inventario_id]);
    const [mov] = await conn.query(
      `INSERT INTO movimientos_inventario (inventario_id, tipo, cantidad, motivo, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [inventario_id, tipo, cantidad, motivo || null, req.usuario.id]
    );
    await conn.commit();
    await registrarLog({ usuarioId: req.usuario.id, accion: `INVENTARIO_${tipo}`, entidad: 'inventario', entidadId: inventario_id, detalle: `Cantidad: ${cantidad}` });
    res.status(201).json({ ok: true, mensaje: 'Movimiento registrado.', id: mov.insertId, stock_actual: nuevoStock });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/** GET /api/inventario/alertas/stock-bajo  (stock bajo, vencidos y próximos a vencer) */
const alertas = asyncHandler(async (req, res) => {
  const [stockBajo] = await pool.query(
    'SELECT * FROM inventario WHERE estado = 1 AND stock_actual <= stock_minimo ORDER BY nombre'
  );
  const [vencidos] = await pool.query(
    'SELECT * FROM inventario WHERE estado = 1 AND fecha_vencimiento IS NOT NULL AND fecha_vencimiento < CURDATE() ORDER BY fecha_vencimiento'
  );
  const [porVencer] = await pool.query(
    `SELECT * FROM inventario WHERE estado = 1 AND fecha_vencimiento IS NOT NULL
       AND fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
     ORDER BY fecha_vencimiento`
  );
  res.json({ ok: true, data: { stockBajo, vencidos, porVencer } });
});

/** GET /api/inventario/proveedores/all */
const listarProveedores = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, nombre FROM proveedores WHERE activo = 1 ORDER BY nombre');
  res.json({ ok: true, data: rows });
});

module.exports = { listar, obtener, crear, actualizar, eliminar, registrarMovimiento, alertas, listarProveedores };
