import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

interface NotificacionInput {
  titulo: string;
  mensaje?: string;
  tipo?: string;
  url?: string;
}

/** Crea una notificacion para un usuario. Nunca lanza: no debe romper la operacion principal. */
export async function createNotification(
  usuarioId: number,
  clinicaId: number,
  input: NotificacionInput
): Promise<void> {
  try {
    await pool.execute(
      `INSERT INTO notificaciones (clinica_id, usuario_id, titulo, mensaje, tipo, url_destino)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clinicaId, usuarioId, input.titulo, input.mensaje ?? null, input.tipo ?? "INFO", input.url ?? null]
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("No se pudo crear la notificacion:", (e as Error).message);
  }
}

/** Notifica al usuario asociado a un paciente (si tiene cuenta de acceso). */
export async function notifyPaciente(
  pacienteId: number,
  clinicaId: number,
  input: NotificacionInput
): Promise<void> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT usuario_id FROM pacientes WHERE id = ? AND clinica_id = ? LIMIT 1",
    [pacienteId, clinicaId]
  );
  const usuarioId = rows[0]?.usuario_id as number | null | undefined;
  if (usuarioId) await createNotification(usuarioId, clinicaId, input);
}

/** Lista las notificaciones del usuario autenticado (recientes). */
export async function listNotifications(user: AuthUser) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY created_at DESC LIMIT 50",
    [user.id]
  );
  return rows;
}

/** Numero de notificaciones sin leer. */
export async function unreadCount(user: AuthUser): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) v FROM notificaciones WHERE usuario_id = ? AND leida = 0",
    [user.id]
  );
  return Number((rows[0] as { v: number }).v ?? 0);
}

/** Marca una notificacion como leida (solo del propio usuario). */
export async function markRead(id: number, user: AuthUser) {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?",
    [id, user.id]
  );
  if (result.affectedRows === 0) throw new AppError("Notificacion no encontrada", 404);
}

/** Marca todas las notificaciones del usuario como leidas. */
export async function markAllRead(user: AuthUser) {
  await pool.execute("UPDATE notificaciones SET leida = 1 WHERE usuario_id = ? AND leida = 0", [user.id]);
}
