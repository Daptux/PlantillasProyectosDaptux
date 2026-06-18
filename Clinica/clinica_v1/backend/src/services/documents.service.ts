import path from "path";
import fs from "fs";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { ROLES } from "../middlewares/role.middleware";
import { UploadDocumentInput } from "../validations/document.validation";

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

/** paciente_id asociado a un usuario rol PACIENTE. */
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

interface DocumentoRow extends RowDataPacket {
  id: number;
  paciente_id: number;
  url: string;
  nombre_archivo: string;
}

const SELECT_DOC = `
  SELECT d.*, u.nombres AS subido_por_nombres, u.apellidos AS subido_por_apellidos
    FROM documentos_paciente d
    LEFT JOIN usuarios u ON u.id = d.subido_por`;

/**
 * Registra un documento subido (solo se guarda la URL/ruta, nunca el binario).
 * Para rol PACIENTE el documento se asocia a su propia ficha.
 */
export async function createDocument(
  file: Express.Multer.File,
  input: UploadDocumentInput,
  user: AuthUser
) {
  const clinicaId = requireClinica(user);

  let pacienteId: number;
  if (user.rol === ROLES.PACIENTE) {
    pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
  } else {
    if (!input.paciente_id) throw new AppError("paciente_id es obligatorio", 422);
    pacienteId = input.paciente_id;
    await assertPacienteEnClinica(pacienteId, clinicaId);
  }

  const url = `/uploads/${file.filename}`;
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO documentos_paciente
      (clinica_id, paciente_id, cita_id, tipo, nombre_archivo, url, mime_type, tamano_bytes, subido_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId,
      pacienteId,
      input.cita_id ?? null,
      input.tipo,
      file.originalname,
      url,
      file.mimetype,
      file.size,
      user.id,
    ]
  );
  return getDocument(result.insertId, user);
}

/** Devuelve un documento por id aplicando clinica + propiedad (paciente). */
export async function getDocument(id: number, user: AuthUser): Promise<DocumentoRow> {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<DocumentoRow[]>(
    `${SELECT_DOC} WHERE d.id = ? AND d.clinica_id = ? LIMIT 1`,
    [id, clinicaId]
  );
  const doc = rows[0];
  if (!doc) throw new AppError("Documento no encontrado", 404);

  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    if (doc.paciente_id !== pacienteId) throw new AppError("Documento no encontrado", 404);
  }
  return doc;
}

/** Lista los documentos de un paciente (paciente solo los suyos). */
export async function listDocumentsByPatient(patientId: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    if (pacienteId !== patientId) throw new AppError("No tienes acceso a estos documentos", 403);
  }
  const [rows] = await pool.execute<DocumentoRow[]>(
    `${SELECT_DOC} WHERE d.paciente_id = ? AND d.clinica_id = ? ORDER BY d.created_at DESC`,
    [patientId, clinicaId]
  );
  return rows;
}

/** Documentos del paciente autenticado (resuelve su ficha desde el token). */
export async function listMyDocuments(user: AuthUser) {
  const clinicaId = requireClinica(user);
  const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
  return listDocumentsByPatient(pacienteId, user);
}

/** Ruta absoluta del archivo para descarga segura (valida permisos). */
export async function getDocumentFile(id: number, user: AuthUser) {
  const doc = await getDocument(id, user);
  const absPath = path.join(UPLOAD_DIR, path.basename(doc.url));
  if (!fs.existsSync(absPath)) throw new AppError("El archivo ya no existe en el servidor", 404);
  return { absPath, nombre: doc.nombre_archivo };
}

/** Elimina un documento (registro + archivo fisico). */
export async function deleteDocument(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const doc = await getDocument(id, user); // valida clinica + propiedad

  await pool.execute("DELETE FROM documentos_paciente WHERE id = ? AND clinica_id = ?", [id, clinicaId]);

  // Borrado best-effort del archivo fisico.
  const absPath = path.join(UPLOAD_DIR, path.basename(doc.url));
  fs.promises.unlink(absPath).catch(() => undefined);
}
