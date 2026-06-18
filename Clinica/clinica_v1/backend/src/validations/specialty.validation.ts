import { z } from "zod";

/** Validaciones del modulo de ESPECIALIDADES. */
export const createSpecialtySchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(120),
  descripcion: z.string().max(2000).optional(),
  icono: z.string().max(80).optional(),
  activo: z.boolean().optional(),
});

export const updateSpecialtySchema = createSpecialtySchema.partial();

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>;
export type UpdateSpecialtyInput = z.infer<typeof updateSpecialtySchema>;
