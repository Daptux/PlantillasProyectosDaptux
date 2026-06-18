import { useState } from "react";
import CalendarView from "./CalendarView";
import AppointmentModal from "@/components/modals/AppointmentModal";
import AppointmentDetailModal from "@/components/modals/AppointmentDetailModal";
import { useAppointments } from "@/hooks/useAppointments";
import { toDateInput } from "@/lib/appointments";
import type { Cita } from "@/types";

interface Props {
  /** Si el rol puede crear citas, muestra el boton/acciones de "Nueva cita". */
  canCreate?: boolean;
}

/**
 * Tablero de citas: calendario + modal de creacion + modal de detalle.
 * El backend ya filtra las citas segun el rol del usuario autenticado.
 */
export default function AppointmentsBoard({ canCreate = false }: Props) {
  const { data: citas = [], isLoading, isError } = useAppointments();
  const [selected, setSelected] = useState<Cita | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string | undefined>();

  const abrirCrear = (fecha?: Date) => {
    setCreateDate(fecha ? toDateInput(fecha) : undefined);
    setCreateOpen(true);
  };

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Cargando citas...</div>;
  }
  if (isError) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        No se pudieron cargar las citas. Intenta de nuevo.
      </div>
    );
  }

  return (
    <>
      <CalendarView
        citas={citas}
        onSelectCita={setSelected}
        onCreateAt={canCreate ? abrirCrear : undefined}
      />

      {canCreate && (
        <AppointmentModal open={createOpen} onClose={() => setCreateOpen(false)} defaultDate={createDate} />
      )}

      <AppointmentDetailModal open={!!selected} onClose={() => setSelected(null)} cita={selected} />
    </>
  );
}
