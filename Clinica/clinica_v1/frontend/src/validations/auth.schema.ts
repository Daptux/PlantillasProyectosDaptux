import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Ingresa tu contrasena"),
});

export const registerSchema = z.object({
  nombres: z.string().min(2, "Nombres requeridos"),
  apellidos: z.string().min(2, "Apellidos requeridos"),
  numero_documento: z.string().min(3, "Documento requerido"),
  email: z.string().email("Email invalido"),
  telefono: z.string().optional(),
  password: z.string().min(6, "Minimo 6 caracteres"),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
