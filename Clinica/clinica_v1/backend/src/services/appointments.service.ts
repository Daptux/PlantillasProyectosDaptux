import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { toMySqlDateTime, dayOfWeek } from "../utils/dates";
import { ROLES } from "../middlewares/role.middleware";
import { notifyPaciente } from "./notifications.service";
import {
  CreateAppointmentInput,
  RescheduleInput,
  ListAppointmentsQuery,
} from "../validations/appointment.validation";

/** Usuario autenticado tal como lo inyecta el middleware auth. */
interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

/**
 * Estados que "ocupan" una franja horaria. Una cita CANCELADA o NO_ASISTIO
 * libera el horario, por eso se excluyen de los choques.
 */
const ESTADOS_OCUPAN = [
  "SOLICITADA",
  "PENDIENTE_DOCUMENTOS",
  "CONFIRMADA",
  "EN_ESPERA",
  "EN_ATENCION",
  "ATENDIDA",
];

const DURACION_DEFAULT_MIN = 30;

// ---------------------------------------------------------------------------
//  Helpers internos
// ---------------------------------------------------------------------------

/** Garantiza que el usuario pertenece a una clinica (multi-tenant). */
function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) {
    throw new AppError("El usuario no esta asociado a una clinica", 403);
  }
  return user.clinicaId;
}

/** Convierte el string de entrada a Date local, validando que sea real. */
function parseDateTime(value: string): Date {
  const date = new Date(value.replace("T", " ").replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    throw new AppError("Fecha/hora invalida", 400);
  }
  return date;
}

/** 'HH:mm:ss' de un Date local (para comparar contra horarios_medicos). */
function timeString(date: Date): string {
  return toMySqlDateTime(date).slice(11); // 'YYYY-MM-DD HH:mm:ss' -> 'HH:mm:ss'
}

interface IdRow extends RowDataPacket {
  id: number;
}
interface DuracionRow extends RowDataPacket {
  id: number;
  duracion_minutos: number;
}
interface CountRow extends RowDataPacket {
  total: number;
}

/** Devuelve el paciente_id asociado a un usuario rol PACIENTE. */
async function pacienteIdDeUsuario(usuarioId: number, clinicaId: number): Promise<number> {
  const [rows] = await pool.execute<IdRow[]>(
    "SELECT id FROM pacientes WHERE usuario_id = ? AND clinica_id = ? LIMIT 1",
    [usuarioId, clinicaId]
  );
  if (!rows[0]) {
    throw new AppError("No existe una ficha de paciente para este usuario", 404);
  }
  return rows[0].id;
}

/** Devuelve el medico_id asociado a un usuario rol MEDICO. */
async function medicoIdDeUsuario(usuarioId: number, clinicaId: number): Promise<number> {
  const [rows] = await pool.execute<IdRow[]>(
    "SELECT id FROM medicos WHERE usuario_id = ? AND clinica_id = ? LIMIT 1",
    [usuarioId, clinicaId]
  );
  if (!rows[0]) {
    throw new AppError("No existe una ficha de medico para este usuario", 404);
  }
  return rows[0].id;
}

/**
 * Aplica las 4 REGLAS DE NEGOCIO de la agenda:
 *  1) paciente sin doble cita activa en el mismo horario,
 *  2) medico sin doble cita en el mismo horario,
 *  3) cita dentro de horarios_medicos del medico,
 *  4) cita fuera de bloqueos_agenda.
 * Lanza AppError 409 si alguna regla se incumple.
 */
