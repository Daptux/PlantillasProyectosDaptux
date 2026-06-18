import { useAuth } from "@/context/AuthContext";
import AppointmentsBoard from "@/components/calendar/AppointmentsBoard";

/** Agenda del medico: solo sus citas; puede cambiar el estado. */
export default function DoctorAgendaPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi agenda</h1>
        <p className="text-muted-foreground">Dr(a). {user?.nombres} {user?.apellidos}</p>
      </div>
      <AppointmentsBoard />
    </div>
  );
}
