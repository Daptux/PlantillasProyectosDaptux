import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Contrasena requerida"),
});

export const registerPatientSchema = z.object({
  nombres: z.string().min(2, "Nombres requeridos"),
  apellidos: z.string().min(2, "Apellidos requeridos"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  telefono: z.string().max(50).optional(),
  tipo_documento: z.string().max(20).default("CC"),
  numero_documento: z.string().min(3, "Numero de documento requerido"),
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida (YYYY-MM-DD)")
    .optional(),
  sexo: z.enum(["M", "F", "OTRO"]).optional(),
  // Clinica a la que se registra el paciente (por defecto la 1 en demo).
  clinica_id: z.number().int().positive().default(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;
