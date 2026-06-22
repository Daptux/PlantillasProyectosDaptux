import { pool } from '../config/db.js';
import { asyncHandler, ApiError, slugify, getPagination } from '../utils/helpers.js';
import { publicUrl } from '../middlewares/upload.middleware.js';

// Calcula el precio efectivo (con descuento si aplica)
function withComputed(p) {
  const precio = Number(p.precio);
  const precioDescuento = p.precio_descuento != null ? Number(p.precio_descuento) : null;
  const enOferta = !!p.en_oferta && precioDescuento != null && precioDescuento < precio;
  return {
    ...p,
    precio,
    precio_descuento: precioDescuento,
    precio_final: enOferta ? precioDescuento : precio,
    tiene_descuento: enOferta,
    porcentaje_descuento: enOferta ? Math.round((1 - precioDescuento / precio) * 100) : 0,
  };
}

// GET /api/products  (catálogo público con filtros)
export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const {
    search, categoria, marca, genero, talla, color,
    precio_min, precio_max, oferta, destacado, nuevo, coleccion, sort,
    incluir_inactivos,
  } = req.query;

  const where = [];
  const params = [];

  // Por defecto solo productos activos (el admin puede pedir inactivos)
  if (incluir_inactivos !== '1') where.push('p.estado = 1');
  where.push('p.deleted_at IS NULL');

  if (search) { where.push('p.nombre LIKE ?'); params.push(`%${search}%`); }
  if (categoria) { where.push('(c.slug = ? OR p.categoria_id = ?)'); params.push(categoria, categoria); }
  if (marca) { where.push('(b.slug = ? OR p.marca_id = ?)'); params.push(marca, marca); }
  if (genero) { where.push('p.genero = ?'); params.push(genero); }
  if (coleccion) { where.push('p.coleccion = ?'); params.push(coleccion); }
  if (oferta === '1') where.push('p.en_oferta = 1');
  if (destacado === '1') where.push('p.destacado = 1');
  if (nuevo === '1') where.push('p.es_nuevo = 1');
  if (precio_min) { where.push('COALESCE(NULLIF(p.precio_descuento,0), p.precio) >= ?'); params.push(Number(precio_min)); }
  if (precio_max) { where.push('COALESCE(NULLIF(p.precio_descuento,0), p.precio) <= ?'); params.push(Number(precio_max)); }
  if (talla) { where.push('EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.talla = ?)'); params.push(talla); }
  if (color) { where.push('EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color = ?)'); params.push(color); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Orden
  let orderSql = 'ORDER BY p.created_at DESC';
  switch (sort) {
    case 'precio_asc': orderSql = 'ORDER BY COALESCE(NULLIF(p.precio_descuento,0), p.precio) ASC'; break;
    case 'precio_desc': orderSql = 'ORDER BY COALESCE(NULLIF(p.precio_descuento,0), p.precio) DESC'; break;
    case 'vendidos': orderSql = 'ORDER BY p.ventas DESC'; break;
    case 'destacados': orderSql = 'ORDER BY p.destacado DESC, p.ventas DESC'; break;
    case 'recientes':
    default: orderSql = 'ORDER BY p.created_at DESC';
  }

  const baseFrom = `
    FROM products p
    LEFT JOIN categories c ON c.id = p.categoria_id
    LEFT JOIN brands b ON b.id = p.marca_id
    ${whereSql}`;

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT p.*, c.nombre AS categoria, c.slug AS categoria_slug, b.nombre AS marca,
            (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.es_principal DESC, pi.orden ASC LIMIT 1) AS imagen,
            (SELECT COALESCE(SUM(stock),0) FROM product_variants v WHERE v.product_id = p.id) AS stock_total
     ${baseFrom} ${orderSql} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    data: rows.map(withComputed),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/products/:id  (acepta id numérico o slug)
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const byId = /^\d+$/.test(id);
  const [rows] = await pool.query(
    `SELECT p.*, c.nombre AS categoria, c.slug AS categoria_slug, b.nombre AS marca
     FROM products p
     LEFT JOIN categories c ON c.id = p.categoria_id
     LEFT JOIN brands b ON b.id = p.marca_id
     WHERE ${byId ? 'p.id = ?' : 'p.slug = ?'} AND p.deleted_at IS NULL`,
    [id]
  );
  if (!rows.length) throw new ApiError(404, 'Producto no encontrado');
  const product = withComputed(rows[0]);

  const [images] = await pool.query(
    'SELECT id, url, es_principal, orden FROM product_images WHERE product_id = ? ORDER BY es_principal DESC, orden ASC',
    [product.id]
  );
  const [variants] = await pool.query(
    'SELECT id, talla, color, color_hex, sku, stock, stock_minimo, estado FROM product_variants WHERE product_id = ? ORDER BY id ASC',
    [product.id]
  );
  // Productos relacionados (misma categoría)
  const [related] = await pool.query(
    `SELECT p.*,
            (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.es_principal DESC LIMIT 1) AS imagen
     FROM products p
     WHERE p.categoria_id = ? AND p.id <> ? AND p.estado = 1 AND p.deleted_at IS NULL
     ORDER BY p.ventas DESC LIMIT 4`,
    [product.categoria_id, product.id]
  );

  res.json({ ...product, images, variants, related: related.map(withComputed) });
});

