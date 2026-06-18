import type { EstadoPago, MetodoPago } from "@/types";
import type { BadgeProps } from "@/components/ui/badge";

export const ESTADO_PAGO_LABEL: Record<EstadoPago, string> = {
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
  ANULADO: "Anulado",
  REEMBOLSADO: "Reembolsado",
};

export const ESTADO_PAGO_VARIANT: Record<EstadoPago, BadgeProps["variant"]> = {
  PENDIENTE: "warning",
  PAGADO: "success",
  ANULADO: "destructive",
  REEMBOLSADO: "secondary",
};

export const ESTADOS_PAGO: EstadoPago[] = ["PENDIENTE", "PAGADO", "ANULADO", "REEMBOLSADO"];

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
  PSE: "PSE",
  OTRO: "Otro",
};

export const METODOS_PAGO: MetodoPago[] = ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "PSE", "OTRO"];

/** Formatea un monto (string del backend) como moneda colombiana. */
export function formatCOP(value: string | number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
