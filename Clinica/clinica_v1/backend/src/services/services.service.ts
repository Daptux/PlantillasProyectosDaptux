import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { CreateServiceInput, UpdateServiceInput } from "../validations/service.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

interface ServicioRow extends RowDataPacket {
  id: number;
  sede_ids: string | null;
}

const toIds = (v: unknown): number[] => (v ? String(v).split(",").map(Number) : []);

/** Verifica que las sedes pertenezcan a la clinica. */
async function assertSedesEnClinica(sedeIds: number[], clinicaId: number): Promise<void> {
  if (sedeIds.length === 0) return;
  const placeholders = sedeIds.map(() => "?").join(", ");
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM sedes WHERE clinica_id = ? AND id IN (${placeholders})`,
    [clinicaId, ...sedeIds]
  );
  if (rows.length !== sedeIds.length) {
    throw new AppError("Alguna sede no pertenece a la clinica", 422);
  }
}

/** Reemplaza las sedes asociadas a un servicio (dentro de una conexion/tx). */
async function syncSedes(conn: PoolConnection, servicioId: number, sedeIds: number[]) {
  await conn.execute("DELETE FROM servicio_sedes WHERE servicio_id = ?", [servicioId]);
  for (const sedeId of sedeIds) {
    await conn.execute(
      "INSERT INTO servicio_sedes (servicio_id, sede_id) VALUES (?, ?)",
      [servicioId, sedeId]
    );
  }
}

/** Lista los servicios de la clinica con especialidad y sedes. */
export async function listServices(user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<ServicioRow[]>(
    `SELECT s.*, e.nombre AS especialidad_nombre,
            GROUP_CONCAT(DISTINCT ss.sede_id) AS sede_ids
       FROM servicios s
       LEFT JOIN especialidades e ON e.id = s.especialidad_id
       LEFT JOIN servicio_sedes ss ON ss.servicio_id = s.id
      WHERE s.clinica_id = ?
      GROUP BY s.id
      ORDER BY s.nombre`,
    [clinicaId]
  );
  return rows.map((r) => ({ ...r, sede_ids: toIds(r.sede_ids) }));
}

/** Devuelve un servicio por id con sus sedes. */
export async function getService(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<ServicioRow[]>(
    `SELECT s.*, e.nombre AS especialidad_nombre,
            GROUP_CONCAT(DISTINCT ss.sede_id) AS sede_ids
       FROM servicios s
       LEFT JOIN especialidades e ON e.id = s.especialidad_id
       LEFT JOIN servicio_sedes ss ON ss.servicio_id = s.id
      WHERE s.id = ? AND s.clinica_id = ?
      GROUP BY s.id
      LIMIT 1`,
    [id, clinicaId]
  );
  if (!rows[0]) throw new AppError("Servicio no encontrado", 404);
  return { ...rows[0], sede_ids: toIds(rows[0].sede_ids) };
}

/** Crea un servicio (con sus sedes, transaccional). */
export async function createService(input: CreateServiceInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const sedeIds = input.sede_ids ?? [];
  await assertSedesEnClinica(sedeIds, clinicaId);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO servicios
        (clinica_id, especialidad_id, nombre, descripcion, duracion_minutos, precio, requiere_orden, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clinicaId,
        input.especialidad_id ?? null,
        input.nombre,
        input.descripcion ?? null,
        input.duracion_minutos,
        input.precio,
        input.requiere_orden ?? false,
        input.activo ?? true,
      ]
    );
    await syncSedes(conn, result.insertId, sedeIds);
    await conn.commit();
    return getService(result.insertId, user);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Actualiza un servicio (y opcionalmente sus sedes). */
export async function updateService(id: number, input: UpdateServiceInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getService(id, user);
  if (input.sede_ids) await assertSedesEnClinica(input.sede_ids, clinicaId);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const fields: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    const set = (col: string, val: unknown) => { fields.push(`${col} = ?`); params.push(val); };

    if (input.nombre !== undefined) set("nombre", input.nombre);
    if (input.especialidad_id !== undefined) set("especialidad_id", input.especialidad_id ?? null);
    if (input.descripcion !== undefined) set("descripcion", input.descripcion);
    if (input.duracion_minutos !== undefined) set("duracion_minutos", input.duracion_minutos);
    if (input.precio !== undefined) set("precio", input.precio);
    if (input.requiere_orden !== undefined) set("requiere_orden", input.requiere_orden);
    if (input.activo !== undefined) set("activo", input.activo);

    if (fields.length > 0) {
      params.push(id, clinicaId);
      await conn.execute(
        `UPDATE servicios SET ${fields.join(", ")} WHERE id = ? AND clinica_id = ?`,
        params
      );
    }
    if (input.sede_ids) await syncSedes(conn, id, input.sede_ids);

    await conn.commit();
    return getService(id, user);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Desactiva (soft-delete) un servicio. */
export async function deleteService(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getService(id, user);
  await pool.execute("UPDATE servicios SET activo = 0 WHERE id = ? AND clinica_id = ?", [id, clinicaId]);
}