// POST /api/products  (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    nombre, descripcion, categoria_id, marca_id, genero, precio,
    precio_descuento, coleccion, destacado, es_nuevo, en_oferta, estado,
  } = req.body;

  let slug = slugify(nombre);
  // garantiza slug único
  const [dup] = await pool.query('SELECT id FROM products WHERE slug = ?', [slug]);
  if (dup.length) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const [result] = await pool.query(
    `INSERT INTO products
      (nombre, slug, descripcion, categoria_id, marca_id, genero, precio, precio_descuento,
       coleccion, destacado, es_nuevo, en_oferta, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre, slug, descripcion || null, categoria_id || null, marca_id || null,
      genero || 'UNISEX', Number(precio) || 0,
      precio_descuento ? Number(precio_descuento) : null,
      coleccion || null, destacado ? 1 : 0, es_nuevo ? 1 : 0, en_oferta ? 1 : 0,
      estado === undefined ? 1 : (estado ? 1 : 0),
    ]
  );
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
  res.status(201).json(withComputed(rows[0]));
});

// PUT /api/products/:id  (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = ['nombre', 'descripcion', 'categoria_id', 'marca_id', 'genero', 'precio',
    'precio_descuento', 'coleccion', 'destacado', 'es_nuevo', 'en_oferta', 'estado'];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      let val = req.body[key];
      if (['destacado', 'es_nuevo', 'en_oferta', 'estado'].includes(key)) val = val ? 1 : 0;
      if (['precio', 'precio_descuento', 'categoria_id', 'marca_id'].includes(key)) val = val === '' || val === null ? null : Number(val);
      values.push(val);
    }
  }
  if (req.body.nombre) { fields.push('slug = ?'); values.push(slugify(req.body.nombre)); }
  if (!fields.length) throw new ApiError(400, 'Nada para actualizar');

  values.push(id);
  await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  if (!rows.length) throw new ApiError(404, 'Producto no encontrado');
  res.json(withComputed(rows[0]));
});

// DELETE /api/products/:id  (soft delete -> admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const [r] = await pool.query(
    'UPDATE products SET deleted_at = NOW(), estado = 0 WHERE id = ?',
    [req.params.id]
  );
  if (!r.affectedRows) throw new ApiError(404, 'Producto no encontrado');
  res.json({ message: 'Producto eliminado' });
});

// POST /api/products/:id/images  (admin) - multipart o body con url
export const addImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const files = req.files || [];
  const inserted = [];

  for (const file of files) {
    const url = publicUrl('products', file.filename);
    const [r] = await pool.query(
      'INSERT INTO product_images (product_id, url, es_principal, orden) VALUES (?, ?, 0, 0)',
      [id, url]
    );
    inserted.push({ id: r.insertId, url });
  }
  // También permite pasar URLs externas en body.urls
  if (Array.isArray(req.body.urls)) {
    for (const url of req.body.urls) {
      const [r] = await pool.query(
        'INSERT INTO product_images (product_id, url, es_principal, orden) VALUES (?, ?, 0, 0)', [id, url]);
      inserted.push({ id: r.insertId, url });
    }
  }
  // Si el producto no tiene imagen principal, marca la de menor id
  const [hasPrincipal] = await pool.query(
    'SELECT id FROM product_images WHERE product_id = ? AND es_principal = 1 LIMIT 1', [id]);
  if (!hasPrincipal.length) {
    await pool.query(
      'UPDATE product_images SET es_principal = 1 WHERE product_id = ? ORDER BY id ASC LIMIT 1', [id]);
  }
  res.status(201).json({ images: inserted });
});

// DELETE /api/products/images/:imageId (admin)
export const deleteImage = asyncHandler(async (req, res) => {
  const [r] = await pool.query('DELETE FROM product_images WHERE id = ?', [req.params.imageId]);
  if (!r.affectedRows) throw new ApiError(404, 'Imagen no encontrada');
  res.json({ message: 'Imagen eliminada' });
});

// POST /api/products/:id/variants  (admin)
export const addVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { talla, color, color_hex, sku, stock, stock_minimo } = req.body;
  const [r] = await pool.query(
    `INSERT INTO product_variants (product_id, talla, color, color_hex, sku, stock, stock_minimo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, talla || null, color || null, color_hex || null, sku || null, Number(stock) || 0, Number(stock_minimo) || 3]
  );
  const [rows] = await pool.query('SELECT * FROM product_variants WHERE id = ?', [r.insertId]);
  res.status(201).json(rows[0]);
});

