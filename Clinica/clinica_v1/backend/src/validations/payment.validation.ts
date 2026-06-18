import { z } from "zod";

/** Validaciones del modulo de PAGOS. */
export const METODOS_PAGO = ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "PSE", "OTRO"] as const;
export const ESTADOS_PAGO = ["PENDIENTE", "PAGADO", "ANULADO", "REEMBOLSADO"] as const;

const dateTimeRegex = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/;

/** POST /api/payments */
export const createPaymentSchema = z.object({
  paciente_id: z.number().int().positive(),
  cita_id: z.number().int().positive().optional(),
  numero_factura: z.string().max(60).optional(),
  concepto: z.string().max(255).optional(),
  monto: z.number().min(0, "El monto no puede ser negativo"),
  metodo: z.enum(METODOS_PAGO).optional(),
  estado: z.enum(ESTADOS_PAGO).optional(),
});

/** PUT /api/payments/:id/status */
export const updatePaymentStatusSchema = z.object({
  estado: z.enum(ESTADOS_PAGO),
  metodo: z.enum(METODOS_PAGO).optional(),
  fecha_pago: z.string().regex(dateTimeRegex, "Fecha invalida").optional(),
});

/** POST /api/payments/:id/pay  (paciente paga su factura) */
export const payPaymentSchema = z.object({
  metodo: z.enum(METODOS_PAGO).optional(),
});

/** GET /api/payments (filtros) */
export const listPaymentsQuerySchema = z.object({
  estado: z.enum(ESTADOS_PAGO).optional(),
  paciente_id: z.coerce.number().int().positive().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type PayPaymentInput = z.infer<typeof payPaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
