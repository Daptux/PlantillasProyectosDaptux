import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  CreditCard,
  MessageSquareWarning,
  Stethoscope,
  AlertCircle,
  Briefcase,
  FileText,
  UserCog,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardService } from "@/services/dashboardService";
import { formatCOP } from "@/lib/payments";
import { useAuth } from "@/context/AuthContext";

/** Accesos rapidos con descripcion para que cada modulo se entienda de un vistazo. */
const accesos = [
  { to: "/admin/citas", label: "Citas", desc: "Agenda y calendario de la clinica", icon: CalendarDays, color: "text-secondary bg-secondary/10" },
  { to: "/admin/pacientes", label: "Pacientes", desc: "Fichas y datos de contacto", icon: Users, color: "text-primary bg-primary/10" },
  { to: "/admin/medicos", label: "Medicos", desc: "Profesionales y sus horarios", icon: Stethoscope, color: "text-indigo-600 bg-indigo-100" },
  { to: "/admin/servicios", label: "Servicios", desc: "Catalogo, precios y duracion", icon: Briefcase, color: "text-amber-600 bg-amber-100" },
  { to: "/admin/pagos", label: "Pagos", desc: "Facturas y recaudo", icon: CreditCard, color: "text-emerald-600 bg-emerald-100" },
  { to: "/admin/resultados", label: "Resultados", desc: "Cargar y entregar examenes", icon: FileText, color: "text-cyan-600 bg-cyan-100" },
  { to: "/admin/pqrsf", label: "PQRSF", desc: "Peticiones, quejas y reclamos", icon: MessageSquareWarning, color: "text-rose-600 bg-rose-100" },
  { to: "/admin/usuarios", label: "Usuarios", desc: "Cuentas y roles del personal", icon: UserCog, color: "text-slate-600 bg-slate-200" },
  { to: "/admin/landing", label: "Landing", desc: "Editar la pagina publica", icon: Globe, color: "text-fuchsia-600 bg-fuchsia-100" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => dashboardService.summary() });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel administrativo</h1>
          <p className="text-muted-foreground">Hola, {user?.nombres}. Este es el resumen de hoy.</p>
        </div>
        <Badge>{user?.rol}</Badge>
      </div>

      {/* Metricas: cada una lleva a su modulo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citas hoy" value={data?.citasHoy ?? 0} icon={CalendarDays} loading={isLoading} color="text-secondary bg-secondary/10" to="/admin/citas" />
        <StatCard label="Pacientes" value={data?.pacientes ?? 0} icon={Users} loading={isLoading} to="/admin/pacientes" />
        <StatCard label="Recaudado del mes" value={formatCOP(data?.pagosMes ?? 0)} icon={CreditCard} loading={isLoading} color="text-emerald-600 bg-emerald-100" hint="ingresos confirmados" to="/admin/pagos" />
        <StatCard label="PQRSF abiertas" value={data?.pqrsfAbiertas ?? 0} icon={MessageSquareWarning} loading={isLoading} color="text-amber-600 bg-amber-100" to="/admin/pqrsf" />
      </div>

      {/* Alertas accionables */}
      {(data?.pagosPendientes ?? 0) > 0 && (
        <Link to="/admin/pagos" className="block">
          <Card className="border-amber-200 bg-amber-50 transition-colors hover:bg-amber-100/70">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-amber-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>
                Hay <strong>{data?.pagosPendientes}</strong> pagos pendientes por gestionar.
              </span>
              <ChevronRight className="ml-auto h-4 w-4" />
            </CardContent>
          </Card>
        </Link>
      )}

      <div>
        <h2 className="mb-3 font-semibold">Accesos rapidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accesos.map((a) => (
            <Link key={a.to} to={a.to}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${a.color}`}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">{a.label}</div>
                    <div className="text-sm text-muted-foreground">{a.desc}</div>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/40" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
