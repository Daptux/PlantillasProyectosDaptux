import { pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/helpers.js';

// GET /api/admin/inventory   (productos con su foto, categoría y variantes/stock agrupados)
export const listInventory = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const where = ['p.deleted_at IS NULL'], params = [];
  if (search) {
    where.push('(p.nombre LIKE ? OR EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.sku LIKE ?))');
    params.push(`%${search}%`, `%${search}%`);
  }

  // Productos (incluye los que aún no tienen variantes)
  const [products] = await pool.query(
    `SELECT p.id AS product_id, p.nombre AS producto, p.precio, p.estado,
            c.nombre AS categoria, b.nombre AS marca,
            (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.es_principal DESC, pi.orden ASC LIMIT 1) AS imagen,
            (SELECT COALESCE(SUM(stock),0) FROM product_variants v WHERE v.product_id = p.id) AS stock_total,
            (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id AND v.stock <= v.stock_minimo) AS variantes_bajo_stock
     FROM products p
     LEFT JOIN categories c ON c.id = p.categoria_id
     LEFT JOIN brands b ON b.id = p.marca_id
     WHERE ${where.join(' AND ')}
     ORDER BY variantes_bajo_stock DESC, p.nombre ASC`,
    params
  );

  // Variantes de todos esos productos
  const ids = products.map(p => p.product_id);
  let variants = [];
  if (ids.length) {
    const [vrows] = await pool.query(
      `SELECT id AS variant_id, product_id, talla, color, color_hex, sku, stock, stock_minimo, estado,
              (stock <= stock_minimo) AS bajo_stock
       FROM product_variants WHERE product_id IN (?) ORDER BY id ASC`,
      [ids]
    );
    variants = vrows;
  }

  // Agrupa variantes dentro de cada producto
  const data = products.map(p => ({
    ...p,
    bajo_stock: p.variantes_bajo_stock > 0,
    variants: variants.filter(v => v.product_id === p.product_id),
  }));

  res.json(data);
});

// GET /api/admin/inventory/low-stock
export const lowStock = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT v.id AS variant_id, v.talla, v.color, v.sku, v.stock, v.stock_minimo,
            p.id AS product_id, p.nombre AS producto
     FROM product_variants v JOIN products p ON p.id = v.product_id
     WHERE v.stock <= v.stock_minimo AND p.deleted_at IS NULL
     ORDER BY v.stock ASC`
  );
  res.json(rows);
});

// POST /api/admin/inventory/movement  { variant_id, tipo, cantidad, motivo }
export const registerMovement = asyncHandler(async (req, res) => {
  const { variant_id, tipo, cantidad, motivo } = req.body;
  const tipos = ['ENTRADA', 'SALIDA', 'AJUSTE'];
  if (!tipos.includes(tipo)) throw new ApiError(422, 'Tipo de movimiento inválido (ENTRADA, SALIDA, AJUSTE)');
  const qty = Number(cantidad);
  if (!variant_id || isNaN(qty) || qty <= 0) throw new ApiError(422, 'variant_id y cantidad (>0) son obligatorios');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [v] = await conn.query('SELECT stock FROM product_variants WHERE id = ? FOR UPDATE', [variant_id]);
    if (!v.length) throw new ApiError(404, 'Variante no encontrada');
    const stockAnterior = v[0].stock;

    let stockNuevo;
    if (tipo === 'ENTRADA') stockNuevo = stockAnterior + qty;
    else if (tipo === 'SALIDA') stockNuevo = Math.max(0, stockAnterior - qty);
    else stockNuevo = qty; // AJUSTE = fija el valor

    await conn.query('UPDATE product_variants SET stock = ? WHERE id = ?', [stockNuevo, variant_id]);
    await conn.query(
      `INSERT INTO inventory_movements (variant_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [variant_id, tipo, qty, stockAnterior, stockNuevo, motivo || null, req.user.id]
    );
    await conn.commit();
    res.status(201).json({ message: 'Movimiento registrado', stock_anterior: stockAnterior, stock_nuevo: stockNuevo });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// GET /api/admin/inventory/movements?variant_id=
export const listMovements = asyncHandler(async (req, res) => {
  const { variant_id } = req.query;
  const where = [], params = [];
  if (variant_id) { where.push('m.variant_id = ?'); params.push(variant_id); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT m.*, p.nombre AS producto, v.sku, u.nombre AS usuario
     FROM inventory_movements m
     JOIN product_variants v ON v.id = m.variant_id
     JOIN products p ON p.id = v.product_id
     LEFT JOIN users u ON u.id = m.user_id
     ${whereSql} ORDER BY m.created_at DESC LIMIT 200`,
    params
  );
  res.json(rows);
});
