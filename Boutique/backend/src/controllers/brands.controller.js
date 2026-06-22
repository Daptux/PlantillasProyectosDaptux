import { pool } from '../config/db.js';
import { asyncHandler, ApiError, slugify } from '../utils/helpers.js';

// GET /api/brands
export const listBrands = asyncHandler(async (req, res) => {
  const all = req.query.all === '1';
  const [rows] = await pool.query(
    `SELECT * FROM brands WHERE deleted_at IS NULL ${all ? '' : 'AND estado = 1'} ORDER BY nombre`
  );
  res.json(rows);
});

// POST /api/brands  (admin)
export const createBrand = asyncHandler(async (req, res) => {
  const { nombre, logo, estado } = req.body;
  if (!nombre) throw new ApiError(422, 'El nombre es obligatorio');
  const [r] = await pool.query(
    'INSERT INTO brands (nombre, slug, logo, estado) VALUES (?, ?, ?, ?)',
    [nombre, slugify(nombre), logo || null, estado === undefined ? 1 : (estado ? 1 : 0)]
  );
  const [rows] = await pool.query('SELECT * FROM brands WHERE id = ?', [r.insertId]);
  res.status(201).json(rows[0]);
});

// PUT /api/brands/:id  (admin)
export const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, logo, estado } = req.body;
  const fields = [], values = [];
  if (nombre !== undefined) { fields.push('nombre = ?', 'slug = ?'); values.push(nombre, slugify(nombre)); }
  if (logo !== undefined) { fields.push('logo = ?'); values.push(logo); }
  if (estado !== undefined) { fields.push('estado = ?'); values.push(estado ? 1 : 0); }
  if (!fields.length) throw new ApiError(400, 'Nada para actualizar');
  values.push(id);
  await pool.query(`UPDATE brands SET ${fields.join(', ')} WHERE id = ?`, values);
  const [rows] = await pool.query('SELECT * FROM brands WHERE id = ?', [id]);
  if (!rows.length) throw new ApiError(404, 'Marca no encontrada');
  res.json(rows[0]);
});

// DELETE /api/brands/:id  (admin)
export const deleteBrand = asyncHandler(async (req, res) => {
  const [r] = await pool.query('UPDATE brands SET deleted_at = NOW(), estado = 0 WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw new ApiError(404, 'Marca no encontrada');
  res.json({ message: 'Marca eliminada' });
});
