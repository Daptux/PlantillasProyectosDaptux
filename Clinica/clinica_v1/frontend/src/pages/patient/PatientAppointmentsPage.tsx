import AppointmentsBoard from "@/components/calendar/AppointmentsBoard";

/** Portal del paciente: ver y agendar sus propias citas. */
export default function PatientAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis citas</h1>
        <p className="text-muted-foreground">Agenda nuevas citas y consulta el estado de las existentes.</p>
      </div>
      <AppointmentsBoard canCreate />
    </div>
  );
}
