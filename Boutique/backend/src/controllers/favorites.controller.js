import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/helpers.js';

// GET /api/favorites
export const listFavorites = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT f.id AS favorite_id, p.*,
            c.nombre AS categoria,
            (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.es_principal DESC LIMIT 1) AS imagen
     FROM favorites f
     JOIN products p ON p.id = f.product_id
     LEFT JOIN categories c ON c.id = p.categoria_id
     WHERE f.user_id = ? AND p.deleted_at IS NULL
     ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json(rows.map(p => ({
    ...p,
    precio: Number(p.precio),
    precio_final: p.en_oferta && p.precio_descuento ? Number(p.precio_descuento) : Number(p.precio),
    tiene_descuento: !!p.en_oferta && p.precio_descuento != null,
  })));
});

// POST /api/favorites/:productId  (toggle)
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const [existing] = await pool.query(
    'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
  if (existing.length) {
    await pool.query('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
    return res.json({ favorito: false });
  }
  await pool.query('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [req.user.id, productId]);
  res.status(201).json({ favorito: true });
});

// GET /api/favorites/ids  -> lista de product_id favoritos (para marcar el corazón en el frontend)
export const favoriteIds = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT product_id FROM favorites WHERE user_id = ?', [req.user.id]);
  res.json(rows.map(r => r.product_id));
});
