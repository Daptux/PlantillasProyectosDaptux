import { pool } from '../config/db.js';
import { asyncHandler, ApiError, slugify } from '../utils/helpers.js';

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  const all = req.query.all === '1';
  const [rows] = await pool.query(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.categoria_id = c.id AND p.deleted_at IS NULL) AS total_productos
     FROM categories c WHERE c.deleted_at IS NULL ${all ? '' : 'AND c.estado = 1'} ORDER BY c.nombre`
  );
  res.json(rows);
});

// POST /api/categories  (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { nombre, descripcion, imagen, estado } = req.body;
  if (!nombre) throw new ApiError(422, 'El nombre es obligatorio');
  const slug = slugify(nombre);
  const [r] = await pool.query(
    'INSERT INTO categories (nombre, slug, descripcion, imagen, estado) VALUES (?, ?, ?, ?, ?)',
    [nombre, slug, descripcion || null, imagen || null, estado === undefined ? 1 : (estado ? 1 : 0)]
  );
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [r.insertId]);
  res.status(201).json(rows[0]);
});

// PUT /api/categories/:id  (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, imagen, estado } = req.body;
  const fields = [], values = [];
  if (nombre !== undefined) { fields.push('nombre = ?', 'slug = ?'); values.push(nombre, slugify(nombre)); }
  if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion); }
  if (imagen !== undefined) { fields.push('imagen = ?'); values.push(imagen); }
  if (estado !== undefined) { fields.push('estado = ?'); values.push(estado ? 1 : 0); }
  if (!fields.length) throw new ApiError(400, 'Nada para actualizar');
  values.push(id);
  await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  if (!rows.length) throw new ApiError(404, 'Categoría no encontrada');
  res.json(rows[0]);
});

// DELETE /api/categories/:id  (admin, soft delete)
export const deleteCategory = asyncHandler(async (req, res) => {
  const [r] = await pool.query('UPDATE categories SET deleted_at = NOW(), estado = 0 WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw new ApiError(404, 'Categoría no encontrada');
  res.json({ message: 'Categoría eliminada' });
});
