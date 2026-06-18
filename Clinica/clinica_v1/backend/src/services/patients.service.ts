import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import {
  CreatePatientInput,
  UpdatePatientInput,
  ListPatientsQuery,
} from "../validations/patient.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

interface PacienteRow extends RowDataPacket {
  id: number;
}

/** Lista pacientes de la clinica (con busqueda opcional por nombre/documento). */
export async function listPatients(query: ListPatientsQuery, user: AuthUser) {
  const clinicaId = requireClinica(user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [clinicaId];
  let where = "clinica_id = ?";

  if (query.search) {
    where += " AND (nombres LIKE ? OR apellidos LIKE ? OR numero_documento LIKE ?)";
    const like = `%${query.search}%`;
    params.push(like, like, like);
  }

  const [rows] = await pool.execute<PacienteRow[]>(
    `SELECT * FROM pacientes WHERE ${where} ORDER BY apellidos, nombres LIMIT 500`,
    params
  );
  return rows;
}

/** Devuelve un paciente por id (filtrando clinica). */
export async function getPatient(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<PacienteRow[]>(
    "SELECT * FROM pacientes WHERE id = ? AND clinica_id = ? LIMIT 1",
    [id, clinicaId]
  );
  if (!rows[0]) throw new AppError("Paciente no encontrado", 404);
  return rows[0];
}

/** Crea un paciente (ficha clinica, sin cuenta de acceso). */
export async function createPatient(input: CreatePatientInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO pacientes
      (clinica_id, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento,
       sexo, telefono, email, direccion, ciudad, eps, grupo_sanguineo, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId,
      input.tipo_documento,
      input.numero_documento,
      input.nombres,
      input.apellidos,
      input.fecha_nacimiento ?? null,
      input.sexo ?? "OTRO",
      input.telefono ?? null,
      input.email || null,
      input.direccion ?? null,
      input.ciudad ?? null,
      input.eps ?? null,
      input.grupo_sanguineo ?? null,
      input.activo ?? true,
    ]
  );
  return getPatient(result.insertId, user);
}

/** Actualiza un paciente. */
export async function updatePatient(id: number, input: UpdatePatientInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getPatient(id, user);

  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];
  const set = (col: string, val: unknown) => { fields.push(`${col} = ?`); params.push(val); };

  if (input.tipo_documento !== undefined) set("tipo_documento", input.tipo_documento);
  if (input.numero_documento !== undefined) set("numero_documento", input.numero_documento);
  if (input.nombres !== undefined) set("nombres", input.nombres);
  if (input.apellidos !== undefined) set("apellidos", input.apellidos);
  if (input.fecha_nacimiento !== undefined) set("fecha_nacimiento", input.fecha_nacimiento ?? null);
  if (input.sexo !== undefined) set("sexo", input.sexo);
  if (input.telefono !== undefined) set("telefono", input.telefono);
  if (input.email !== undefined) set("email", input.email || null);
  if (input.direccion !== undefined) set("direccion", input.direccion);
  if (input.ciudad !== undefined) set("ciudad", input.ciudad);
  if (input.eps !== undefined) set("eps", input.eps);
  if (input.grupo_sanguineo !== undefined) set("grupo_sanguineo", input.grupo_sanguineo);
  if (input.activo !== undefined) set("activo", input.activo);

  if (fields.length > 0) {
    params.push(id, clinicaId);
    await pool.execute(
      `UPDATE pacientes SET ${fields.join(", ")} WHERE id = ? AND clinica_id = ?`,
      params
    );
  }
  return getPatient(id, user);
}

/** Desactiva (soft-delete) un paciente. */
export async function deletePatient(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getPatient(id, user);
  await pool.execute("UPDATE pacientes SET activo = 0 WHERE id = ? AND clinica_id = ?", [id, clinicaId]);
}
