import { pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/helpers.js';

// Obtiene (o crea) el carrito del usuario
async function getOrCreateCart(userId) {
  const [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (carts.length) return carts[0].id;
  const [r] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return r.insertId;
}

// Devuelve el carrito completo con items y totales
async function buildCart(cartId) {
  const [items] = await pool.query(
    `SELECT ci.id, ci.product_id, ci.variant_id, ci.cantidad, ci.precio_unitario,
            p.nombre, p.slug,
            v.talla, v.color, v.stock,
            (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.es_principal DESC LIMIT 1) AS imagen
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN product_variants v ON v.id = ci.variant_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );
  const subtotal = items.reduce((acc, it) => acc + Number(it.precio_unitario) * it.cantidad, 0);
  return {
    cart_id: cartId,
    items: items.map(it => ({ ...it, subtotal: Number(it.precio_unitario) * it.cantidad })),
    subtotal,
    total_items: items.reduce((acc, it) => acc + it.cantidad, 0),
  };
}

// Precio efectivo de un producto
async function productPrice(productId) {
  const [rows] = await pool.query(
    'SELECT precio, precio_descuento, en_oferta FROM products WHERE id = ? AND deleted_at IS NULL', [productId]);
  if (!rows.length) throw new ApiError(404, 'Producto no encontrado');
  const p = rows[0];
  return p.en_oferta && p.precio_descuento ? Number(p.precio_descuento) : Number(p.precio);
}

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  res.json(await buildCart(cartId));
});

// POST /api/cart/items   { product_id, variant_id, cantidad }
export const addItem = asyncHandler(async (req, res) => {
  const { product_id, variant_id, cantidad } = req.body;
  const qty = Math.max(1, Number(cantidad) || 1);
  if (!product_id) throw new ApiError(422, 'product_id es obligatorio');

  // Validar stock de la variante (si aplica)
  if (variant_id) {
    const [v] = await pool.query('SELECT stock FROM product_variants WHERE id = ? AND product_id = ?', [variant_id, product_id]);
    if (!v.length) throw new ApiError(404, 'Variante no encontrada');
    if (v[0].stock < qty) throw new ApiError(400, `Stock insuficiente (disponible: ${v[0].stock})`);
  }

  const cartId = await getOrCreateCart(req.user.id);
  const precio = await productPrice(product_id);

  // ¿Ya existe ese item (mismo producto + variante)?
  const [existing] = await pool.query(
    'SELECT id, cantidad FROM cart_items WHERE cart_id = ? AND product_id = ? AND variant_id <=> ?',
    [cartId, product_id, variant_id || null]
  );
  if (existing.length) {
    const nuevaCantidad = existing[0].cantidad + qty;
    await pool.query('UPDATE cart_items SET cantidad = ?, precio_unitario = ? WHERE id = ?',
      [nuevaCantidad, precio, existing[0].id]);
  } else {
    await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, variant_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?, ?)',
      [cartId, product_id, variant_id || null, qty, precio]
    );
  }
  res.status(201).json(await buildCart(cartId));
});

// PUT /api/cart/items/:id   { cantidad }
export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const qty = Math.max(1, Number(req.body.cantidad) || 1);
  const cartId = await getOrCreateCart(req.user.id);

  const [item] = await pool.query('SELECT variant_id FROM cart_items WHERE id = ? AND cart_id = ?', [id, cartId]);
  if (!item.length) throw new ApiError(404, 'Item no encontrado');

  if (item[0].variant_id) {
    const [v] = await pool.query('SELECT stock FROM product_variants WHERE id = ?', [item[0].variant_id]);
    if (v.length && v[0].stock < qty) throw new ApiError(400, `Stock insuficiente (disponible: ${v[0].stock})`);
  }
  await pool.query('UPDATE cart_items SET cantidad = ? WHERE id = ?', [qty, id]);
  res.json(await buildCart(cartId));
});

// DELETE /api/cart/items/:id
export const removeItem = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  await pool.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [req.params.id, cartId]);
  res.json(await buildCart(cartId));
});

// DELETE /api/cart/clear
export const clearCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  res.json(await buildCart(cartId));
});
