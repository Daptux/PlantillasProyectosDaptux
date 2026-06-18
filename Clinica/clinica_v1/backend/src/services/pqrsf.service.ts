import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { ROLES } from "../middlewares/role.middleware";
import { notifyPaciente } from "./notifications.service";
import {
  CreatePqrsfInput,
  RespondPqrsfInput,
  ListPqrsfQuery,
} from "../validations/pqrsf.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

interface PqrsfRow extends RowDataPacket {
  id: number;
  paciente_id: number | null;
}

const SELECT_PQRSF = `
  SELECT q.*,
         pa.nombres AS paciente_nombres, pa.apellidos AS paciente_apellidos,
         u.nombres AS respondido_por_nombres, u.apellidos AS respondido_por_apellidos
    FROM pqrsf q
    LEFT JOIN pacientes pa ON pa.id = q.paciente_id
    LEFT JOIN usuarios  u  ON u.id = q.respondido_por`;

/** paciente_id asociado a un usuario rol PACIENTE (o null si no tiene ficha). */
async function pacienteIdDeUsuario(usuarioId: number, clinicaId: number): Promise<number | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM pacientes WHERE usuario_id = ? AND clinica_id = ? LIMIT 1",
    [usuarioId, clinicaId]
  );
  return rows[0] ? (rows[0] as { id: number }).id : null;
}

/**
 * Crea una PQRSF. Puede ser anonima (desde la landing) o de un paciente logueado.
 * Si el usuario esta autenticado, se usa su clinica y, si es paciente, se vincula su ficha.
 */
export async function createPqrsf(input: CreatePqrsfInput, user?: AuthUser) {
  const clinicaId = user?.clinicaId ?? input.clinica_id;

  let pacienteId: number | null = null;
  if (user?.rol === ROLES.PACIENTE) {
    pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO pqrsf
      (clinica_id, paciente_id, tipo, nombre_remitente, email_remitente, telefono_remitente, asunto, mensaje)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId,
      pacienteId,
      input.tipo,
      input.nombre_remitente ?? null,
      input.email_remitente || null,
      input.telefono_remitente ?? null,
      input.asunto,
      input.mensaje,
    ]
  );

  const [rows] = await pool.execute<PqrsfRow[]>(`${SELECT_PQRSF} WHERE q.id = ? LIMIT 1`, [
    result.insertId,
  ]);
  return rows[0];
}

/** Lista PQRSF de la clinica (admin/recepcion) con filtros opcionales. */
export async function listPqrsf(query: ListPqrsfQuery, user: AuthUser) {
  const clinicaId = requireClinica(user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [clinicaId];
  const where: string[] = ["q.clinica_id = ?"];
  if (query.estado) {
    where.push("q.estado = ?");
    params.push(query.estado);
  }
  if (query.tipo) {
    where.push("q.tipo = ?");
    params.push(query.tipo);
  }
  const [rows] = await pool.execute<PqrsfRow[]>(
    `${SELECT_PQRSF} WHERE ${where.join(" AND ")} ORDER BY q.created_at DESC`,
    params
  );
  return rows;
}

/** Lista las PQRSF del paciente autenticado. */
export async function listMyPqrsf(user: AuthUser) {
  const clinicaId = requireClinica(user);
  const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
  if (!pacienteId) return [];
  const [rows] = await pool.execute<PqrsfRow[]>(
    `${SELECT_PQRSF} WHERE q.paciente_id = ? AND q.clinica_id = ? ORDER BY q.created_at DESC`,
    [pacienteId, clinicaId]
  );
  return rows;
}

/** Devuelve una PQRSF por id (filtrando clinica). */
export async function getPqrsf(id: number, user: AuthUser): Promise<PqrsfRow> {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<PqrsfRow[]>(
    `${SELECT_PQRSF} WHERE q.id = ? AND q.clinica_id = ? LIMIT 1`,
    [id, clinicaId]
  );
  if (!rows[0]) throw new AppError("PQRSF no encontrada", 404);
  return rows[0];
}

/** Responde una PQRSF (registra respuesta, estado y autor). */
export async function respondPqrsf(id: number, input: RespondPqrsfInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getPqrsf(id, user);

  await pool.execute(
    `UPDATE pqrsf
        SET respuesta = ?, estado = ?, respondido_por = ?, fecha_respuesta = NOW()
      WHERE id = ? AND clinica_id = ?`,
    [input.respuesta, input.estado, user.id, id, clinicaId]
  );

  // Si la PQRSF pertenece a un paciente registrado, se le notifica la respuesta.
  const pqrsf = await getPqrsf(id, user);
  if (pqrsf.paciente_id) {
    await notifyPaciente(pqrsf.paciente_id, clinicaId, {
      titulo: "Respuesta a tu PQRSF",
      mensaje: `Tu solicitud "${pqrsf.asunto}" ha sido respondida.`,
      tipo: "PQRSF",
      url: "/paciente/pqrsf",
    });
  }
  return pqrsf;
}

/** Cambia solo el estado de una PQRSF. */
export async function updatePqrsfStatus(id: number, estado: string, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getPqrsf(id, user);
  await pool.execute("UPDATE pqrsf SET estado = ? WHERE id = ? AND clinica_id = ?", [
    estado,
    id,
    clinicaId,
  ]);
  return getPqrsf(id, user);
}
