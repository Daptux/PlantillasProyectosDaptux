import type { TipoDocumento } from "@/types";

export const TIPO_DOC_LABEL: Record<TipoDocumento, string> = {
  ORDEN_MEDICA: "Orden medica",
  AUTORIZACION: "Autorizacion",
  EXAMEN_PREVIO: "Examen previo",
  HISTORIA_CLINICA: "Historia clinica",
  OTRO: "Otro",
};

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  "ORDEN_MEDICA",
  "AUTORIZACION",
  "EXAMEN_PREVIO",
  "HISTORIA_CLINICA",
  "OTRO",
];

/** Tamaño legible (KB/MB). */
export function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
