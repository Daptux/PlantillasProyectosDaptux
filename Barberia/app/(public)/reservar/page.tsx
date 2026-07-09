import { Suspense } from "react";
import { SectionHeading } from "@/components/public/SectionHeading";
import { BookingForm } from "@/components/forms/BookingForm";
import { getServicios, getBarberos } from "@/lib/queries";

export const metadata = { title: "Reservar cita" };

export default async function ReservarPage() {
  const [servicios, barberos] = await Promise.all([getServicios(), getBarberos()]);

  return (
    <div className="py-16 sm:py-20">
      <div className="container max-w-4xl">
        <SectionHeading eyebrow="Reserva" title="Agenda tu cita"
          subtitle="En pocos pasos aseguras tu horario con el barbero que prefieras." />
        <div className="mt-12">
          <Suspense fallback={<div className="h-64" />}>
            <BookingForm servicios={servicios} barberos={barberos} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
