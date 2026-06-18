import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarClock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardService } from "@/services/dashboardService";
import { useAuth } from "@/context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => dashboardService.summary() });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Panel medico</h1>
        <p className="text-muted-foreground">Dr(a). {user?.nombres} {user?.apellidos}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Citas de hoy" value={data?.citasHoy ?? 0} icon={CalendarDays} loading={isLoading} />
        <StatCard label="Proximas citas" value={data?.citasProximas ?? 0} icon={CalendarClock} loading={isLoading} color="text-secondary bg-secondary/10" />
        <StatCard label="Pacientes atendidos" value={data?.pacientes ?? 0} icon={Users} loading={isLoading} color="text-emerald-600 bg-emerald-100" />
      </div>

      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-6 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Consulta tu agenda con calendario visual y cambia el estado de tus citas.
          </div>
          <Button onClick={() => navigate("/medico/agenda")}>
            <CalendarDays className="h-4 w-4" /> Ver mi agenda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
