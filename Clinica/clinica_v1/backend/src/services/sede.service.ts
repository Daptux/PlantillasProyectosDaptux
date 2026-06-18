import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { CreateSedeInput, UpdateSedeInput } from "../validations/sede.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

interface SedeRow extends RowDataPacket {
  id: number;
}

/** Lista las sedes de la clinica. */
export async function listSedes(user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<SedeRow[]>(
    "SELECT * FROM sedes WHERE clinica_id = ? ORDER BY nombre",
    [clinicaId]
  );
  return rows;
}

/** Devuelve una sede por id. */
export async function getSede(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<SedeRow[]>(
    "SELECT * FROM sedes WHERE id = ? AND clinica_id = ? LIMIT 1",
    [id, clinicaId]
  );
  if (!rows[0]) throw new AppError("Sede no encontrada", 404);
  return rows[0];
}

/** Crea una sede. */
export async function createSede(input: CreateSedeInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO sedes (clinica_id, nombre, direccion, ciudad, telefono, email, latitud, longitud, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId,
      input.nombre,
      input.direccion ?? null,
      input.ciudad ?? null,
      input.telefono ?? null,
      input.email || null,
      input.latitud ?? null,
      input.longitud ?? null,
      input.activo ?? true,
    ]
  );
  return getSede(result.insertId, user);
}

/** Actualiza una sede. */
export async function updateSede(id: number, input: UpdateSedeInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getSede(id, user);

  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];
  const set = (col: string, val: unknown) => { fields.push(`${col} = ?`); params.push(val); };

  if (input.nombre !== undefined) set("nombre", input.nombre);
  if (input.direccion !== undefined) set("direccion", input.direccion);
  if (input.ciudad !== undefined) set("ciudad", input.ciudad);
  if (input.telefono !== undefined) set("telefono", input.telefono);
  if (input.email !== undefined) set("email", input.email || null);
  if (input.latitud !== undefined) set("latitud", input.latitud);
  if (input.longitud !== undefined) set("longitud", input.longitud);
  if (input.activo !== undefined) set("activo", input.activo);

  if (fields.length > 0) {
    params.push(id, clinicaId);
    await pool.execute(`UPDATE sedes SET ${fields.join(", ")} WHERE id = ? AND clinica_id = ?`, params);
  }
  return getSede(id, user);
}

/** Desactiva (soft-delete) una sede. */
export async function deleteSede(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getSede(id, user);
  await pool.execute("UPDATE sedes SET activo = 0 WHERE id = ? AND clinica_id = ?", [id, clinicaId]);
}
