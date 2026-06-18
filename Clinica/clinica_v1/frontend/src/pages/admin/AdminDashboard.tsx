import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, CalendarDays, CreditCard, MessageSquareWarning, Stethoscope, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardService } from "@/services/dashboardService";
import { formatCOP } from "@/lib/payments";
import { useAuth } from "@/context/AuthContext";

const accesos = [
  { to: "/admin/citas", label: "Citas", icon: CalendarDays },
  { to: "/admin/pacientes", label: "Pacientes", icon: Users },
  { to: "/admin/medicos", label: "Medicos", icon: Stethoscope },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => dashboardService.summary() });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel administrativo</h1>
          <p className="text-muted-foreground">Hola, {user?.nombres}. Resumen general de la clinica.</p>
        </div>
        <Badge>{user?.rol}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citas hoy" value={data?.citasHoy ?? 0} icon={CalendarDays} loading={isLoading} color="text-secondary bg-secondary/10" />
        <StatCard label="Pacientes" value={data?.pacientes ?? 0} icon={Users} loading={isLoading} />
        <StatCard label="Recaudado del mes" value={formatCOP(data?.pagosMes ?? 0)} icon={CreditCard} loading={isLoading} color="text-emerald-600 bg-emerald-100" />
        <StatCard label="PQRSF abiertas" value={data?.pqrsfAbiertas ?? 0} icon={MessageSquareWarning} loading={isLoading} color="text-amber-600 bg-amber-100" />
      </div>

      {(data?.pagosPendientes ?? 0) > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-amber-800">
            <AlertCircle className="h-5 w-5" />
            Hay <strong>{data?.pagosPendientes}</strong> pagos pendientes por gestionar.
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 font-semibold">Accesos rapidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {accesos.map((a) => (
            <Link key={a.to} to={a.to}>
              <Card className="transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{a.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
