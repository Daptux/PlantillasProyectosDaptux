import { BarberCard } from "@/components/public/BarberCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { getBarberos } from "@/lib/queries";

export const metadata = { title: "Barberos" };

export default async function BarberosPage() {
  const barberos = await getBarberos();

  return (
    <div className="py-16 sm:py-20">
      <div className="container">
        <SectionHeading eyebrow="El equipo" title="Nuestros barberos"
          subtitle="Conoce a los profesionales que harán realidad tu estilo." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {barberos.map((b) => <BarberCard key={b.id} barbero={b} />)}
        </div>
        {barberos.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">Aún no hay barberos publicados.</p>
        )}
      </div>
    </div>
  );
}