async function validarDisponibilidad(params: {
  clinicaId: number;
  medicoId: number;
  pacienteId: number;
  inicio: Date;
  fin: Date;
  excluirCitaId?: number;
}): Promise<void> {
  const { clinicaId, medicoId, pacienteId, inicio, fin, excluirCitaId } = params;

  if (fin <= inicio) {
    throw new AppError("La hora de fin debe ser posterior a la de inicio", 400);
  }
  if (inicio < new Date()) {
    throw new AppError("No se puede agendar una cita en el pasado", 400);
  }

  const inicioSql = toMySqlDateTime(inicio);
  const finSql = toMySqlDateTime(fin);
  const ocupanPlaceholders = ESTADOS_OCUPAN.map(() => "?").join(", ");

  // Regla 3: dentro de un horario activo del medico ese dia de la semana.
  const [horarios] = await pool.execute<CountRow[]>(
    `SELECT COUNT(*) AS total
       FROM horarios_medicos
      WHERE clinica_id = ? AND medico_id = ? AND dia_semana = ? AND activo = 1
        AND hora_inicio <= ? AND hora_fin >= ?`,
    [clinicaId, medicoId, dayOfWeek(inicio), timeString(inicio), timeString(fin)]
  );
  if (horarios[0].total === 0) {
    throw new AppError("El medico no atiende en ese horario", 409);
  }

  // Regla 4: no debe caer dentro de un bloqueo de agenda (solapamiento).
  const [bloqueos] = await pool.execute<CountRow[]>(
    `SELECT COUNT(*) AS total
       FROM bloqueos_agenda
      WHERE clinica_id = ? AND medico_id = ?
        AND fecha_inicio < ? AND fecha_fin > ?`,
    [clinicaId, medicoId, finSql, inicioSql]
  );
  if (bloqueos[0].total > 0) {
    throw new AppError("El medico tiene un bloqueo de agenda en ese horario", 409);
  }

  // Regla 2: el medico no debe tener otra cita activa solapada.
  const [citasMedico] = await pool.execute<CountRow[]>(
    `SELECT COUNT(*) AS total
       FROM citas
      WHERE clinica_id = ? AND medico_id = ?
        AND estado IN (${ocupanPlaceholders})
        AND fecha_inicio < ? AND fecha_fin > ?
        ${excluirCitaId ? "AND id <> ?" : ""}`,
    [
      clinicaId,
      medicoId,
      ...ESTADOS_OCUPAN,
      finSql,
      inicioSql,
      ...(excluirCitaId ? [excluirCitaId] : []),
    ]
  );
  if (citasMedico[0].total > 0) {
    throw new AppError("El medico ya tiene una cita en ese horario", 409);
  }

  // Regla 1: el paciente no debe tener otra cita activa solapada.
  const [citasPaciente] = await pool.execute<CountRow[]>(
    `SELECT COUNT(*) AS total
       FROM citas
      WHERE clinica_id = ? AND paciente_id = ?
        AND estado IN (${ocupanPlaceholders})
        AND fecha_inicio < ? AND fecha_fin > ?
        ${excluirCitaId ? "AND id <> ?" : ""}`,
    [
      clinicaId,
      pacienteId,
      ...ESTADOS_OCUPAN,
      finSql,
      inicioSql,
      ...(excluirCitaId ? [excluirCitaId] : []),
    ]
  );
  if (citasPaciente[0].total > 0) {
    throw new AppError("El paciente ya tiene una cita en ese horario", 409);
  }
}

/**
 * Valida que el servicio pertenezca a la clinica y devuelve su duracion.
 * Si no se envia servicio, usa la duracion por defecto.
 */
async function duracionDeServicio(
  servicioId: number | undefined,
  clinicaId: number
): Promise<number> {
  if (!servicioId) return DURACION_DEFAULT_MIN;
  const [rows] = await pool.execute<DuracionRow[]>(
    "SELECT id, duracion_minutos FROM servicios WHERE id = ? AND clinica_id = ? AND activo = 1 LIMIT 1",
    [servicioId, clinicaId]
  );
  if (!rows[0]) {
    throw new AppError("Servicio no encontrado en la clinica", 404);
  }
  return rows[0].duracion_minutos || DURACION_DEFAULT_MIN;
}

