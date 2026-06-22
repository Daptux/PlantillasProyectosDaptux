import { pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/helpers.js';

// GET /api/admin/coupons
export const listCoupons = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json(rows);
});

// POST /api/admin/coupons
export const createCoupon = asyncHandler(async (req, res) => {
  const { codigo, descripcion, tipo, valor, monto_minimo, usos_maximos, fecha_inicio, fecha_fin, estado } = req.body;
  if (!codigo || valor === undefined) throw new ApiError(422, 'Código y valor son obligatorios');
  if (tipo && !['PORCENTAJE', 'FIJO'].includes(tipo)) throw new ApiError(422, 'Tipo inválido');
  const [r] = await pool.query(
    `INSERT INTO coupons (codigo, descripcion, tipo, valor, monto_minimo, usos_maximos, fecha_inicio, fecha_fin, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [codigo.toUpperCase().trim(), descripcion || null, tipo || 'PORCENTAJE', Number(valor),
     Number(monto_minimo) || 0, usos_maximos ? Number(usos_maximos) : null,
     fecha_inicio || null, fecha_fin || null, estado === undefined ? 1 : (estado ? 1 : 0)]
  );
  const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [r.insertId]);
  res.status(201).json(rows[0]);
});

// PUT /api/admin/coupons/:id
export const updateCoupon = asyncHandler(async (req, res) => {
  const allowed = ['codigo', 'descripcion', 'tipo', 'valor', 'monto_minimo', 'usos_maximos', 'fecha_inicio', 'fecha_fin', 'estado'];
  const fields = [], values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      let val = req.body[key];
      if (key === 'estado') val = val ? 1 : 0;
      if (key === 'codigo') val = String(val).toUpperCase().trim();
      values.push(val === '' ? null : val);
    }
  }
  if (!fields.length) throw new ApiError(400, 'Nada para actualizar');
  values.push(req.params.id);
  const [r] = await pool.query(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`, values);
  if (!r.affectedRows) throw new ApiError(404, 'Cupón no encontrado');
  const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

// DELETE /api/admin/coupons/:id
export const deleteCoupon = asyncHandler(async (req, res) => {
  const [r] = await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw new ApiError(404, 'Cupón no encontrado');
  res.json({ message: 'Cupón eliminado' });
});

// POST /api/coupons/validate   { codigo, subtotal }  (cliente)
export const validateCoupon = asyncHandler(async (req, res) => {
  const { codigo, subtotal } = req.body;
  if (!codigo) throw new ApiError(422, 'Código requerido');
  const sub = Number(subtotal) || 0;

  const [rows] = await pool.query(
    `SELECT * FROM coupons WHERE codigo = ? AND estado = 1
     AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
     AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())`,
    [codigo.toUpperCase().trim()]
  );
  if (!rows.length) throw new ApiError(404, 'Cupón inválido o expirado');
  const cup = rows[0];

  if (cup.usos_maximos != null && cup.usos_actuales >= cup.usos_maximos)
    throw new ApiError(400, 'El cupón alcanzó su límite de usos');
  if (sub < Number(cup.monto_minimo))
    throw new ApiError(400, `Compra mínima de $${Number(cup.monto_minimo).toLocaleString()} para usar este cupón`);

  const descuento = cup.tipo === 'PORCENTAJE'
    ? Math.round(sub * (Number(cup.valor) / 100))
    : Math.min(Number(cup.valor), sub);

  res.json({
    valido: true,
    codigo: cup.codigo,
    tipo: cup.tipo,
    valor: Number(cup.valor),
    descuento,
    descripcion: cup.descripcion,
  });
});
