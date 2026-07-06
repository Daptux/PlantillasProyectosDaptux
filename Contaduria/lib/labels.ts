/**
 * Etiquetas legibles y variantes de badge para los estados del sistema.
 * Client-safe (sin server-only) para usarse en componentes cliente y servidor.
 */

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "muted";

export const DOCUMENT_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: "Pendiente de revisar", variant: "warning" },
  aprobado: { label: "Aprobado", variant: "success" },
  rechazado: { label: "Rechazado", variant: "destructive" },
  falta_soporte: { label: "Falta soporte", variant: "warning" },
  falta_informacion: { label: "Falta informacion", variant: "warning" },
  procesado: { label: "Procesado", variant: "secondary" },
  archivado: { label: "Archivado", variant: "muted" },
};

export const REQUEST_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  borrador: { label: "Borrador", variant: "muted" },
  enviada: { label: "Enviada", variant: "secondary" },
  vista: { label: "Vista por el cliente", variant: "secondary" },
  respondida: { label: "Respondida", variant: "success" },
  parcial: { label: "Parcial", variant: "warning" },
  vencida: { label: "Vencida", variant: "destructive" },
  cerrada: { label: "Cerrada", variant: "muted" },
  cancelada: { label: "Cancelada", variant: "muted" },
};

export const TASK_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: "Pendiente", variant: "warning" },
  en_proceso: { label: "En proceso", variant: "secondary" },
  completada: { label: "Completada", variant: "success" },
  vencida: { label: "Vencida", variant: "destructive" },
  cancelada: { label: "Cancelada", variant: "muted" },
};

export const TASK_PRIORITY: Record<string, { label: string; variant: BadgeVariant }> = {
  baja: { label: "Baja", variant: "muted" },
  media: { label: "Media", variant: "secondary" },
  alta: { label: "Alta", variant: "warning" },
  urgente: { label: "Urgente", variant: "destructive" },
};

export const CLIENT_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Activo", variant: "success" },
  inactive: { label: "Inactivo", variant: "muted" },
  suspended: { label: "Suspendido", variant: "destructive" },
};

export const CHECKLIST_ITEM_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: "Pendiente", variant: "warning" },
  en_proceso: { label: "En proceso", variant: "secondary" },
  completado: { label: "Completado", variant: "success" },
  no_aplica: { label: "No aplica", variant: "muted" },
};

export const DEADLINE_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: "Pendiente", variant: "warning" },
  cumplido: { label: "Cumplido", variant: "success" },
  vencido: { label: "Vencido", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "muted" },
};

export const RISK_LEVEL: Record<string, { label: string; color: string; variant: BadgeVariant }> = {
  verde: { label: "Al dia", color: "bg-success", variant: "success" },
  amarillo: { label: "Atencion", color: "bg-warning", variant: "warning" },
  rojo: { label: "Critico", color: "bg-destructive", variant: "destructive" },
};

export function pick(
  map: Record<string, { label: string; variant: BadgeVariant }>,
  key: string
): { label: string; variant: BadgeVariant } {
  return map[key] ?? { label: key, variant: "muted" };
}
