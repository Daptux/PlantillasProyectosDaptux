import { pool } from '../config/db.js';
import { asyncHandler, ApiError, buildOrderNumber, getPagination } from '../utils/helpers.js';
import { wompi, integritySignature } from '../config/wompi.js';

// Métodos que se pagan en línea con la pasarela (Wompi)
const METODOS_ONLINE = ['TARJETA', 'NEQUI', 'DAVIPLATA'];

const ESTADOS = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
const ESTADOS_PAGO = ['PENDIENTE', 'PAGADO', 'RECHAZADO', 'REEMBOLSADO'];
const METODOS = ['CONTRA_ENTREGA', 'TRANSFERENCIA', 'NEQUI', 'DAVIPLATA', 'TARJETA'];
// Estados en los que el stock ya fue descontado
const ESTADOS_CON_STOCK = ['CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'];

// POST /api/orders  (cliente: genera pedido desde su carrito)
export const createOrder = asyncHandler(async (req, res) => {
  const {
    nombre_cliente, telefono, direccion, ciudad, departamento,
    metodo_pago, observaciones, cupon_codigo,
  } = req.body;

  if (!direccion || !ciudad) throw new ApiError(422, 'Dirección y ciudad son obligatorias');
  if (metodo_pago && !METODOS.includes(metodo_pago)) throw new ApiError(422, 'Método de pago inválido');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Carrito del usuario
    const [carts] = await conn.query('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (!carts.length) throw new ApiError(400, 'Tu carrito está vacío');
    const cartId = carts[0].id;

    const [items] = await conn.query(
      `SELECT ci.*, p.nombre AS nombre_producto, p.precio, p.precio_descuento, p.en_oferta,
              v.talla, v.color, v.stock AS variant_stock,
              (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.es_principal DESC LIMIT 1) AS imagen
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN product_variants v ON v.id = ci.variant_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
    if (!items.length) throw new ApiError(400, 'Tu carrito está vacío');

    // Validar stock disponible
    for (const it of items) {
      if (it.variant_id && it.variant_stock < it.cantidad) {
        throw new ApiError(400, `Stock insuficiente para "${it.nombre_producto}" (disponible: ${it.variant_stock})`);
      }
    }

    // Calcular subtotal con precio efectivo
    let subtotal = 0;
    const detalle = items.map(it => {
      const precio = it.en_oferta && it.precio_descuento ? Number(it.precio_descuento) : Number(it.precio);
      const sub = precio * it.cantidad;
      subtotal += sub;
      return { ...it, precio_unitario: precio, subtotal_item: sub };
    });

    // Cupón (opcional)
    let descuento = 0;
    let cuponId = null;
    let cuponCodigoFinal = null;
    if (cupon_codigo) {
      const [cups] = await conn.query(
        `SELECT * FROM coupons WHERE codigo = ? AND estado = 1
         AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
         AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())`,
        [cupon_codigo]
      );
      if (cups.length) {
        const cup = cups[0];
        const okUsos = cup.usos_maximos == null || cup.usos_actuales < cup.usos_maximos;
        if (okUsos && subtotal >= Number(cup.monto_minimo)) {
          descuento = cup.tipo === 'PORCENTAJE'
            ? Math.round(subtotal * (Number(cup.valor) / 100))
            : Number(cup.valor);
          descuento = Math.min(descuento, subtotal);
          cuponId = cup.id;
          cuponCodigoFinal = cup.codigo;
        }
      }
    }

    // Costo de envío desde configuración
    const [settings] = await conn.query('SELECT costo_envio FROM store_settings LIMIT 1');
    const costoEnvio = settings.length ? Number(settings[0].costo_envio) : 0;
    const total = Math.max(0, subtotal - descuento) + costoEnvio;

    // Insertar pedido (número temporal, se corrige con el id)
    const [orderRes] = await conn.query(
      `INSERT INTO orders
        (numero, user_id, nombre_cliente, email_cliente, telefono, direccion, ciudad, departamento,
         observaciones, subtotal, descuento, costo_envio, total, cupon_id, cupon_codigo,
         metodo_pago, estado, estado_pago)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', 'PENDIENTE')`,
      [
        'TEMP', req.user.id, nombre_cliente || req.user.nombre, req.user.email,
        telefono || req.user.telefono, direccion, ciudad, departamento || null,
        observaciones || null, subtotal, descuento, costoEnvio, total,
        cuponId, cuponCodigoFinal, metodo_pago || 'CONTRA_ENTREGA',
      ]
    );
    const orderId = orderRes.insertId;
    const numero = buildOrderNumber(orderId);
    await conn.query('UPDATE orders SET numero = ? WHERE id = ?', [numero, orderId]);

    // Insertar items
    for (const it of detalle) {
      await conn.query(
        `INSERT INTO order_items
          (order_id, product_id, variant_id, nombre_producto, talla, color, imagen, precio_unitario, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, it.product_id, it.variant_id, it.nombre_producto, it.talla, it.color,
         it.imagen, it.precio_unitario, it.cantidad, it.subtotal_item]
      );
    }

    // Registro de pago inicial
    await conn.query(
      'INSERT INTO payments (order_id, metodo, monto, estado) VALUES (?, ?, ?, ?)',
      [orderId, metodo_pago || 'CONTRA_ENTREGA', total, 'PENDIENTE']
    );

    // Registrar uso del cupón
    if (cuponId) {
      await conn.query('UPDATE coupons SET usos_actuales = usos_actuales + 1 WHERE id = ?', [cuponId]);
      await conn.query('INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES (?, ?, ?)',
        [cuponId, req.user.id, orderId]);
    }

    // Vaciar carrito
    await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await conn.commit();

    // Si el pago es en línea, devolvemos ya los datos firmados para abrir Wompi
    // (evita una segunda llamada y un punto de falla en el checkout).
    let wompiData = null;
    const metodoFinal = metodo_pago || 'CONTRA_ENTREGA';
    if (METODOS_ONLINE.includes(metodoFinal) && wompi.publicKey && wompi.integritySecret) {
      const amountInCents = Math.round(Number(total) * 100);
      wompiData = {
        publicKey: wompi.publicKey,
        checkoutUrl: wompi.checkoutUrl,
        currency: wompi.currency,
        amountInCents,
        reference: numero,
        signature: integritySignature(numero, amountInCents, wompi.currency),
        email: req.user.email,
        fullName: nombre_cliente || req.user.nombre,
        phone: telefono || req.user.telefono,
      };
    }

    res.status(201).json({ message: 'Pedido creado', order_id: orderId, numero, total, wompi: wompiData });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// GET /api/orders/my-orders
export const myOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, numero, total, estado, estado_pago, metodo_pago, created_at,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS total_items
     FROM orders o WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// Carga un pedido con items y pagos
async function loadOrder(orderId) {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!orders.length) return null;
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  const [payments] = await pool.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
  return { ...orders[0], items, payments };
}

// GET /api/orders/:id  (cliente solo el suyo; admin/empleado cualquiera)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (!order) throw new ApiError(404, 'Pedido no encontrado');
  const esStaff = ['ADMIN', 'EMPLOYEE'].includes(req.user.rol);
  if (!esStaff && order.user_id !== req.user.id) throw new ApiError(403, 'No autorizado');
  res.json(order);
});

// GET /api/admin/orders  (admin/empleado, con filtros)
export const adminListOrders = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { estado, estado_pago, search, desde, hasta } = req.query;
  const where = [], params = [];
  if (estado) { where.push('o.estado = ?'); params.push(estado); }
  if (estado_pago) { where.push('o.estado_pago = ?'); params.push(estado_pago); }
  if (search) { where.push('(o.numero LIKE ? OR o.nombre_cliente LIKE ? OR o.email_cliente LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (desde) { where.push('o.created_at >= ?'); params.push(desde); }
  if (hasta) { where.push('o.created_at <= ?'); params.push(`${hasta} 23:59:59`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM orders o ${whereSql}`, params);
  const [rows] = await pool.query(
    `SELECT o.*, (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS total_items
     FROM orders o ${whereSql} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  res.json({
    data: rows,
    pagination: { page, limit, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limit) },
  });
});

// PUT /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) throw new ApiError(422, 'Estado inválido');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!orders.length) throw new ApiError(404, 'Pedido no encontrado');
    const order = orders[0];
    const anterior = order.estado;

    const teniaStock = ESTADOS_CON_STOCK.includes(anterior);
    const tendraStock = ESTADOS_CON_STOCK.includes(estado);

    const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ? AND variant_id IS NOT NULL', [id]);

    // Descontar inventario al confirmar (transición sin-stock -> con-stock)
    if (!teniaStock && tendraStock) {
      for (const it of items) {
        const [v] = await conn.query('SELECT stock FROM product_variants WHERE id = ? FOR UPDATE', [it.variant_id]);
        if (!v.length) continue;
        const stockAnterior = v[0].stock;
        const stockNuevo = Math.max(0, stockAnterior - it.cantidad);
        await conn.query('UPDATE product_variants SET stock = ? WHERE id = ?', [stockNuevo, it.variant_id]);
        await conn.query(
          `INSERT INTO inventory_movements (variant_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, user_id, order_id)
           VALUES (?, 'VENTA', ?, ?, ?, ?, ?, ?)`,
          [it.variant_id, it.cantidad, stockAnterior, stockNuevo, `Venta pedido ${order.numero}`, req.user.id, id]
        );
        await conn.query('UPDATE products SET ventas = ventas + ? WHERE id = ?', [it.cantidad, it.product_id]);
      }
    }

    // Devolver inventario al cancelar (con-stock -> CANCELADO)
    if (teniaStock && estado === 'CANCELADO') {
      for (const it of items) {
        const [v] = await conn.query('SELECT stock FROM product_variants WHERE id = ? FOR UPDATE', [it.variant_id]);
        if (!v.length) continue;
        const stockAnterior = v[0].stock;
        const stockNuevo = stockAnterior + it.cantidad;
        await conn.query('UPDATE product_variants SET stock = ? WHERE id = ?', [stockNuevo, it.variant_id]);
        await conn.query(
          `INSERT INTO inventory_movements (variant_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, user_id, order_id)
           VALUES (?, 'ENTRADA', ?, ?, ?, ?, ?, ?)`,
          [it.variant_id, it.cantidad, stockAnterior, stockNuevo, `Cancelación pedido ${order.numero}`, req.user.id, id]
        );
        await conn.query('UPDATE products SET ventas = GREATEST(0, ventas - ?) WHERE id = ?', [it.cantidad, it.product_id]);
      }
    }

    await conn.query('UPDATE orders SET estado = ? WHERE id = ?', [estado, id]);
    await conn.commit();
    res.json({ message: 'Estado actualizado', estado });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// ============================================================
//  Confirmación de pago (usado por Wompi: webhook y verificación)
// ============================================================

// Marca un pedido como PAGADO. Si aún estaba PENDIENTE, descuenta inventario
// y lo pasa a CONFIRMADO. Es idempotente (no descuenta dos veces).
export async function markOrderPaid(orderId, { transactionId, methodLabel } = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (!orders.length) { await conn.rollback(); return false; }
    const order = orders[0];

    // Descontar stock solo si el pedido todavía no lo tomó
    if (order.estado === 'PENDIENTE') {
      const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ? AND variant_id IS NOT NULL', [orderId]);
      for (const it of items) {
        const [v] = await conn.query('SELECT stock FROM product_variants WHERE id = ? FOR UPDATE', [it.variant_id]);
        if (!v.length) continue;
        const stockAnterior = v[0].stock;
        const stockNuevo = Math.max(0, stockAnterior - it.cantidad);
        await conn.query('UPDATE product_variants SET stock = ? WHERE id = ?', [stockNuevo, it.variant_id]);
        await conn.query(
          `INSERT INTO inventory_movements (variant_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, order_id)
           VALUES (?, 'VENTA', ?, ?, ?, ?, ?)`,
          [it.variant_id, it.cantidad, stockAnterior, stockNuevo, `Venta pagada pedido ${order.numero}`, orderId]
        );
        await conn.query('UPDATE products SET ventas = ventas + ? WHERE id = ?', [it.cantidad, it.product_id]);
      }
      await conn.query("UPDATE orders SET estado = 'CONFIRMADO' WHERE id = ?", [orderId]);
    }

    await conn.query("UPDATE orders SET estado_pago = 'PAGADO' WHERE id = ?", [orderId]);
    await conn.query(
      "UPDATE payments SET estado = 'PAGADO', referencia = ?, metodo = ? WHERE order_id = ?",
      [transactionId || null, methodLabel || 'WOMPI', orderId]
    );
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Marca el pago como RECHAZADO (no cancela el pedido; el cliente puede reintentar).
export async function markOrderPaymentFailed(orderId, { transactionId, methodLabel } = {}) {
  await pool.query("UPDATE orders SET estado_pago = 'RECHAZADO' WHERE id = ? AND estado_pago <> 'PAGADO'", [orderId]);
  await pool.query(
    "UPDATE payments SET estado = 'RECHAZADO', referencia = ?, metodo = ? WHERE order_id = ?",
    [transactionId || null, methodLabel || 'WOMPI', orderId]
  );
}

// PUT /api/admin/orders/:id/payment-status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado_pago } = req.body;
  if (!ESTADOS_PAGO.includes(estado_pago)) throw new ApiError(422, 'Estado de pago inválido');

  const [r] = await pool.query('UPDATE orders SET estado_pago = ? WHERE id = ?', [estado_pago, id]);
  if (!r.affectedRows) throw new ApiError(404, 'Pedido no encontrado');
  await pool.query('UPDATE payments SET estado = ? WHERE order_id = ?', [estado_pago, id]);
  res.json({ message: 'Estado de pago actualizado', estado_pago });
});
