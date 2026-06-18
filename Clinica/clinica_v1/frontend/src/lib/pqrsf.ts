import type { TipoPqrsf, EstadoPqrsf } from "@/types";
import type { BadgeProps } from "@/components/ui/badge";

export const TIPO_PQRSF_LABEL: Record<TipoPqrsf, string> = {
  PETICION: "Peticion",
  QUEJA: "Queja",
  RECLAMO: "Reclamo",
  SUGERENCIA: "Sugerencia",
  FELICITACION: "Felicitacion",
};

export const TIPOS_PQRSF: TipoPqrsf[] = [
  "PETICION",
  "QUEJA",
  "RECLAMO",
  "SUGERENCIA",
  "FELICITACION",
];

export const ESTADO_PQRSF_LABEL: Record<EstadoPqrsf, string> = {
  ABIERTA: "Abierta",
  EN_PROCESO: "En proceso",
  RESPONDIDA: "Respondida",
  CERRADA: "Cerrada",
};

export const ESTADO_PQRSF_VARIANT: Record<EstadoPqrsf, BadgeProps["variant"]> = {
  ABIERTA: "warning",
  EN_PROCESO: "secondary",
  RESPONDIDA: "success",
  CERRADA: "outline",
};

export const ESTADOS_PQRSF: EstadoPqrsf[] = ["ABIERTA", "EN_PROCESO", "RESPONDIDA", "CERRADA"];
