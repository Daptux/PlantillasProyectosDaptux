import Link from "next/link";
import { Star, Instagram, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Barbero } from "@/types/database";

export function BarberCard({ barbero }: { barbero: Barbero }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-card">
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={barbero.foto_url ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"}
          alt={barbero.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1 text-brand">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-medium text-white">{barbero.valoracion?.toFixed(1) ?? "5.0"}</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-white">{barbero.nombre}</h3>
          {barbero.especialidad && (
            <p className="text-sm text-white/70">{barbero.especialidad}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 p-4">
        <Button asChild variant="brand" size="sm" className="flex-1">
          <Link href={`/reservar?barbero=${barbero.id}`}>
            <CalendarPlus className="h-4 w-4" /> Reservar
          </Link>
        </Button>
        {barbero.instagram && (
          <Button asChild variant="outline" size="icon">
            <a href={barbero.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
