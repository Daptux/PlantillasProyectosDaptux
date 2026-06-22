import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/helpers.js';

// GET /api/settings  (público: datos de la tienda)
export const getSettings = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM store_settings LIMIT 1');
  if (!rows.length) {
    const [r] = await pool.query('INSERT INTO store_settings (nombre_tienda) VALUES (?)', ['Boutique']);
    const [created] = await pool.query('SELECT * FROM store_settings WHERE id = ?', [r.insertId]);
    return res.json(created[0]);
  }
  res.json(rows[0]);
});

// PUT /api/admin/settings  (admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const allowed = ['nombre_tienda', 'logo', 'telefono', 'whatsapp', 'email', 'direccion',
    'ciudad', 'instagram', 'facebook', 'tiktok', 'costo_envio', 'moneda'];
  const fields = [], values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(key === 'costo_envio' ? Number(req.body[key]) || 0 : req.body[key]);
    }
  }
  // asegura que exista la fila 1
  const [exists] = await pool.query('SELECT id FROM store_settings LIMIT 1');
  if (!exists.length) await pool.query('INSERT INTO store_settings (nombre_tienda) VALUES (?)', ['Boutique']);

  if (fields.length) {
    const [row] = await pool.query('SELECT id FROM store_settings LIMIT 1');
    values.push(row[0].id);
    await pool.query(`UPDATE store_settings SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  const [rows] = await pool.query('SELECT * FROM store_settings LIMIT 1');
  res.json(rows[0]);
});
