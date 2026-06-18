import { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { ROLES } from "../middlewares/role.middleware";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

/** Ejecuta un COUNT/SUM y devuelve el primer valor numerico. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function scalar(sql: string, params: any[]): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  const val = Object.values(rows[0] ?? { v: 0 })[0];
  return Number(val ?? 0);
}

async function pacienteIdDeUsuario(usuarioId: number, clinicaId: number): Promise<number | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM pacientes WHERE usuario_id = ? AND clinica_id = ? LIMIT 1",
    [usuarioId, clinicaId]
  );
  return rows[0] ? (rows[0] as { id: number }).id : null;
}

async function medicoIdDeUsuario(usuarioId: number, clinicaId: number): Promise<number | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM medicos WHERE usuario_id = ? AND clinica_id = ? LIMIT 1",
    [usuarioId, clinicaId]
  );
  return rows[0] ? (rows[0] as { id: number }).id : null;
}

const HOY = "fecha_inicio >= CURDATE() AND fecha_inicio < CURDATE() + INTERVAL 1 DAY";
const ACTIVAS = "estado NOT IN ('CANCELADA','NO_ASISTIO')";

/**
 * Metricas del dashboard segun el rol del usuario.
 * Devuelve un objeto con todas las claves (0 cuando no aplica al rol).
 */
export async function getSummary(user: AuthUser) {
  const clinicaId = requireClinica(user);
  const rol = user.rol;

  const summary = {
    rol,
    citasHoy: 0,
    citasProximas: 0,
    pacientes: 0,
    medicos: 0,
    pagosMes: 0,
    pagosPendientes: 0,
    pqrsfAbiertas: 0,
    misResultados: 0,
    misDocumentos: 0,
    misPagosPendientes: 0,
  };

  // --- Paciente: metricas propias ---
  if (rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    if (pacienteId) {
      summary.citasProximas = await scalar(
        `SELECT COUNT(*) v FROM citas WHERE clinica_id=? AND paciente_id=? AND fecha_inicio >= NOW() AND ${ACTIVAS}`,
        [clinicaId, pacienteId]
      );
      summary.misResultados = await scalar(
        "SELECT COUNT(*) v FROM resultados_medicos WHERE clinica_id=? AND paciente_id=?",
        [clinicaId, pacienteId]
      );
      summary.misDocumentos = await scalar(
        "SELECT COUNT(*) v FROM documentos_paciente WHERE clinica_id=? AND paciente_id=?",
        [clinicaId, pacienteId]
      );
      summary.misPagosPendientes = await scalar(
        "SELECT COUNT(*) v FROM pagos WHERE clinica_id=? AND paciente_id=? AND estado='PENDIENTE'",
        [clinicaId, pacienteId]
      );
    }
    return summary;
  }

  // --- Medico: su agenda ---
  if (rol === ROLES.MEDICO) {
    const medicoId = await medicoIdDeUsuario(user.id, clinicaId);
    if (medicoId) {
      summary.citasHoy = await scalar(
        `SELECT COUNT(*) v FROM citas WHERE clinica_id=? AND medico_id=? AND ${HOY} AND ${ACTIVAS}`,
        [clinicaId, medicoId]
      );
      summary.citasProximas = await scalar(
        `SELECT COUNT(*) v FROM citas WHERE clinica_id=? AND medico_id=? AND fecha_inicio >= NOW() AND ${ACTIVAS}`,
        [clinicaId, medicoId]
      );
      summary.pacientes = await scalar(
        "SELECT COUNT(DISTINCT paciente_id) v FROM citas WHERE clinica_id=? AND medico_id=?",
        [clinicaId, medicoId]
      );
    }
    return summary;
  }

  // --- Staff administrativo (super_admin, admin, recepcion, facturacion, laboratorio) ---
  summary.citasHoy = await scalar(
    `SELECT COUNT(*) v FROM citas WHERE clinica_id=? AND ${HOY} AND ${ACTIVAS}`,
    [clinicaId]
  );
  summary.citasProximas = await scalar(
    `SELECT COUNT(*) v FROM citas WHERE clinica_id=? AND fecha_inicio >= NOW() AND ${ACTIVAS}`,
    [clinicaId]
  );
  summary.pacientes = await scalar(
    "SELECT COUNT(*) v FROM pacientes WHERE clinica_id=? AND activo=1",
    [clinicaId]
  );
  summary.medicos = await scalar(
    "SELECT COUNT(*) v FROM medicos WHERE clinica_id=? AND activo=1",
    [clinicaId]
  );
  summary.pagosMes = await scalar(
    `SELECT COALESCE(SUM(monto),0) v FROM pagos
      WHERE clinica_id=? AND estado='PAGADO' AND fecha_pago >= DATE_FORMAT(CURDATE(),'%Y-%m-01')`,
    [clinicaId]
  );
  summary.pagosPendientes = await scalar(
    "SELECT COUNT(*) v FROM pagos WHERE clinica_id=? AND estado='PENDIENTE'",
    [clinicaId]
  );
  summary.pqrsfAbiertas = await scalar(
    "SELECT COUNT(*) v FROM pqrsf WHERE clinica_id=? AND estado IN ('ABIERTA','EN_PROCESO')",
    [clinicaId]
  );
  return summary;
}
