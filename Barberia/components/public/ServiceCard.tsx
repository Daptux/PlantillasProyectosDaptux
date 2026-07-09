import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Servicio } from "@/types/database";

export function ServiceCard({ servicio }: { servicio: Servicio }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-white/10 bg-card transition-all hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={servicio.imagen_url ?? "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"}
          alt={servicio.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {servicio.destacado && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground">
            Destacado
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">{servicio.nombre}</h3>
          <span className="whitespace-nowrap font-display text-lg font-bold text-brand">
            {formatCurrency(servicio.precio)}
          </span>
        </div>
        {servicio.descripcion && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{servicio.descripcion}</p>
        )}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {servicio.duracion_min} min
        </div>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link href={`/reservar?servicio=${servicio.id}`}>
            Reservar <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
