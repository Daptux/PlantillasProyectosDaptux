import { z } from "zod";

/* ---------- Auth ---------- */

export const loginSchema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
});

/* ---------- Clientes ---------- */

export const clientSchema = z.object({
  name: z.string().min(2, "Nombre comercial requerido"),
  businessName: z.string().optional().nullable(),
  documentType: z.string().default("NIT"),
  documentNumber: z.string().min(3, "Documento requerido"),
  personType: z.enum(["natural", "juridica"]).default("juridica"),
  taxRegime: z.string().optional().nullable(),
  isVatResponsible: z.boolean().default(false),
  economicActivity: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Correo invalido").optional().or(z.literal("")),
  legalRepresentative: z.string().optional().nullable(),
  assignedUserId: z.string().uuid().optional().nullable(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export const clientContactSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  role: z.string().optional().nullable(),
  email: z.string().email("Correo invalido").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
});

/* ---------- Usuarios ---------- */

export const userSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres").optional(),
  role: z.enum(["contador", "auxiliar", "revisor"]).default("auxiliar"),
  phone: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

/* ---------- Documentos ---------- */

export const documentSchema = z.object({
  clientId: z.string().uuid(),
  documentTypeId: z.string().uuid().optional().nullable(),
  month: z.number().int().min(1).max(12).optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const documentReviewSchema = z.object({
  status: z.enum([
    "aprobado",
    "rechazado",
    "falta_soporte",
    "falta_informacion",
    "procesado",
    "archivado",
  ]),
  notes: z.string().optional().nullable(),
});

/* ---------- Solicitudes ---------- */

export const requestSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(2, "Titulo requerido"),
  description: z.string().optional().nullable(),
  documentTypeId: z.string().uuid().optional().nullable(),
  month: z.number().int().min(1).max(12).optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  assignedUserId: z.string().uuid().optional().nullable(),
});

/* ---------- Tareas ---------- */

export const taskSchema = z.object({
  clientId: z.string().uuid().optional().nullable(),
  title: z.string().min(2, "Titulo requerido"),
  description: z.string().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
  priority: z.enum(["baja", "media", "alta", "urgente"]).default("media"),
  status: z
    .enum(["pendiente", "en_proceso", "completada", "vencida", "cancelada"])
    .default("pendiente"),
  taskType: z.string().default("otra"),
  dueDate: z.string().optional().nullable(),
});

/* ---------- Obligaciones del cliente ---------- */

export const clientObligationSchema = z.object({
  clientId: z.string().uuid(),
  obligationId: z.string().uuid(),
  periodicity: z
    .enum([
      "mensual",
      "bimestral",
      "trimestral",
      "cuatrimestral",
      "anual",
      "personalizada",
    ])
    .default("mensual"),
  dueDay: z.number().int().min(1).max(31).optional().nullable(),
  responsibleUserId: z.string().uuid().optional().nullable(),
  active: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

/* ---------- Vencimientos ---------- */

export const deadlineSchema = z.object({
  clientId: z.string().uuid().optional().nullable(),
  title: z.string().min(2, "Titulo requerido"),
  description: z.string().optional().nullable(),
  type: z
    .enum(["obligacion", "tarea", "solicitud", "cierre_mensual", "reporte", "otro"])
    .default("otro"),
  dueDate: z.string(),
  priority: z.enum(["baja", "media", "alta", "urgente"]).default("media"),
  assignedTo: z.string().uuid().optional().nullable(),
});

/* ---------- Carga publica ---------- */

export const publicUploadSchema = z.object({
  documentTypeId: z.string().uuid().optional().nullable(),
  month: z.coerce.number().int().min(1).max(12).optional().nullable(),
  year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  comment: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type RequestInput = z.infer<typeof requestSchema>;
export type DeadlineInput = z.infer<typeof deadlineSchema>;
