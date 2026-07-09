import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Promocion } from "@/types/database";

export function PromoCard({ promo }: { promo: Promocion }) {
  const descuento =
    promo.precio_anterior && promo.precio_anterior > 0
      ? Math.round(((promo.precio_anterior - promo.precio_promocional) / promo.precio_anterior) * 100)
      : null;

  return (
    <div className="group overflow-hidden rounded-xl border border-brand/20 bg-card">
      <div className="relative aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={promo.imagen_url ?? "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80"}
          alt={promo.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {descuento && (
          <span className="absolute right-3 top-3 rounded-full bg-brand px-3 py-1 text-sm font-bold text-brand-foreground">
            -{descuento}%
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-brand">
          <Tag className="h-3.5 w-3.5" /> Promoción
        </div>
        <h3 className="mt-1.5 font-display text-lg font-semibold">{promo.nombre}</h3>
        {promo.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{promo.descripcion}</p>
        )}
        <div className="mt-3 flex items-end gap-2">
          <span className="font-display text-2xl font-bold text-brand">{formatCurrency(promo.precio_promocional)}</span>
          {promo.precio_anterior && (
            <span className="mb-1 text-sm text-muted-foreground line-through">
              {formatCurrency(promo.precio_anterior)}
            </span>
          )}
        </div>
        {promo.fecha_fin && (
          <p className="mt-1 text-xs text-muted-foreground">Válido hasta {formatDate(promo.fecha_fin)}</p>
        )}
        <Button asChild variant="brand" size="sm" className="mt-4 w-full">
          <Link href="/reservar">
            Aprovechar <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
