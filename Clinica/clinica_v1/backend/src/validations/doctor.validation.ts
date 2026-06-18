import { z } from "zod";

/** Validaciones del modulo de MEDICOS y sus sub-recursos. */
export const createDoctorSchema = z.object({
  numero_documento: z.string().min(3, "Documento requerido").max(40),
  nombres: z.string().min(2, "Nombres requeridos").max(120),
  apellidos: z.string().min(2, "Apellidos requeridos").max(120),
  registro_medico: z.string().max(80).optional(),
  telefono: z.string().max(50).optional(),
  email: z.string().email("Email invalido").max(150).optional().or(z.literal("")),
  foto_url: z.string().max(500).optional(),
  biografia: z.string().max(4000).optional(),
  activo: z.boolean().optional(),
  // Relaciones N:M.
  especialidad_ids: z.array(z.number().int().positive()).optional(),
  servicio_ids: z.array(z.number().int().positive()).optional(),
});

export const updateDoctorSchema = createDoctorSchema.partial();

const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/;

/** Horario semanal recurrente del medico. */
export const createHorarioSchema = z
  .object({
    sede_id: z.number().int().positive().optional().nullable(),
    dia_semana: z.number().int().min(0).max(6),
    hora_inicio: z.string().regex(timeRegex, "Hora invalida (HH:mm)"),
    hora_fin: z.string().regex(timeRegex, "Hora invalida (HH:mm)"),
    activo: z.boolean().optional(),
  })
  .refine((d) => d.hora_inicio < d.hora_fin, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["hora_fin"],
  });

/** Bloqueo puntual de agenda (ausencia/vacaciones). */
export const createBloqueoSchema = z
  .object({
    fecha_inicio: z.string().regex(dateTimeRegex, "Fecha/hora invalida"),
    fecha_fin: z.string().regex(dateTimeRegex, "Fecha/hora invalida"),
    motivo: z.string().max(255).optional(),
  })
  .refine((d) => d.fecha_inicio < d.fecha_fin, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["fecha_fin"],
  });

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type CreateHorarioInput = z.infer<typeof createHorarioSchema>;
export type CreateBloqueoInput = z.infer<typeof createBloqueoSchema>;
