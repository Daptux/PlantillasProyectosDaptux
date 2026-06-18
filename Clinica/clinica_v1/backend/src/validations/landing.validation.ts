import { z } from "zod";

/** Validaciones del contenido editable de la LANDING. */
export const updateLandingSchema = z.object({
  secciones: z
    .array(
      z.object({
        seccion: z.string().min(1, "Seccion requerida").max(60),
        // Bloque JSON libre (hero, contacto, etc.).
        contenido: z.record(z.any()),
        orden: z.number().int().optional(),
      })
    )
    .min(1, "Envia al menos una seccion"),
});

export type UpdateLandingInput = z.infer<typeof updateLandingSchema>;
