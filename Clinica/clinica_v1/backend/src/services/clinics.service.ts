import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { ROLES } from "../middlewares/role.middleware";
import { CreateClinicInput, UpdateClinicInput } from "../validations/clinic.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

interface ClinicaRow extends RowDataPacket {
  id: number;
}

const esSuper = (user: AuthUser) => user.rol === ROLES.SUPER_ADMIN;

/** Verifica que el usuario pueda operar sobre la clinica indicada. */
function assertAcceso(user: AuthUser, clinicaId: number) {
  if (!esSuper(user) && user.clinicaId !== clinicaId) {
    throw new AppError("No tienes acceso a esta clinica", 403);
  }
}

/** Lista clinicas: SUPER_ADMIN todas; ADMIN_CLINICA solo la suya. */
export async function listClinics(user: AuthUser) {
  if (esSuper(user)) {
    const [rows] = await pool.execute<ClinicaRow[]>("SELECT * FROM clinicas ORDER BY nombre");
    return rows;
  }
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  const [rows] = await pool.execute<ClinicaRow[]>(
    "SELECT * FROM clinicas WHERE id = ? ORDER BY nombre",
    [user.clinicaId]
  );
  return rows;
}

/** Devuelve una clinica por id (con control de acceso). */
export async function getClinic(id: number, user: AuthUser) {
  assertAcceso(user, id);
  const [rows] = await pool.execute<ClinicaRow[]>(
    "SELECT * FROM clinicas WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows[0]) throw new AppError("Clinica no encontrada", 404);
  return rows[0];
}

/** Crea una clinica (solo SUPER_ADMIN). */
export async function createClinic(input: CreateClinicInput, user: AuthUser) {
  if (!esSuper(user)) throw new AppError("Solo el super administrador puede crear clinicas", 403);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO clinicas (nombre, nit, telefono, email, direccion, logo_url, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.nombre,
      input.nit ?? null,
      input.telefono ?? null,
      input.email || null,
      input.direccion ?? null,
      input.logo_url ?? null,
      input.activo ?? true,
    ]
  );
  return getClinic(result.insertId, user);
}

/** Actualiza una clinica (SUPER_ADMIN cualquiera; ADMIN_CLINICA la suya). */
export async function updateClinic(id: number, input: UpdateClinicInput, user: AuthUser) {
  assertAcceso(user, id);
  await getClinic(id, user);

  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];
  const set = (col: string, val: unknown) => { fields.push(`${col} = ?`); params.push(val); };

  if (input.nombre !== undefined) set("nombre", input.nombre);
  if (input.nit !== undefined) set("nit", input.nit);
  if (input.telefono !== undefined) set("telefono", input.telefono);
  if (input.email !== undefined) set("email", input.email || null);
  if (input.direccion !== undefined) set("direccion", input.direccion);
  if (input.logo_url !== undefined) set("logo_url", input.logo_url);
  if (input.activo !== undefined) set("activo", input.activo);

  if (fields.length > 0) {
    params.push(id);
    await pool.execute(`UPDATE clinicas SET ${fields.join(", ")} WHERE id = ?`, params);
  }
  return getClinic(id, user);
}

/** Desactiva (soft-delete) una clinica (solo SUPER_ADMIN). */
export async function deleteClinic(id: number, user: AuthUser) {
  if (!esSuper(user)) throw new AppError("Solo el super administrador puede eliminar clinicas", 403);
  await getClinic(id, user);
  await pool.execute("UPDATE clinicas SET activo = 0 WHERE id = ?", [id]);
}
