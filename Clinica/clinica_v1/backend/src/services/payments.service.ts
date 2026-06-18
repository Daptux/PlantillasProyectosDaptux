import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middlewares/error.middleware";
import { ROLES } from "../middlewares/role.middleware";
import {
  CreatePaymentInput,
  UpdatePaymentStatusInput,
  PayPaymentInput,
  ListPaymentsQuery,
} from "../validations/payment.validation";

interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

function requireClinica(user: AuthUser): number {
  if (!user.clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
  return user.clinicaId;
}

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

interface PagoRow extends RowDataPacket {
  id: number;
  paciente_id: number;
  estado: string;
}

const SELECT_PAGO = `
  SELECT p.*,
         pa.nombres AS paciente_nombres, pa.apellidos AS paciente_apellidos,
         pa.numero_documento AS paciente_documento
    FROM pagos p
    JOIN pacientes pa ON pa.id = p.paciente_id`;

/**
 * Lista pagos:
 *  - PACIENTE: solo los suyos.
 *  - ADMIN/FACTURACION: todos los de la clinica (con filtros).
 */
export async function listPayments(query: ListPaymentsQuery, user: AuthUser) {
  const clinicaId = requireClinica(user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [clinicaId];
  const where: string[] = ["p.clinica_id = ?"];

  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    where.push("p.paciente_id = ?");
    params.push(pacienteId);
  } else if (query.paciente_id) {
    where.push("p.paciente_id = ?");
    params.push(query.paciente_id);
  }
  if (query.estado) {
    where.push("p.estado = ?");
    params.push(query.estado);
  }

  const [rows] = await pool.execute<PagoRow[]>(
    `${SELECT_PAGO} WHERE ${where.join(" AND ")} ORDER BY p.created_at DESC`,
    params
  );
  return rows;
}

/** Devuelve un pago por id (paciente solo el suyo). */
export async function getPayment(id: number, user: AuthUser): Promise<PagoRow> {
  const clinicaId = requireClinica(user);
  const [rows] = await pool.execute<PagoRow[]>(
    `${SELECT_PAGO} WHERE p.id = ? AND p.clinica_id = ? LIMIT 1`,
    [id, clinicaId]
  );
  const pago = rows[0];
  if (!pago) throw new AppError("Pago no encontrado", 404);

  if (user.rol === ROLES.PACIENTE) {
    const pacienteId = await pacienteIdDeUsuario(user.id, clinicaId);
    if (pago.paciente_id !== pacienteId) throw new AppError("Pago no encontrado", 404);
  }
  return pago;
}

/** Crea un pago/factura (admin/facturacion). */
export async function createPayment(input: CreatePaymentInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await assertPacienteEnClinica(input.paciente_id, clinicaId);

  const estado = input.estado ?? "PENDIENTE";
  // Si se crea ya PAGADO, registra la fecha de pago.
  const fechaPago = estado === "PAGADO" ? new Date() : null;

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO pagos
      (clinica_id, paciente_id, cita_id, numero_factura, concepto, monto, metodo, estado, fecha_pago, registrado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clinicaId,
      input.paciente_id,
      input.cita_id ?? null,
      input.numero_factura ?? null,
      input.concepto ?? null,
      input.monto,
      input.metodo ?? "OTRO",
      estado,
      fechaPago,
      user.id,
    ]
  );
  return getPayment(result.insertId, user);
}

/** Cambia el estado de un pago (admin/facturacion). */
export async function updatePaymentStatus(id: number, input: UpdatePaymentStatusInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  await getPayment(id, user);

  // Al marcar PAGADO sin fecha explicita, se usa la fecha actual.
  const fechaPago =
    input.estado === "PAGADO"
      ? (input.fecha_pago ? input.fecha_pago.replace("T", " ") : new Date())
      : null;

  const fields = ["estado = ?", "fecha_pago = ?"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [input.estado, fechaPago];
  if (input.metodo) {
    fields.push("metodo = ?");
    params.push(input.metodo);
  }
  params.push(id, clinicaId);

  await pool.execute(`UPDATE pagos SET ${fields.join(", ")} WHERE id = ? AND clinica_id = ?`, params);
  return getPayment(id, user);
}

/** El paciente paga su propia factura pendiente (pago simulado). */
export async function payPayment(id: number, input: PayPaymentInput, user: AuthUser) {
  const clinicaId = requireClinica(user);
  const pago = await getPayment(id, user); // valida propiedad si es paciente

  if (pago.estado !== "PENDIENTE") {
    throw new AppError("Solo se pueden pagar facturas pendientes", 409);
  }

  await pool.execute(
    "UPDATE pagos SET estado = 'PAGADO', metodo = ?, fecha_pago = ? WHERE id = ? AND clinica_id = ?",
    [input.metodo ?? "PSE", new Date(), id, clinicaId]
  );
  return getPayment(id, user);
}
