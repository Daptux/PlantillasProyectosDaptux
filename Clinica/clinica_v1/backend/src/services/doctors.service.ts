import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import {
  CreateDoctorInput,
  UpdateDoctorInput,
  CreateHorarioInput,
  CreateBloqueoInput,
} from "../validations/doctor.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

const toIds = (v: unknown): number[] => (v ? String(v).split(",").map(Number) : []);

interface MedicoRow extends RowDataPacket {
  id: number;
  especialidad_ids: string | null;
  servicio_ids: string | null;
}

// ---------------------------------------------------------------------------
//  Validaciones de pertenencia y sincronizacion N:M
// ---------------------------------------------------------------------------

async function assertEntidadesEnClinica(
  tabla: "especialidades" | "servicios",
  ids: number[],
  clinicaId: number
): Promise<void> {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(", ");
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM ${tabla} WHERE clinica_id = ? AND id IN (${placeholders})`,
    [clinicaId, ...ids]
  );
  if (rows.length !== ids.length) {
    throw new AppError(`Alguna ${tabla === "especialidades" ? "especialidad" : "servicio"} no pertenece a la clinica`, 422);
  }
}

async function syncEspecialidades(conn: PoolConnection, medicoId: number, ids: number[]) {
  await conn.execute("DELETE FROM medico_especialidades WHERE medico_id = ?", [medicoId]);
  for (const id of ids) {
    await conn.execute(
      "INSERT INTO medico_especialidades (medico_id, especialidad_id) VALUES (?, ?)",
      [medicoId, id]
    );
  }
}

async function syncServicios(conn: PoolConnection, medicoId: number, ids: number[]) {
  await conn.execute("DELETE FROM medico_servicios WHERE medico_id = ?", [medicoId]);
  for (const id of ids) {
    await conn.execute("INSERT INTO medico_servicios (medico_id, servicio_id) VALUES (?, ?)", [
      medicoId,
      id,
    ]);
  }
}

// ---------------------------------------------------------------------------
//  CRUD de medicos
// ---------------------------------------------------------------------------

const SELECT_MEDICO = `
  SELECT m.*,
         GROUP_CONCAT(DISTINCT me.especialidad_id) AS especialidad_ids,
         GROUP_CONCAT(DISTINCT ms.servicio_id)     AS servicio_ids
    FROM medicos m
    LEFT JOIN medico_especialidades me ON me.medico_id = m.id
    LEFT JOIN medico_servicios      ms ON ms.medico_id = m.id`;

/** Lista los medicos de la clinica con sus especialidades/servicios. */
export async function listDoctors(user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<MedicoRow[]>(
    `${SELECT_MEDICO} WHERE m.clinica_id = ? GROUP BY m.id ORDER BY m.apellidos, m.nombres`,
    [clinicaId]
  );
  return rows.map((r) => ({
    ...r,
    especialidad_ids: toIds(r.especialidad_ids),
    servicio_ids: toIds(r.servicio_ids),
  }));
}

/** Devuelve un medico por id. */
export async function getDoctor(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<MedicoRow[]>(
    `${SELECT_MEDICO} WHERE m.id = ? AND m.clinica_id = ? GROUP BY m.id LIMIT 1`,
    [id, clinicaId]
  );
  if (!rows[0]) throw new AppError("Medico no encontrado", 404);
  return {
    ...rows[0],
    especialidad_ids: toIds(rows[0].especialidad_ids),
    servicio_ids: toIds(rows[0].servicio_ids),
  };
}

/** Crea un medico con sus especialidades y servicios (transaccional). */
export async function createDoctor(input: CreateDoctorInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const especialidadIds = input.especialidad_ids ?? [];
  const servicioIds = input.servicio_ids ?? [];
  await assertEntidadesEnClinica("especialidades", especialidadIds, clinicaId);
  await assertEntidadesEnClinica("servicios", servicioIds, clinicaId);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO medicos
        (clinica_id, numero_documento, nombres, apellidos, registro_medico, telefono, email, foto_url, biografia, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clinicaId,
        input.numero_documento,
        input.nombres,
        input.apellidos,
        input.registro_medico ?? null,
        input.telefono ?? null,
        input.email || null,
        input.foto_url ?? null,
        input.biografia ?? null,
        input.activo ?? true,
      ]
    );
    await syncEspecialidades(conn, result.insertId, especialidadIds);
    await syncServicios(conn, result.insertId, servicioIds);
    await conn.commit();
    return getDoctor(result.insertId, user);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Actualiza un medico (y opcionalmente sus relaciones). */
export async function updateDoctor(id: number, input: UpdateDoctorInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getDoctor(id, user);
  if (input.especialidad_ids) await assertEntidadesEnClinica("especialidades", input.especialidad_ids, clinicaId);
  if (input.servicio_ids) await assertEntidadesEnClinica("servicios", input.servicio_ids, clinicaId);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const fields: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    const set = (col: string, val: unknown) => { fields.push(`${col} = ?`); params.push(val); };

    if (input.numero_documento !== undefined) set("numero_documento", input.numero_documento);
    if (input.nombres !== undefined) set("nombres", input.nombres);
    if (input.apellidos !== undefined) set("apellidos", input.apellidos);
    if (input.registro_medico !== undefined) set("registro_medico", input.registro_medico);
    if (input.telefono !== undefined) set("telefono", input.telefono);
    if (input.email !== undefined) set("email", input.email || null);
    if (input.foto_url !== undefined) set("foto_url", input.foto_url);
    if (input.biografia !== undefined) set("biografia", input.biografia);
    if (input.activo !== undefined) set("activo", input.activo);

    if (fields.length > 0) {
      params.push(id, clinicaId);
      await conn.execute(`UPDATE medicos SET ${fields.join(", ")} WHERE id = ? AND clinica_id = ?`, params);
    }
    if (input.especialidad_ids) await syncEspecialidades(conn, id, input.especialidad_ids);
    if (input.servicio_ids) await syncServicios(conn, id, input.servicio_ids);

    await conn.commit();
    return getDoctor(id, user);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Desactiva (soft-delete) un medico. */
export async function deleteDoctor(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getDoctor(id, user);
  await pool.execute("UPDATE medicos SET activo = 0 WHERE id = ? AND clinica_id = ?", [id, clinicaId]);
}

// ---------------------------------------------------------------------------
//  HORARIOS del medico
// ---------------------------------------------------------------------------

export async function listHorarios(medicoId: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getDoctor(medicoId, user); // valida clinica
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM horarios_medicos WHERE medico_id = ? AND clinica_id = ?
      ORDER BY dia_semana, hora_inicio`,
    [medicoId, clinicaId]
  );
  return rows;
}

