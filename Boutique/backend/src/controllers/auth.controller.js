import { pool } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { signToken } from '../utils/jwt.js';
import { asyncHandler, sanitizeUser, ApiError } from '../utils/helpers.js';

const CUSTOMER_ROLE_ID = 3;

// POST /api/auth/register  (registro de cliente)
export const register = asyncHandler(async (req, res) => {
  const { nombre, apellido, email, password, telefono } = req.body;

  const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (exists.length) throw new ApiError(409, 'El email ya está registrado');

  const hash = await hashPassword(password);
  const [result] = await pool.query(
    `INSERT INTO users (nombre, apellido, email, password, telefono, rol_id, estado)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [nombre, apellido || null, email, hash, telefono || null, CUSTOMER_ROLE_ID]
  );

  const [rows] = await pool.query(
    `SELECT u.*, r.nombre AS rol FROM users u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
    [result.insertId]
  );
  const user = sanitizeUser(rows[0]);
  const token = signToken({ id: user.id, rol: user.rol });

  res.status(201).json({ user, token });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query(
    `SELECT u.*, r.nombre AS rol FROM users u JOIN roles r ON r.id = u.rol_id
     WHERE u.email = ? AND u.deleted_at IS NULL`,
    [email]
  );
  if (!rows.length) throw new ApiError(401, 'Credenciales inválidas');

  const user = rows[0];
  if (!user.estado) throw new ApiError(403, 'Tu cuenta está inactiva. Contacta al administrador.');

  const ok = await comparePassword(password, user.password);
  if (!ok) throw new ApiError(401, 'Credenciales inválidas');

  const token = signToken({ id: user.id, rol: user.rol });
  res.json({ user: sanitizeUser(user), token });
});

// GET /api/auth/profile
export const profile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.avatar, u.estado,
            u.fecha_creacion, r.nombre AS rol
     FROM users u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
    [req.user.id]
  );
  const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY es_principal DESC', [req.user.id]);
  res.json({ user: rows[0], addresses });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { nombre, apellido, telefono, password } = req.body;
  const fields = [];
  const values = [];

  if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
  if (apellido !== undefined) { fields.push('apellido = ?'); values.push(apellido); }
  if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }
  if (password) { fields.push('password = ?'); values.push(await hashPassword(password)); }

  if (fields.length) {
    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.avatar, r.nombre AS rol
     FROM users u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
    [req.user.id]
  );
  res.json({ user: rows[0] });
});
