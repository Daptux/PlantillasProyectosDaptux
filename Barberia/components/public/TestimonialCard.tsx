import { Star, Quote } from "lucide-react";
import { initials } from "@/lib/utils";
import type { Testimonio } from "@/types/database";

export function TestimonialCard({ testimonio }: { testimonio: Testimonio }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-card p-6">
      <Quote className="h-8 w-8 text-brand/40" />
      <p className="mt-3 flex-1 text-sm text-muted-foreground">"{testimonio.comentario}"</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
          {testimonio.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={testimonio.foto_url} alt={testimonio.nombre_cliente} className="h-full w-full rounded-full object-cover" />
          ) : (
            initials(testimonio.nombre_cliente)
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{testimonio.nombre_cliente}</p>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < testimonio.calificacion ? "fill-brand text-brand" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
