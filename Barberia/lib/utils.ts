import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un valor numerico como moneda colombiana (COP). */
export function formatCurrency(value: number | null | undefined, currency = "COP") {
  const n = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Formatea una fecha ISO a formato legible en español. */
export function formatDate(
  date: string | Date | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }
) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", opts).format(d);
}

/** Formatea hora (HH:mm). */
export function formatTime(date: string | Date | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit" }).format(d);
}

/** Fecha + hora combinadas. */
export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return "—";
  return `${formatDate(date)} · ${formatTime(date)}`;
}

/** Genera un slug url-friendly. */
export function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Iniciales para avatares. */
export function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Construye una URL de WhatsApp con mensaje prellenado. */
export function whatsappUrl(phone: string | null | undefined, message?: string | null) {
  const clean = (phone || "").replace(/[^\d]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${clean}${text}`;
}

/** Convierte un color hex (#rrggbb) a "h s% l%" para variables CSS de shadcn. */
export function hexToHsl(hex: string): string | null {
  const m = hex.replace("#", "");
  if (m.length !== 6) return null;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Trunca texto a n caracteres. */
export function truncate(text: string | null | undefined, n = 80) {
  if (!text) return "";
  return text.length > n ? `${text.slice(0, n)}…` : text;
}
