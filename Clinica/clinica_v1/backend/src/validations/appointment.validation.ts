import { z } from "zod";

/**
 * Validaciones del modulo de CITAS.
 * Formato de fecha/hora aceptado: 'YYYY-MM-DD HH:mm' o 'YYYY-MM-DDTHH:mm'
 * (con segundos opcionales). El service lo convierte a Date para las reglas.
 */

// Acepta "2026-06-20 09:00", "2026-06-20T09:00", con ":ss" opcional.
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/;

// Estados validos de una cita (mismo ENUM que la tabla citas).
export const ESTADOS_CITA = [
  "SOLICITADA",
  "PENDIENTE_DOCUMENTOS",
  "CONFIRMADA",
  "EN_ESPERA",
  "EN_ATENCION",
  "ATENDIDA",
  "CANCELADA",
  "NO_ASISTIO",
] as const;

/** POST /api/appointments — crear cita. */
export const createAppointmentSchema = z.object({
  // paciente_id es obligatorio para el staff; para rol PACIENTE el service
  // lo fuerza a su propia ficha, por eso aqui es opcional.
  paciente_id: z.number().int().positive().optional(),
  medico_id: z.number().int().positive(),
  servicio_id: z.number().int().positive().optional(),
  sede_id: z.number().int().positive().optional(),
  fecha_inicio: z.string().regex(dateTimeRegex, "Fecha/hora invalida (YYYY-MM-DD HH:mm)"),
  motivo: z.string().max(255).optional(),
  notas: z.string().max(2000).optional(),
});

/** PUT /api/appointments/:id/reschedule — reprogramar. */
export const rescheduleSchema = z.object({
  fecha_inicio: z.string().regex(dateTimeRegex, "Fecha/hora invalida (YYYY-MM-DD HH:mm)"),
  // Opcionales: permiten cambiar servicio/sede al reprogramar.
  servicio_id: z.number().int().positive().optional(),
  sede_id: z.number().int().positive().optional(),
});

/** PUT /api/appointments/:id/status — cambiar estado. */
export const updateStatusSchema = z.object({
  estado: z.enum(ESTADOS_CITA),
});

/** GET /api/appointments — filtros de listado (todos opcionales). */
export const listAppointmentsQuerySchema = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida (YYYY-MM-DD)").optional(),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida (YYYY-MM-DD)").optional(),
  medico_id: z.coerce.number().int().positive().optional(),
  paciente_id: z.coerce.number().int().positive().optional(),
  sede_id: z.coerce.number().int().positive().optional(),
  estado: z.enum(ESTADOS_CITA).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
