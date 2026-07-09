import { ESTADOS_RESERVA } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { EstadoReserva } from "@/types/database";

export function StatusBadge({ estado }: { estado: EstadoReserva }) {
  const meta = ESTADOS_RESERVA[estado];
  if (!meta) return <span>{estado}</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", meta.badge)}>
      {meta.label}
    </span>
  );
}
