import { pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/helpers.js';

// GET /api/banners  (público: solo activos)
export const listActiveBanners = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM banners WHERE estado = 1 ORDER BY orden ASC, id ASC');
  res.json(rows);
});

// GET /api/admin/banners
export const listBanners = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM banners ORDER BY orden ASC, id ASC');
  res.json(rows);
});

// POST /api/admin/banners
export const createBanner = asyncHandler(async (req, res) => {
  const { titulo, subtitulo, imagen, texto_boton, enlace, orden, estado } = req.body;
  if (!imagen) throw new ApiError(422, 'La imagen es obligatoria');
  const [r] = await pool.query(
    `INSERT INTO banners (titulo, subtitulo, imagen, texto_boton, enlace, orden, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [titulo || null, subtitulo || null, imagen, texto_boton || null, enlace || null,
     Number(orden) || 0, estado === undefined ? 1 : (estado ? 1 : 0)]
  );
  const [rows] = await pool.query('SELECT * FROM banners WHERE id = ?', [r.insertId]);
  res.status(201).json(rows[0]);
});

// PUT /api/admin/banners/:id
export const updateBanner = asyncHandler(async (req, res) => {
  const allowed = ['titulo', 'subtitulo', 'imagen', 'texto_boton', 'enlace', 'orden', 'estado'];
  const fields = [], values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      let val = req.body[key];
      if (key === 'estado') val = val ? 1 : 0;
      if (key === 'orden') val = Number(val) || 0;
      values.push(val);
    }
  }
  if (!fields.length) throw new ApiError(400, 'Nada para actualizar');
  values.push(req.params.id);
  const [r] = await pool.query(`UPDATE banners SET ${fields.join(', ')} WHERE id = ?`, values);
  if (!r.affectedRows) throw new ApiError(404, 'Banner no encontrado');
  const [rows] = await pool.query('SELECT * FROM banners WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

// DELETE /api/admin/banners/:id
export const deleteBanner = asyncHandler(async (req, res) => {
  const [r] = await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw new ApiError(404, 'Banner no encontrado');
  res.json({ message: 'Banner eliminado' });
});
