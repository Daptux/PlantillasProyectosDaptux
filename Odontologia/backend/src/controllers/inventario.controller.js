// backend/src/controllers/inventario.controller.js
// Inventario odontológico + movimientos (entradas/salidas) con control de stock.

const { pool } = require('../config/db');
const { camposFaltantes } = require('../utils/validarCampos');

// GET /api/inventario  -> ?categoria=&buscar=
async function listar(req, res, next) {
  try {
    const { categoria, buscar } = req.query;
    const where = [];
    const params = [];
    if (categoria) { where.push('i.categoria = ?'); params.push(categoria); }
    if (buscar) { where.push('i.nombre LIKE ?'); params.push(`%${buscar}%`); }
    const clausula = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT i.*, pr.nombre AS proveedor_nombre
         FROM inventario i
         LEFT JOIN proveedores pr ON pr.id = i.proveedor_id
         ${clausula}
        ORDER BY i.nombre ASC`, params
    );
    res.json({ ok: true, datos: rows });
  } catch (err) { next(err); }
}

// GET /api/inventario/:id
async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM inventario WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
    const [movs] = await pool.query(
      'SELECT * FROM movimientos_inventario WHERE inventario_id = ? ORDER BY fecha DESC LIMIT 100', [req.params.id]
    );
    res.json({ ok: true, datos: { ...rows[0], movimientos: movs } });
  } catch (err) { next(err); }
}

const CAMPOS = ['nombre', 'categoria', 'descripcion', 'stock_actual', 'stock_minimo',
  'unidad_medida', 'fecha_vencimiento', 'proveedor_id', 'costo_unitario', 'estado'];

// POST /api/inventario
async function crear(req, res, next) {
  try {
    const faltantes = camposFaltantes(req.body, ['nombre']);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const columnas = CAMPOS.filter((c) => req.body[c] !== undefined);
    const valores = columnas.map((c) => (c === 'estado' ? (req.body[c] ? 1 : 0) : req.body[c]));
    const placeholders = columnas.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO inventario (${columnas.join(', ')}) VALUES (${placeholders})`, valores
    );
    res.status(201).json({ ok: true, mensaje: 'Insumo creado.', id: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/inventario/:id
async function actualizar(req, res, next) {
  try {
    const campos = [];
    const valores = [];
    for (const c of CAMPOS) {
      if (req.body[c] !== undefined) {
        campos.push(`${c} = ?`);
        valores.push(c === 'estado' ? (req.body[c] ? 1 : 0) : req.body[c]);
      }
    }
    if (!campos.length) return res.status(400).json({ ok: false, mensaje: 'Nada que actualizar.' });
    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE inventario SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
    res.json({ ok: true, mensaje: 'Insumo actualizado.' });
  } catch (err) { next(err); }
}

// DELETE /api/inventario/:id  -> soft delete (estado = 0)
async function eliminar(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE inventario SET estado = 0 WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
    res.json({ ok: true, mensaje: 'Insumo desactivado.' });
  } catch (err) { next(err); }
}

// POST /api/inventario/movimientos  -> registra entrada/salida y ajusta stock (transacción)
async function registrarMovimiento(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const faltantes = camposFaltantes(req.body, ['inventario_id', 'tipo', 'cantidad']);
    if (faltantes.length) {
      conn.release();
      return res.status(400).json({ ok: false, mensaje: `Campos requeridos: ${faltantes.join(', ')}` });
    }
    const { inventario_id, tipo, cantidad, motivo = null } = req.body;
    if (!['ENTRADA', 'SALIDA'].includes(tipo)) {
      conn.release();
      return res.status(400).json({ ok: false, mensaje: 'Tipo inválido (ENTRADA o SALIDA).' });
    }
    if (Number(cantidad) <= 0) {
      conn.release();
      return res.status(400).json({ ok: false, mensaje: 'La cantidad debe ser mayor a 0.' });
    }

    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT stock_actual FROM inventario WHERE id = ? FOR UPDATE', [inventario_id]);
    if (!rows[0]) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
    }

    const stockActual = Number(rows[0].stock_actual);
    const nuevoStock = tipo === 'ENTRADA' ? stockActual + Number(cantidad) : stockActual - Number(cantidad);
    if (nuevoStock < 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ ok: false, mensaje: 'El stock no puede quedar negativo.' });
    }

    await conn.query('UPDATE inventario SET stock_actual = ? WHERE id = ?', [nuevoStock, inventario_id]);
    await conn.query(
      'INSERT INTO movimientos_inventario (inventario_id, tipo, cantidad, motivo, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [inventario_id, tipo, cantidad, motivo, req.usuario ? req.usuario.id : null]
    );
    await conn.commit();
    conn.release();
    res.status(201).json({ ok: true, mensaje: 'Movimiento registrado.', stock_actual: nuevoStock });
  } catch (err) {
    await conn.rollback().catch(() => {});
    conn.release();
    next(err);
  }
}

// GET /api/inventario/alertas/stock-bajo  -> stock bajo, vencidos y próximos a vencer
async function alertas(req, res, next) {
  try {
    const [stockBajo] = await pool.query(
      'SELECT * FROM inventario WHERE estado = 1 AND stock_actual <= stock_minimo ORDER BY stock_actual ASC'
    );
    const [vencidos] = await pool.query(
      'SELECT * FROM inventario WHERE estado = 1 AND fecha_vencimiento IS NOT NULL AND fecha_vencimiento < CURRENT_DATE'
    );
    const [porVencer] = await pool.query(
      `SELECT * FROM inventario
        WHERE estado = 1 AND fecha_vencimiento IS NOT NULL
          AND fecha_vencimiento BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)`
    );
    res.json({ ok: true, datos: { stock_bajo: stockBajo, vencidos, por_vencer: porVencer } });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, registrarMovimiento, alertas };
