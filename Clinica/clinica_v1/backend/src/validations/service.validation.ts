import { z } from "zod";

/** Validaciones del modulo de SERVICIOS. */
export const createServiceSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(150),
  especialidad_id: z.number().int().positive().optional().nullable(),
  descripcion: z.string().max(2000).optional(),
  duracion_minutos: z.number().int().min(5, "Minimo 5 minutos").max(480).default(30),
  precio: z.number().min(0).default(0),
  requiere_orden: z.boolean().optional(),
  activo: z.boolean().optional(),
  // Sedes donde se presta el servicio (N:M).
  sede_ids: z.array(z.number().int().positive()).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
