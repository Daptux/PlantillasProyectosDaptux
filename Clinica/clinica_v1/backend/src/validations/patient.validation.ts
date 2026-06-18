import { z } from "zod";

/** Validaciones del modulo de PACIENTES (gestion admin/recepcion). */
export const createPatientSchema = z.object({
  tipo_documento: z.string().max(20).default("CC"),
  numero_documento: z.string().min(3, "Numero de documento requerido").max(40),
  nombres: z.string().min(2, "Nombres requeridos").max(120),
  apellidos: z.string().min(2, "Apellidos requeridos").max(120),
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida (YYYY-MM-DD)")
    .optional(),
  sexo: z.enum(["M", "F", "OTRO"]).optional(),
  telefono: z.string().max(50).optional(),
  email: z.string().email("Email invalido").max(150).optional().or(z.literal("")),
  direccion: z.string().max(255).optional(),
  ciudad: z.string().max(100).optional(),
  eps: z.string().max(120).optional(),
  grupo_sanguineo: z.string().max(5).optional(),
  activo: z.boolean().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const listPatientsQuerySchema = z.object({
  search: z.string().max(120).optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;
