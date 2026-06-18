import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { CreateSpecialtyInput, UpdateSpecialtyInput } from "../validations/specialty.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

interface EspecialidadRow extends RowDataPacket {
  id: number;
}

/** Lista las especialidades de la clinica. */
export async function listSpecialties(user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<EspecialidadRow[]>(
    "SELECT * FROM especialidades WHERE clinica_id = ? ORDER BY nombre",
    [clinicaId]
  );
  return rows;
}

/** Devuelve una especialidad por id (filtrando clinica). */
export async function getSpecialty(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<EspecialidadRow[]>(
    "SELECT * FROM especialidades WHERE id = ? AND clinica_id = ? LIMIT 1",
    [id, clinicaId]
  );
  if (!rows[0]) throw new AppError("Especialidad no encontrada", 404);
  return rows[0];
}

/** Crea una especialidad. */
export async function createSpecialty(input: CreateSpecialtyInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO especialidades (clinica_id, nombre, descripcion, icono, activo)
     VALUES (?, ?, ?, ?, ?)`,
    [clinicaId, input.nombre, input.descripcion ?? null, input.icono ?? null, input.activo ?? true]
  );
  return getSpecialty(result.insertId, user);
}

/** Actualiza una especialidad. */
export async function updateSpecialty(id: number, input: UpdateSpecialtyInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getSpecialty(id, user); // valida existencia + clinica

  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];
  if (input.nombre !== undefined) { fields.push("nombre = ?"); params.push(input.nombre); }
  if (input.descripcion !== undefined) { fields.push("descripcion = ?"); params.push(input.descripcion); }
  if (input.icono !== undefined) { fields.push("icono = ?"); params.push(input.icono); }
  if (input.activo !== undefined) { fields.push("activo = ?"); params.push(input.activo); }

  if (fields.length > 0) {
    params.push(id, clinicaId);
    await pool.execute(
      `UPDATE especialidades SET ${fields.join(", ")} WHERE id = ? AND clinica_id = ?`,
      params
    );
  }
  return getSpecialty(id, user);
}

/** Desactiva (soft-delete) una especialidad. */
export async function deleteSpecialty(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getSpecialty(id, user);
  await pool.execute(
    "UPDATE especialidades SET activo = 0 WHERE id = ? AND clinica_id = ?",
    [id, clinicaId]
  );
}
