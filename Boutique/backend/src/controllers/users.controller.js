import { pool } from '../config/db.js';
import { hashPassword } from '../utils/bcrypt.js';
import { asyncHandler, ApiError, getPagination } from '../utils/helpers.js';

const ROLE_ID = { ADMIN: 1, EMPLOYEE: 2, CUSTOMER: 3 };

// ---------- CLIENTES ----------

// GET /api/admin/users   (lista de clientes; ?rol= para filtrar)
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { search, rol, estado } = req.query;
  const where = ['u.deleted_at IS NULL'], params = [];
  // por defecto solo clientes
  where.push('r.nombre = ?'); params.push(rol || 'CUSTOMER');
  if (search) { where.push('(u.nombre LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (estado !== undefined && estado !== '') { where.push('u.estado = ?'); params.push(Number(estado)); }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM users u JOIN roles r ON r.id = u.rol_id ${whereSql}`, params);
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.estado, u.fecha_creacion, r.nombre AS rol,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS total_pedidos
     FROM users u JOIN roles r ON r.id = u.rol_id ${whereSql}
     ORDER BY u.fecha_creacion DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  res.json({
    data: rows,
    pagination: { page, limit, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limit) },
  });
});

// GET /api/admin/users/:id  (detalle + historial de compras)
export const getUser = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.estado, u.fecha_creacion, r.nombre AS rol
     FROM users u JOIN roles r ON r.id = u.rol_id WHERE u.id = ? AND u.deleted_at IS NULL`,
    [req.params.id]
  );
  if (!rows.length) throw new ApiError(404, 'Usuario no encontrado');
  const [orders] = await pool.query(
    'SELECT id, numero, total, estado, estado_pago, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.params.id]
  );
  res.json({ user: rows[0], orders });
});

// PUT /api/admin/users/:id  (activar/desactivar, editar datos básicos)
export const updateUser = asyncHandler(async (req, res) => {
  const { nombre, apellido, telefono, estado } = req.body;
  const fields = [], values = [];
  if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
  if (apellido !== undefined) { fields.push('apellido = ?'); values.push(apellido); }
  if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }
  if (estado !== undefined) { fields.push('estado = ?'); values.push(estado ? 1 : 0); }
  if (!fields.length) throw new ApiError(400, 'Nada para actualizar');
  values.push(req.params.id);
  const [r] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  if (!r.affectedRows) throw new ApiError(404, 'Usuario no encontrado');
  res.json({ message: 'Usuario actualizado' });
});

// DELETE /api/admin/users/:id  (soft delete)
export const deleteUser = asyncHandler(async (req, res) => {
  const [r] = await pool.query('UPDATE users SET deleted_at = NOW(), estado = 0 WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw new ApiError(404, 'Usuario no encontrado');
  res.json({ message: 'Usuario eliminado' });
});

// ---------- EMPLEADOS ----------

// GET /api/admin/employees
export const listEmployees = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.estado, u.fecha_creacion, r.nombre AS rol
     FROM users u JOIN roles r ON r.id = u.rol_id
     WHERE r.nombre = 'EMPLOYEE' AND u.deleted_at IS NULL ORDER BY u.fecha_creacion DESC`
  );
  res.json(rows);
});

// POST /api/admin/employees  (solo ADMIN crea empleados; nunca con rol ADMIN)
export const createEmployee = asyncHandler(async (req, res) => {
  const { nombre, apellido, email, password, telefono } = req.body;
  if (!nombre || !email || !password) throw new ApiError(422, 'Nombre, email y contraseña son obligatorios');

  const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (exists.length) throw new ApiError(409, 'El email ya está registrado');

  const hash = await hashPassword(password);
  const [r] = await pool.query(
    'INSERT INTO users (nombre, apellido, email, password, telefono, rol_id, estado) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [nombre, apellido || null, email, hash, telefono || null, ROLE_ID.EMPLOYEE]
  );
  res.status(201).json({ message: 'Empleado creado', id: r.insertId });
});

// PUT /api/admin/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  const { nombre, apellido, telefono, estado, password } = req.body;
  // verifica que sea empleado
  const [emp] = await pool.query(
    "SELECT u.id FROM users u JOIN roles r ON r.id = u.rol_id WHERE u.id = ? AND r.nombre = 'EMPLOYEE'",
    [req.params.id]
  );
  if (!emp.length) throw new ApiError(404, 'Empleado no encontrado');

  const fields = [], values = [];
  if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
  if (apellido !== undefined) { fields.push('apellido = ?'); values.push(apellido); }
  if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }
  if (estado !== undefined) { fields.push('estado = ?'); values.push(estado ? 1 : 0); }
  if (password) { fields.push('password = ?'); values.push(await hashPassword(password)); }
  if (!fields.length) throw new ApiError(400, 'Nada para actualizar');
  values.push(req.params.id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  res.json({ message: 'Empleado actualizado' });
});

// DELETE /api/admin/employees/:id  (soft delete)
export const deleteEmployee = asyncHandler(async (req, res) => {
  const [r] = await pool.query(
    `UPDATE users u JOIN roles r ON r.id = u.rol_id
     SET u.deleted_at = NOW(), u.estado = 0
     WHERE u.id = ? AND r.nombre = 'EMPLOYEE'`,
    [req.params.id]
  );
  if (!r.affectedRows) throw new ApiError(404, 'Empleado no encontrado');
  res.json({ message: 'Empleado eliminado' });
});
