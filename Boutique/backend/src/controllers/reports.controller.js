import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/helpers.js';

// Ventas = pedidos no cancelados
const VENTA_FILTER = "estado <> 'CANCELADO'";

// GET /api/admin/reports/dashboard
export const dashboard = asyncHandler(async (req, res) => {
  const [[ventasMes]] = await pool.query(
    `SELECT COALESCE(SUM(total),0) AS total FROM orders
     WHERE ${VENTA_FILTER} AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`
  );
  const [[totalPedidos]] = await pool.query('SELECT COUNT(*) AS total FROM orders');
  const [[pendientes]] = await pool.query("SELECT COUNT(*) AS total FROM orders WHERE estado = 'PENDIENTE'");
  const [[clientes]] = await pool.query(
    "SELECT COUNT(*) AS total FROM users u JOIN roles r ON r.id = u.rol_id WHERE r.nombre = 'CUSTOMER' AND u.deleted_at IS NULL"
  );
  const [[bajoStock]] = await pool.query(
    'SELECT COUNT(*) AS total FROM product_variants v JOIN products p ON p.id = v.product_id WHERE v.stock <= v.stock_minimo AND p.deleted_at IS NULL'
  );
  const [[totalProductos]] = await pool.query('SELECT COUNT(*) AS total FROM products WHERE deleted_at IS NULL');

  const [ultimosPedidos] = await pool.query(
    `SELECT id, numero, nombre_cliente, total, estado, estado_pago, created_at
     FROM orders ORDER BY created_at DESC LIMIT 8`
  );
  const [masVendidos] = await pool.query(
    `SELECT p.id, p.nombre, p.ventas, p.precio,
            (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.es_principal DESC LIMIT 1) AS imagen
     FROM products p WHERE p.deleted_at IS NULL ORDER BY p.ventas DESC LIMIT 5`
  );

  res.json({
    ventas_mes: Number(ventasMes.total),
    total_pedidos: totalPedidos.total,
    pedidos_pendientes: pendientes.total,
    clientes: clientes.total,
    productos_bajo_stock: bajoStock.total,
    total_productos: totalProductos.total,
    ultimos_pedidos: ultimosPedidos,
    productos_mas_vendidos: masVendidos,
  });
});

// GET /api/admin/reports/sales?desde=&hasta=  (ventas por mes + totales en rango)
export const sales = asyncHandler(async (req, res) => {
  const { desde, hasta } = req.query;
  const where = [VENTA_FILTER], params = [];
  if (desde) { where.push('created_at >= ?'); params.push(desde); }
  if (hasta) { where.push('created_at <= ?'); params.push(`${hasta} 23:59:59`); }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const [[totales]] = await pool.query(
    `SELECT COALESCE(SUM(total),0) AS ingresos, COUNT(*) AS pedidos FROM orders ${whereSql}`, params);

  const [porMes] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS pedidos, COALESCE(SUM(total),0) AS ingresos
     FROM orders ${whereSql} GROUP BY mes ORDER BY mes ASC`, params);

  const [porEstado] = await pool.query(
    `SELECT estado, COUNT(*) AS total FROM orders GROUP BY estado`);

  res.json({
    ingresos: Number(totales.ingresos),
    pedidos: totales.pedidos,
    por_mes: porMes.map(m => ({ ...m, ingresos: Number(m.ingresos) })),
    por_estado: porEstado,
  });
});

// GET /api/admin/reports/best-products
export const bestProducts = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.nombre, p.ventas, p.precio, c.nombre AS categoria,
            (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.es_principal DESC LIMIT 1) AS imagen
     FROM products p LEFT JOIN categories c ON c.id = p.categoria_id
     WHERE p.deleted_at IS NULL ORDER BY p.ventas DESC LIMIT 20`
  );
  res.json(rows);
});

// GET /api/admin/reports/low-stock
export const lowStockReport = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT v.id AS variant_id, v.talla, v.color, v.sku, v.stock, v.stock_minimo,
            p.id AS product_id, p.nombre AS producto
     FROM product_variants v JOIN products p ON p.id = v.product_id
     WHERE v.stock <= v.stock_minimo AND p.deleted_at IS NULL ORDER BY v.stock ASC`
  );
  res.json(rows);
});

// GET /api/admin/reports/top-customers
export const topCustomers = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email,
            COUNT(o.id) AS total_pedidos, COALESCE(SUM(o.total),0) AS total_gastado
     FROM users u JOIN orders o ON o.user_id = u.id
     WHERE o.estado <> 'CANCELADO'
     GROUP BY u.id ORDER BY total_gastado DESC LIMIT 10`
  );
  res.json(rows.map(r => ({ ...r, total_gastado: Number(r.total_gastado) })));
});