/** Verifica que el medico exista y pertenezca a la clinica. */
async function assertMedicoEnClinica(medicoId: number, clinicaId: number): Promise<void> {
  const [rows] = await pool.execute<IdRow[]>(
    "SELECT id FROM medicos WHERE id = ? AND clinica_id = ? AND activo = 1 LIMIT 1",
    [medicoId, clinicaId]
  );
  if (!rows[0]) throw new AppError("Medico no encontrado en la clinica", 404);
}

/** Verifica que el paciente exista y pertenezca a la clinica. */
async function assertPacienteEnClinica(pacienteId: number, clinicaId: number): Promise<void> {
  const [rows] = await pool.execute<IdRow[]>(
    "SELECT id FROM pacientes WHERE id = ? AND clinica_id = ? LIMIT 1",
    [pacienteId, clinicaId]
  );
  if (!rows[0]) throw new AppError("Paciente no encontrado en la clinica", 404);
}

// ---------------------------------------------------------------------------
//  SELECT enriquecido reutilizable
// ---------------------------------------------------------------------------

const SELECT_CITA = `
  SELECT c.id, c.clinica_id, c.sede_id, c.paciente_id, c.medico_id, c.servicio_id,
         c.fecha_inicio, c.fecha_fin, c.estado, c.motivo, c.notas, c.creado_por,
         c.created_at, c.updated_at,
         p.nombres   AS paciente_nombres,  p.apellidos AS paciente_apellidos,
         p.numero_documento AS paciente_documento,
         m.nombres   AS medico_nombres,    m.apellidos AS medico_apellidos,
         s.nombre    AS servicio_nombre,   s.duracion_minutos AS servicio_duracion,
         se.nombre   AS sede_nombre
    FROM citas c
    JOIN pacientes p ON p.id = c.paciente_id
    JOIN medicos   m ON m.id = c.medico_id
    LEFT JOIN servicios s ON s.id = c.servicio_id
    LEFT JOIN sedes    se ON se.id = c.sede_id`;

interface CitaRow extends RowDataPacket {
  id: number;
  clinica_id: number;
  paciente_id: number;
  medico_id: number;
}

/**
 * Recupera una cita por id aplicando el filtro de clinica y, segun el rol,
 * el filtro de propiedad (paciente solo las suyas, medico solo su agenda).
 */
export async function getAppointmentById(id: number, user: AuthUser): Promise<CitaRow> {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<CitaRow[]>(
    `${SELECT_CITA} WHERE c.id = ? AND c.clinica_id = ? LIMIT 1`,
    [id, clinicaId]
  );
  const cita = rows[0];
  if (!cita) throw new AppError("Cita no encontrada", 404);

  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    if (cita.paciente_id !== pacienteId) throw new AppError("Cita no encontrada", 404);
  } else if (user.rol === ROLES.MEDICO) {
    const medicoId = await medicoIdDeUsuario(user.id, clinicaId);
    if (cita.medico_id !== medicoId) throw new AppError("Cita no encontrada", 404);
  }
  return cita;
}

/**
 * Lista citas segun rol:
 *  - PACIENTE: solo las suyas.
 *  - MEDICO: solo su agenda.
 *  - RECEPCION/ADMIN/SUPER_ADMIN: todas las de la clinica (con filtros).
 */
export async function listAppointments(query: ListAppointmentsQuery, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const where: string[] = ["c.clinica_id = ?"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [clinicaId];

  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    where.push("c.paciente_id = ?");
    params.push(pacienteId);
  } else if (user.rol === ROLES.MEDICO) {
    const medicoId = await medicoIdDeUsuario(user.id, clinicaId);
    where.push("c.medico_id = ?");
    params.push(medicoId);
  } else {
    // El staff puede filtrar por medico/paciente/sede.
    if (query.medico_id) {
      where.push("c.medico_id = ?");
      params.push(query.medico_id);
    }
    if (query.paciente_id) {
      where.push("c.paciente_id = ?");
      params.push(query.paciente_id);
    }
  }

  if (query.sede_id) {
    where.push("c.sede_id = ?");
    params.push(query.sede_id);
  }
  if (query.estado) {
    where.push("c.estado = ?");
    params.push(query.estado);
  }
  if (query.desde) {
    where.push("c.fecha_inicio >= ?");
    params.push(`${query.desde} 00:00:00`);
  }
  if (query.hasta) {
    where.push("c.fecha_inicio <= ?");
    params.push(`${query.hasta} 23:59:59`);
  }

  const [rows] = await pool.execute<CitaRow[]>(
    `${SELECT_CITA} WHERE ${where.join(" AND ")} ORDER BY c.fecha_inicio ASC`,
    params
  );
  return rows;
}

