import AppointmentsBoard from "@/components/calendar/AppointmentsBoard";

/** Gestion de citas para recepcion/administracion. */
export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Citas</h1>
        <p className="text-muted-foreground">Agenda de la clinica: crea, reprograma y gestiona estados.</p>
      </div>
      <AppointmentsBoard canCreate />
    </div>
  );
}
