import type { ElementType } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  label: string;
  value: string | number;
  icon: ElementType;
  /** Clases de color para el icono (texto + fondo). */
  color?: string;
  loading?: boolean;
}

/** Tarjeta de metrica para los dashboards. */
export default function StatCard({ label, value, icon: Icon, color = "text-primary bg-primary/10", loading }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">{loading ? "…" : value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
