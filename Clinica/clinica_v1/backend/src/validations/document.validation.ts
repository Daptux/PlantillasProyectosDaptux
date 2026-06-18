import { z } from "zod";

/**
 * Validaciones de DOCUMENTOS y RESULTADOS.
 * Los campos llegan como multipart/form-data (texto), por eso se usa z.coerce.
 */

export const TIPOS_DOCUMENTO = [
  "ORDEN_MEDICA",
  "AUTORIZACION",
  "EXAMEN_PREVIO",
  "HISTORIA_CLINICA",
  "OTRO",
] as const;

/** POST /api/documents/upload */
export const uploadDocumentSchema = z.object({
  // Para rol PACIENTE el service lo fuerza a su propia ficha (opcional aqui).
  paciente_id: z.coerce.number().int().positive().optional(),
  cita_id: z.coerce.number().int().positive().optional(),
  tipo: z.enum(TIPOS_DOCUMENTO).default("OTRO"),
});

/** POST /api/results/upload */
export const uploadResultSchema = z.object({
  paciente_id: z.coerce.number().int().positive(),
  cita_id: z.coerce.number().int().positive().optional(),
  servicio_id: z.coerce.number().int().positive().optional(),
  titulo: z.string().min(2, "Titulo requerido").max(200),
  descripcion: z.string().max(2000).optional(),
  fecha_resultado: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida (YYYY-MM-DD)")
    .optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UploadResultInput = z.infer<typeof uploadResultSchema>;
