import { z } from "zod";

/** Validaciones del modulo PQRSF. */
export const TIPOS_PQRSF = ["PETICION", "QUEJA", "RECLAMO", "SUGERENCIA", "FELICITACION"] as const;
export const ESTADOS_PQRSF = ["ABIERTA", "EN_PROCESO", "RESPONDIDA", "CERRADA"] as const;

/** POST /api/pqrsf  (publico o paciente) */
export const createPqrsfSchema = z.object({
  tipo: z.enum(TIPOS_PQRSF).default("PETICION"),
  asunto: z.string().min(3, "Asunto requerido").max(200),
  mensaje: z.string().min(5, "El mensaje es muy corto").max(5000),
  nombre_remitente: z.string().max(150).optional(),
  email_remitente: z.string().email("Email invalido").max(150).optional().or(z.literal("")),
  telefono_remitente: z.string().max(50).optional(),
  // Clinica destino (por defecto la 1 en demo). Se ignora si el usuario esta logueado.
  clinica_id: z.number().int().positive().default(1),
});

/** PUT /api/pqrsf/:id/respond */
export const respondPqrsfSchema = z.object({
  respuesta: z.string().min(2, "La respuesta es requerida").max(5000),
  estado: z.enum(["EN_PROCESO", "RESPONDIDA", "CERRADA"]).default("RESPONDIDA"),
});

/** PUT /api/pqrsf/:id/status */
export const updatePqrsfStatusSchema = z.object({
  estado: z.enum(ESTADOS_PQRSF),
});

/** GET /api/pqrsf (filtros) */
export const listPqrsfQuerySchema = z.object({
  estado: z.enum(ESTADOS_PQRSF).optional(),
  tipo: z.enum(TIPOS_PQRSF).optional(),
});

export type CreatePqrsfInput = z.infer<typeof createPqrsfSchema>;
export type RespondPqrsfInput = z.infer<typeof respondPqrsfSchema>;
export type UpdatePqrsfStatusInput = z.infer<typeof updatePqrsfStatusSchema>;
export type ListPqrsfQuery = z.infer<typeof listPqrsfQuerySchema>;