/** Crea una cita aplicando las reglas de negocio. Devuelve la cita creada. */
export async function createAppointment(input: CreateAppointmentInput, user: AuthUser) {
  const clinicaId = requireClinica(user);

  // Resolver paciente segun el rol.
  let pacienteId: number;
  if (user.rol === ROLES.PACIENTE) {
    pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
  } else {
    if (!input.paciente_id) {
      throw new AppError("paciente_id es obligatorio", 422);
    }
    pacienteId = input.paciente_id;
    await assertPacienteEnClinica(pacienteId, clinicaId);
  }

  await assertMedicoEnClinica(input.medico_id, clinicaId);

  const duracion = await duracionDeServicio(input.servicio_id, clinicaId);
  const inicio = parseDateTime(input.fecha_inicio);
  const fin = new Date(inicio.getTime() + duracion * 60_000);

  await validarDisponibilidad({
    clinicaId,
    medicoId: input.medico_id,
    pacienteId,
    inicio,
    fin,
  });

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO citas
       (clinica_id, sede_id, paciente_id, medico_id, servicio_id, fecha_inicio, fecha_fin, motivo, notas, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId,
      input.sede_id ?? null,
      pacienteId,
      input.medico_id,
      input.servicio_id ?? null,
      toMySqlDateTime(inicio),
      toMySqlDateTime(fin),
      input.motivo ?? null,
      input.notas ?? null,
      user.id,
    ]
  );

  // Notifica al paciente que tiene una nueva cita agendada.
  await notifyPaciente(pacienteId, clinicaId, {
    titulo: "Nueva cita agendada",
    mensaje: `Tu cita quedo programada para el ${toMySqlDateTime(inicio)}.`,
    tipo: "CITA",
    url: "/paciente/citas",
  });

  return getAppointmentById(result.insertId, user);
}

/** Reprograma una cita (nueva fecha/servicio/sede) revalidando reglas. */
export async function rescheduleAppointment(id: number, input: RescheduleInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const cita = await getAppointmentById(id, user); // valida clinica + propiedad

  if (cita.estado === "CANCELADA" || cita.estado === "ATENDIDA") {
    throw new AppError("No se puede reprogramar una cita cancelada o atendida", 409);
  }

  // Servicio para recalcular duracion: el nuevo si se envia, si no el actual.
  const servicioId = input.servicio_id ?? cita.servicio_id ?? undefined;
  const duracion = await duracionDeServicio(servicioId, clinicaId);
  const inicio = parseDateTime(input.fecha_inicio);
  const fin = new Date(inicio.getTime() + duracion * 60_000);

  await validarDisponibilidad({
    clinicaId,
    medicoId: cita.medico_id,
    pacienteId: cita.paciente_id,
    inicio,
    fin,
    excluirCitaId: id,
  });

  await pool.execute(
    `UPDATE citas
        SET fecha_inicio = ?, fecha_fin = ?, servicio_id = ?, sede_id = ?
      WHERE id = ? AND clinica_id = ?`,
    [
      toMySqlDateTime(inicio),
      toMySqlDateTime(fin),
      servicioId ?? null,
      input.sede_id ?? cita.sede_id ?? null,
      id,
      clinicaId,
    ]
  );

  return getAppointmentById(id, user);
}