export async function createHorario(medicoId: number, input: CreateHorarioInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getDoctor(medicoId, user);
  if (input.sede_id) {
    const [s] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM sedes WHERE id = ? AND clinica_id = ? LIMIT 1",
      [input.sede_id, clinicaId]
    );
    if (!s[0]) throw new AppError("Sede no encontrada en la clinica", 422);
  }
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO horarios_medicos (clinica_id, medico_id, sede_id, dia_semana, hora_inicio, hora_fin, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId,
      medicoId,
      input.sede_id ?? null,
      input.dia_semana,
      input.hora_inicio,
      input.hora_fin,
      input.activo ?? true,
    ]
  );
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM horarios_medicos WHERE id = ?",
    [result.insertId]
  );
  return rows[0];
}

export async function deleteHorario(medicoId: number, horarioId: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getDoctor(medicoId, user);
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM horarios_medicos WHERE id = ? AND medico_id = ? AND clinica_id = ?",
    [horarioId, medicoId, clinicaId]
  );
  if (result.affectedRows === 0) throw new AppError("Horario no encontrado", 404);
}

// ---------------------------------------------------------------------------
//  BLOQUEOS de agenda
// ---------------------------------------------------------------------------

export async function listBloqueos(medicoId: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getDoctor(medicoId, user);
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM bloqueos_agenda WHERE medico_id = ? AND clinica_id = ? ORDER BY fecha_inicio DESC",
    [medicoId, clinicaId]
  );
  return rows;
}

export async function createBloqueo(medicoId: number, input: CreateBloqueoInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getDoctor(medicoId, user);
  const norm = (s: string) => s.replace("T", " ");
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO bloqueos_agenda (clinica_id, medico_id, fecha_inicio, fecha_fin, motivo)
     VALUES (?, ?, ?, ?, ?)`,
    [clinicaId, medicoId, norm(input.fecha_inicio), norm(input.fecha_fin), input.motivo ?? null]
  );
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM bloqueos_agenda WHERE id = ?",
    [result.insertId]
  );
  return rows[0];
}

export async function deleteBloqueo(medicoId: number, bloqueoId: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getDoctor(medicoId, user);
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM bloqueos_agenda WHERE id = ? AND medico_id = ? AND clinica_id = ?",
    [bloqueoId, medicoId, clinicaId]
  );
  if (result.affectedRows === 0) throw new AppError("Bloqueo no encontrado", 404);
}