// PUT /api/products/variants/:variantId  (admin)
export const updateVariant = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const allowed = ['talla', 'color', 'color_hex', 'sku', 'stock', 'stock_minimo', 'estado'];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      let val = req.body[key];
      if (['stock', 'stock_minimo', 'estado'].includes(key)) val = Number(val) || 0;
      values.push(val);
    }
  }
  if (!fields.length) throw new ApiError(400, 'Nada para actualizar');
  values.push(variantId);
  await pool.query(`UPDATE product_variants SET ${fields.join(', ')} WHERE id = ?`, values);
  const [rows] = await pool.query('SELECT * FROM product_variants WHERE id = ?', [variantId]);
  if (!rows.length) throw new ApiError(404, 'Variante no encontrada');
  res.json(rows[0]);
});

// DELETE /api/products/variants/:variantId  (admin)
export const deleteVariant = asyncHandler(async (req, res) => {
  const [r] = await pool.query('DELETE FROM product_variants WHERE id = ?', [req.params.variantId]);
  if (!r.affectedRows) throw new ApiError(404, 'Variante no encontrada');
  res.json({ message: 'Variante eliminada' });
});

// GET /api/products/meta/filters  -> opciones para filtros (tallas, colores, rango precios)
export const filterOptions = asyncHandler(async (req, res) => {
  const [tallas] = await pool.query('SELECT DISTINCT talla FROM product_variants WHERE talla IS NOT NULL ORDER BY talla');
  const [colores] = await pool.query('SELECT DISTINCT color, color_hex FROM product_variants WHERE color IS NOT NULL ORDER BY color');
  const [precios] = await pool.query('SELECT MIN(precio) AS min, MAX(precio) AS max FROM products WHERE estado = 1');
  res.json({
    tallas: tallas.map(t => t.talla),
    colores,
    precio: precios[0],
    generos: ['HOMBRE', 'MUJER', 'UNISEX', 'NINO'],
  });
});