/** Cambia el estado de una cita. */
export async function updateAppointmentStatus(id: number, estado: string, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getAppointmentById(id, user); // valida clinica + propiedad

  await pool.execute(
    "UPDATE citas SET estado = ? WHERE id = ? AND clinica_id = ?",
    [estado, id, clinicaId]
  );
  return getAppointmentById(id, user);
}

/**
 * Cancelacion logica de una cita (estado = CANCELADA). No se borra fisicamente
 * para preservar el historial clinico y la auditoria.
 */
export async function cancelAppointment(id: number, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const cita = await getAppointmentById(id, user);

  if (cita.estado === "CANCELADA") {
    throw new AppError("La cita ya estaba cancelada", 409);
  }

  await pool.execute(
    "UPDATE citas SET estado = 'CANCELADA' WHERE id = ? AND clinica_id = ?",
    [id, clinicaId]
  );
  return getAppointmentById(id, user);
}

// ---------------------------------------------------------------------------
//  Catalogos para el formulario de cita (medicos / servicios / sedes / pacientes)
// ---------------------------------------------------------------------------

/**
 * Devuelve los catalogos necesarios para agendar desde el frontend, filtrados
 * por clinica. Es un helper de apoyo del modulo de citas (el CRUD completo de
 * cada recurso llega en la Entrega 3).
 */
export async function getAppointmentOptions(user: AuthUser) {
  const clinicaId = requireClinica(user);

  const [medicos] = await pool.execute<RowDataPacket[]>(
    `SELECT m.id, m.nombres, m.apellidos,
            GROUP_CONCAT(DISTINCT ms.servicio_id) AS servicio_ids
       FROM medicos m
       LEFT JOIN medico_servicios ms ON ms.medico_id = m.id
      WHERE m.clinica_id = ? AND m.activo = 1
      GROUP BY m.id, m.nombres, m.apellidos
      ORDER BY m.apellidos, m.nombres`,
    [clinicaId]
  );

  const [servicios] = await pool.execute<RowDataPacket[]>(
    `SELECT s.id, s.nombre, s.duracion_minutos, s.precio, s.especialidad_id,
            GROUP_CONCAT(DISTINCT ss.sede_id) AS sede_ids
       FROM servicios s
       LEFT JOIN servicio_sedes ss ON ss.servicio_id = s.id
      WHERE s.clinica_id = ? AND s.activo = 1
      GROUP BY s.id, s.nombre, s.duracion_minutos, s.precio, s.especialidad_id
      ORDER BY s.nombre`,
    [clinicaId]
  );

  const [sedes] = await pool.execute<RowDataPacket[]>(
    "SELECT id, nombre FROM sedes WHERE clinica_id = ? AND activo = 1 ORDER BY nombre",
    [clinicaId]
  );

  // El paciente solo se ve a si mismo; el staff ve la lista completa.
  let pacientes: RowDataPacket[];
  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nombres, apellidos, numero_documento FROM pacientes WHERE id = ?",
      [pacienteId]
    );
    pacientes = rows;
  } else {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, nombres, apellidos, numero_documento
         FROM pacientes WHERE clinica_id = ? AND activo = 1
        ORDER BY apellidos, nombres LIMIT 500`,
      [clinicaId]
    );
    pacientes = rows;
  }

  // Normalizamos los GROUP_CONCAT a arrays de numeros.
  const toIds = (v: unknown): number[] =>
    v ? String(v).split(",").map((n) => Number(n)) : [];

  return {
    medicos: medicos.map((m) => ({
      id: m.id,
      nombres: m.nombres,
      apellidos: m.apellidos,
      servicio_ids: toIds(m.servicio_ids),
    })),
    servicios: servicios.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      duracion_minutos: s.duracion_minutos,
      precio: s.precio,
      especialidad_id: s.especialidad_id,
      sede_ids: toIds(s.sede_ids),
    })),
    sedes,
    pacientes,
  };
}
