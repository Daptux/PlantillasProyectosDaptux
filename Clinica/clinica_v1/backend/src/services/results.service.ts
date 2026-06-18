import path from "path";
import fs from "fs";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { ROLES } from "../middlewares/role.middleware";
import { UploadResultInput } from "../validations/document.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function pacienteIdDeUsuario(usuarioId: number, clinicaId: number): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM pacientes WHERE usuario_id = ? AND clinica_id = ? LIMIT 1",
    [usuarioId, clinicaId]
  );
  if (!rows[0]) throw new AppError("No existe una ficha de paciente para este usuario", 404);
  return (rows[0] as { id: number }).id;
}

async function assertPacienteEnClinica(pacienteId: number, clinicaId: number): Promise<void> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM pacientes WHERE id = ? AND clinica_id = ? LIMIT 1",
    [pacienteId, clinicaId]
  );
  if (!rows[0]) throw new AppError("Paciente no encontrado en la clinica", 404);
}

interface ResultadoRow extends RowDataPacket {
  id: number;
  paciente_id: number;
  url: string | null;
  titulo: string;
}

const SELECT_RES = `
  SELECT r.*,
         p.nombres AS paciente_nombres, p.apellidos AS paciente_apellidos,
         p.numero_documento AS paciente_documento,
         s.nombre AS servicio_nombre,
         u.nombres AS cargado_por_nombres, u.apellidos AS cargado_por_apellidos
    FROM resultados_medicos r
    JOIN pacientes p ON p.id = r.paciente_id
    LEFT JOIN servicios s ON s.id = r.servicio_id
    LEFT JOIN usuarios  u ON u.id = r.cargado_por`;

/** Registra un resultado medico (solo se guarda la URL del archivo). */
export async function createResult(
  file: Express.Multer.File | undefined,
  input: UploadResultInput,
  user: AuthUser
) {
  const clinicaId = requireClinica(user);
  await assertPacienteEnClinica(input.paciente_id, clinicaId);

  const url = file ? `/uploads/${file.filename}` : null;
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO resultados_medicos
      (clinica_id, paciente_id, cita_id, servicio_id, titulo, descripcion, url, fecha_resultado, cargado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId,
      input.paciente_id,
      input.cita_id ?? null,
      input.servicio_id ?? null,
      input.titulo,
      input.descripcion ?? null,
      url,
      input.fecha_resultado ?? null,
      user.id,
    ]
  );
  return getResult(result.insertId, user);
}

/** Devuelve un resultado por id (clinica + propiedad si es paciente). */
export async function getResult(id: number, user: AuthUser): Promise<ResultadoRow> {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<ResultadoRow[]>(
    `${SELECT_RES} WHERE r.id = ? AND r.clinica_id = ? LIMIT 1`,
    [id, clinicaId]
  );
  const res = rows[0];
  if (!res) throw new AppError("Resultado no encontrado", 404);

  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    if (res.paciente_id !== pacienteId) throw new AppError("Resultado no encontrado", 404);
  }
  return res;
}

/** Lista resultados de la clinica (staff). Filtro opcional por paciente. */
export async function listResults(user: AuthUser, pacienteId?: number) {
  const clinicaId = requireClinica(user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [clinicaId];
  let where = "r.clinica_id = ?";
  if (pacienteId) {
    where += " AND r.paciente_id = ?";
    params.push(pacienteId);
  }
  const [rows] = await pool.execute<ResultadoRow[]>(
    `${SELECT_RES} WHERE ${where} ORDER BY r.created_at DESC`,
    params
  );
  return rows;
}

/** Lista los resultados de un paciente (paciente solo los suyos). */
export async function listResultsByPatient(patientId: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    if (pacienteId !== patientId) throw new AppError("No tienes acceso a estos resultados", 403);
  }
  const [rows] = await pool.execute<ResultadoRow[]>(
    `${SELECT_RES} WHERE r.paciente_id = ? AND r.clinica_id = ? ORDER BY r.created_at DESC`,
    [patientId, clinicaId]
  );
  return rows;
}

/** Resultados del paciente autenticado (resuelve su ficha desde el token). */
export async function listMyResults(user: AuthUser) {
  const clinicaId = requireClinica(user);
  const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
  return listResultsByPatient(pacienteId, user);
}

/** Ruta absoluta del archivo del resultado para descarga segura. */
export async function getResultFile(id: number, user: AuthUser) {
  const res = await getResult(id, user);
  if (!res.url) throw new AppError("Este resultado no tiene archivo adjunto", 404);
  const absPath = path.join(UPLOAD_DIR, path.basename(res.url));
  if (!fs.existsSync(absPath)) throw new AppError("El archivo ya no existe en el servidor", 404);
  return { absPath, nombre: `${res.titulo}${path.extname(res.url)}` };
}

/** Elimina un resultado (registro + archivo). El rol se controla en la ruta. */
export async function deleteResult(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const res = await getResult(id, user);
  await pool.execute("DELETE FROM resultados_medicos WHERE id = ? AND clinica_id = ?", [id, clinicaId]);
  if (res.url) {
    const absPath = path.join(UPLOAD_DIR, path.basename(res.url));
    fs.promises.unlink(absPath).catch(() => undefined);
  }
}
