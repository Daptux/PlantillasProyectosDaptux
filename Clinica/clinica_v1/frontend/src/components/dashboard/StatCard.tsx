import type { ElementType } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  label: string;
  value: string | number;
  icon: ElementType;
  /** Clases de color para el icono (texto + fondo). */
  color?: string;
  loading?: boolean;
  /** Si se pasa, la tarjeta se vuelve un enlace a esa ruta. */
  to?: string;
  /** Texto auxiliar bajo el valor (ej. "este mes"). */
  hint?: string;
}

/** Tarjeta de metrica para los dashboards. Clicable si recibe `to`. */
export default function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-primary bg-primary/10",
  loading,
  to,
  hint,
}: Props) {
  const inner = (
    <Card className={to ? "h-full transition-all hover:-translate-y-0.5 hover:shadow-md" : "h-full"}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-2xl font-bold">{loading ? "…" : value}</div>
          <div className="truncate text-sm text-muted-foreground">{label}</div>
          {hint && <div className="text-xs text-muted-foreground/70">{hint}</div>}
        </div>
        {to && <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/50" />}
      </CardContent>
    </Card>
  );

  return to ? (
    <Link to={to} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
