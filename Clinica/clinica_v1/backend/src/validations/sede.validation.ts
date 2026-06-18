import { z } from "zod";

/** Validaciones del modulo de SEDES. */
export const createSedeSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(150),
  direccion: z.string().max(255).optional(),
  ciudad: z.string().max(100).optional(),
  telefono: z.string().max(50).optional(),
  email: z.string().email("Email invalido").max(150).optional().or(z.literal("")),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  activo: z.boolean().optional(),
});

export const updateSedeSchema = createSedeSchema.partial();

export type CreateSedeInput = z.infer<typeof createSedeSchema>;
export type UpdateSedeInput = z.infer<typeof updateSedeSchema>;
