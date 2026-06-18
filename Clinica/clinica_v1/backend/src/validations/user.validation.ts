import { z } from "zod";

/** Validaciones del modulo de USUARIOS. */
export const createUserSchema = z.object({
  nombres: z.string().min(2, "Nombres requeridos").max(120),
  apellidos: z.string().min(2, "Apellidos requeridos").max(120),
  email: z.string().email("Email invalido").max(150),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  telefono: z.string().max(50).optional(),
  rol_id: z.number().int().positive("Rol requerido"),
  // Solo SUPER_ADMIN puede especificar clinica distinta; el service lo controla.
  clinica_id: z.number().int().positive().optional(),
  activo: z.boolean().optional(),
});

/** En update la contrasena es opcional (solo se cambia si se envia). */
export const updateUserSchema = z.object({
  nombres: z.string().min(2).max(120).optional(),
  apellidos: z.string().min(2).max(120).optional(),
  email: z.string().email("Email invalido").max(150).optional(),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres").optional(),
  telefono: z.string().max(50).optional(),
  rol_id: z.number().int().positive().optional(),
  activo: z.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  search: z.string().max(120).optional(),
  rol_id: z.coerce.number().int().positive().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
