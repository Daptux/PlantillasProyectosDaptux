import { z } from "zod";

/** Validaciones del modulo de CLINICAS. */
export const createClinicSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(150),
  nit: z.string().max(50).optional(),
  telefono: z.string().max(50).optional(),
  email: z.string().email("Email invalido").max(150).optional().or(z.literal("")),
  direccion: z.string().max(255).optional(),
  logo_url: z.string().max(500).optional(),
  activo: z.boolean().optional(),
});

export const updateClinicSchema = createClinicSchema.partial();

export type CreateClinicInput = z.infer<typeof createClinicSchema>;
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;
