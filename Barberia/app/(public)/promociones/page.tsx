import { PromoCard } from "@/components/public/PromoCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { getPromociones } from "@/lib/queries";

export const metadata = { title: "Promociones" };

export default async function PromocionesPage() {
  const promos = await getPromociones(true);

  return (
    <div className="py-16 sm:py-20">
      <div className="container">
        <SectionHeading eyebrow="Ofertas" title="Promociones activas"
          subtitle="Aprovecha nuestros combos y descuentos por tiempo limitado." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((p) => <PromoCard key={p.id} promo={p} />)}
        </div>
        {promos.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No hay promociones activas por ahora. ¡Vuelve pronto!</p>
        )}
      </div>
    </div>
  );
}
