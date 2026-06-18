import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { ROLES } from "../middlewares/role.middleware";
import { hashPassword } from "../utils/password";
import { CreateUserInput, UpdateUserInput, ListUsersQuery } from "../validations/user.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

const esSuper = (user: AuthUser) => user.rol === ROLES.SUPER_ADMIN;

interface UsuarioRow extends RowDataPacket {
  id: number;
  clinica_id: number | null;
  rol_codigo: string;
}

const SELECT_USER = `
  SELECT u.id, u.clinica_id, u.rol_id, u.nombres, u.apellidos, u.email, u.telefono,
         u.activo, u.ultimo_login, u.created_at,
         r.codigo AS rol_codigo, r.nombre AS rol_nombre
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id`;

/** Lista los roles disponibles (para los formularios). */
export async function listRoles() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, codigo, nombre, descripcion FROM roles ORDER BY id"
  );
  return rows;
}

/** Verifica que un rol exista y devuelve su codigo. */
async function getRolCodigo(rolId: number): Promise<string> {
  const [rows] = await pool.execute<RowDataPacket[]>("SELECT codigo FROM roles WHERE id = ? LIMIT 1", [rolId]);
  if (!rows[0]) throw new AppError("Rol no encontrado", 422);
  return (rows[0] as { codigo: string }).codigo;
}

/** Solo SUPER_ADMIN puede crear/asignar el rol SUPER_ADMIN. */
function assertPuedeAsignarRol(actor: AuthUser, rolCodigo: string) {
  if (rolCodigo === ROLES.SUPER_ADMIN && !esSuper(actor)) {
    throw new AppError("Solo un super administrador puede asignar ese rol", 403);
  }
}

/** Lista usuarios visibles para el actor (SUPER_ADMIN todos; ADMIN_CLINICA su clinica). */
export async function listUsers(query: ListUsersQuery, actor: AuthUser) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];
  const where: string[] = [];

  if (!esSuper(actor)) {
    where.push("u.clinica_id = ?");
    params.push(actor.clinicaId);
  }
  if (query.rol_id) {
    where.push("u.rol_id = ?");
    params.push(query.rol_id);
  }
  if (query.search) {
    where.push("(u.nombres LIKE ? OR u.apellidos LIKE ? OR u.email LIKE ?)");
    const like = `%${query.search}%`;
    params.push(like, like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await pool.execute<UsuarioRow[]>(
    `${SELECT_USER} ${whereSql} ORDER BY u.apellidos, u.nombres`,
    params
  );
  return rows;
}

/** Devuelve un usuario por id, controlando el acceso por clinica. */
export async function getUser(id: number, actor: AuthUser): Promise<UsuarioRow> {
  const [rows] = await pool.execute<UsuarioRow[]>(`${SELECT_USER} WHERE u.id = ? LIMIT 1`, [id]);
  const user = rows[0];
  if (!user) throw new AppError("Usuario no encontrado", 404);
  if (!esSuper(actor) && user.clinica_id !== actor.clinicaId) {
    throw new AppError("No tienes acceso a este usuario", 403);
  }
  return user;
}

/** Crea un usuario (cuenta de acceso). */
export async function createUser(input: CreateUserInput, actor: AuthUser) {
  const rolCodigo = await getRolCodigo(input.rol_id);
  assertPuedeAsignarRol(actor, rolCodigo);

  // ADMIN_CLINICA solo crea en su clinica; SUPER_ADMIN puede indicar otra.
  const clinicaId = esSuper(actor) ? (input.clinica_id ?? actor.clinicaId) : actor.clinicaId;

  const hash = await hashPassword(input.password);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuarios (clinica_id, rol_id, nombres, apellidos, email, password_hash, telefono, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId ?? null,
      input.rol_id,
      input.nombres,
      input.apellidos,
      input.email,
      hash,
      input.telefono ?? null,
      input.activo ?? true,
    ]
  );
  return getUser(result.insertId, actor);
}

/** Actualiza un usuario (la contrasena solo si se envia). */
export async function updateUser(id: number, input: UpdateUserInput, actor: AuthUser) {
  await getUser(id, actor); // valida existencia + acceso

  if (input.rol_id !== undefined) {
    const rolCodigo = await getRolCodigo(input.rol_id);
    assertPuedeAsignarRol(actor, rolCodigo);
  }

  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];
  const set = (col: string, val: unknown) => { fields.push(`${col} = ?`); params.push(val); };

  if (input.nombres !== undefined) set("nombres", input.nombres);
  if (input.apellidos !== undefined) set("apellidos", input.apellidos);
  if (input.email !== undefined) set("email", input.email);
  if (input.telefono !== undefined) set("telefono", input.telefono);
  if (input.rol_id !== undefined) set("rol_id", input.rol_id);
  if (input.activo !== undefined) set("activo", input.activo);
  if (input.password) set("password_hash", await hashPassword(input.password));

  if (fields.length > 0) {
    params.push(id);
    await pool.execute(`UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`, params);
  }
  return getUser(id, actor);
}

/** Desactiva (soft-delete) un usuario. No permite auto-eliminarse. */
export async function deleteUser(id: number, actor: AuthUser) {
  if (id === actor.id) throw new AppError("No puedes desactivar tu propia cuenta", 409);
  await getUser(id, actor);
  await pool.execute("UPDATE usuarios SET activo = 0 WHERE id = ?", [id]);
}
