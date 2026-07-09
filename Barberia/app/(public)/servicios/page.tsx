import { ServiceCard } from "@/components/public/ServiceCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { getServicios, getCategoriasServicios } from "@/lib/queries";

export const metadata = { title: "Servicios" };

export default async function ServiciosPage() {
  const [servicios, categorias] = await Promise.all([getServicios(), getCategoriasServicios()]);

  const sinCategoria = servicios.filter((s) => !s.categoria_id);

  return (
    <div className="py-16 sm:py-20">
      <div className="container">
        <SectionHeading eyebrow="Carta de servicios" title="Todos nuestros servicios"
          subtitle="Precios claros, duración estimada y reserva en un clic." />

        {categorias.map((cat) => {
          const items = servicios.filter((s) => s.categoria_id === cat.id);
          if (items.length === 0) return null;
          return (
            <div key={cat.id} className="mt-14">
              <h3 className="mb-6 font-display text-2xl font-bold">
                <span className="text-brand">/</span> {cat.nombre}
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => <ServiceCard key={s.id} servicio={s} />)}
              </div>
            </div>
          );
        })}

        {sinCategoria.length > 0 && (
          <div className="mt-14">
            <h3 className="mb-6 font-display text-2xl font-bold">Otros servicios</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sinCategoria.map((s) => <ServiceCard key={s.id} servicio={s} />)}
            </div>
          </div>
        )}

        {servicios.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">Aún no hay servicios publicados.</p>
        )}
      </div>
    </div>
  );
}
