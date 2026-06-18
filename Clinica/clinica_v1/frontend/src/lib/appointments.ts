import type { EstadoCita } from "@/types";
import type { BadgeProps } from "@/components/ui/badge";

/** Etiqueta legible para cada estado de cita. */
export const ESTADO_LABEL: Record<EstadoCita, string> = {
  SOLICITADA: "Solicitada",
  PENDIENTE_DOCUMENTOS: "Pendiente docs.",
  CONFIRMADA: "Confirmada",
  EN_ESPERA: "En espera",
  EN_ATENCION: "En atencion",
  ATENDIDA: "Atendida",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistio",
};

/** Variante de Badge para cada estado. */
export const ESTADO_VARIANT: Record<EstadoCita, BadgeProps["variant"]> = {
  SOLICITADA: "warning",
  PENDIENTE_DOCUMENTOS: "warning",
  CONFIRMADA: "default",
  EN_ESPERA: "secondary",
  EN_ATENCION: "secondary",
  ATENDIDA: "success",
  CANCELADA: "destructive",
  NO_ASISTIO: "destructive",
};

/** Orden de transiciones tipico para el cambio manual de estado. */
export const ESTADOS_CITA: EstadoCita[] = [
  "SOLICITADA",
  "PENDIENTE_DOCUMENTOS",
  "CONFIRMADA",
  "EN_ESPERA",
  "EN_ATENCION",
  "ATENDIDA",
  "CANCELADA",
  "NO_ASISTIO",
];

// ---------------------------------------------------------------------------
//  Utilidades de fecha/hora (sin librerias externas)
// ---------------------------------------------------------------------------

const DIAS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** 'YYYY-MM-DD' local de un Date. */
export function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'HH:mm' local de un Date. */
export function toTimeInput(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parsea 'YYYY-MM-DD HH:mm:ss' (formato del backend) a Date local. */
export function parseApiDate(value: string): Date {
  return new Date(value.replace(" ", "T"));
}

/** 'HH:mm' a partir del string del backend. */
export function formatHora(value: string): string {
  return toTimeInput(parseApiDate(value));
}

/** Ej: 'lun 22 jun, 09:00'. */
export function formatFechaHora(value: string): string {
  const d = parseApiDate(value);
  return `${DIAS[d.getDay()].toLowerCase()} ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}, ${toTimeInput(d)}`;
}

/** Ej: 'junio 2026'. */
export function formatMesAnio(d: Date): string {
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** Etiqueta corta de dia para cabeceras. Ej: 'Lun 22'. */
export function formatDiaCorto(d: Date): string {
  return `${DIAS[d.getDay()]} ${d.getDate()}`;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Lunes de la semana que contiene a `d`. */
export function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay(); // 0=Dom
  const diff = day === 0 ? -6 : 1 - day; // lunes como inicio
  r.setDate(r.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Las 6 semanas (42 dias) que cubren el mes de `d`, empezando en lunes. */
export function monthGridDays(d: Date): Date[] {
  const first = startOfMonth(d);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
