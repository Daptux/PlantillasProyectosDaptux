import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, FileSearch, CreditCard, UserCog, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboardService";
import { useAuth } from "@/context/AuthContext";

const acciones = [
  { icon: CalendarPlus, title: "Agendar cita", desc: "Reserva tu proxima consulta", to: "/paciente/citas" },
  { icon: FileSearch, title: "Mis resultados", desc: "Consulta tus examenes", to: "/paciente/resultados" },
  { icon: FileText, title: "Mis documentos", desc: "Ordenes y autorizaciones", to: "/paciente/documentos" },
  { icon: CreditCard, title: "Mis pagos", desc: "Facturas y estado de pago", to: "/paciente/pagos" },
  { icon: UserCog, title: "Mi perfil", desc: "Actualiza tus datos", to: "/paciente" },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => dashboardService.summary() });

  const proximas = data?.citasProximas ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Hola, {user?.nombres} 👋</h1>
        <p className="text-muted-foreground">Bienvenido a tu portal de salud.</p>
      </div>

      <Card className="bg-gradient-to-br from-primary to-secondary text-white">
        <CardContent className="flex flex-col items-start gap-3 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {proximas > 0
                ? `Tienes ${proximas} cita${proximas > 1 ? "s" : ""} proxima${proximas > 1 ? "s" : ""}`
                : "No tienes citas proximas"}
            </h2>
            <p className="text-white/90">
              {proximas > 0 ? "Revisa el detalle en Mis citas." : "Agenda tu primera cita en pocos pasos."}
            </p>
          </div>
          <Button className="bg-white text-primary hover:bg-white/90" onClick={() => navigate("/paciente/citas")}>
            <CalendarPlus className="h-4 w-4" /> {proximas > 0 ? "Ver mis citas" : "Agendar cita"}
          </Button>
        </CardContent>
      </Card>

      {(data?.misPagosPendientes ?? 0) > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between gap-3 p-4 text-sm text-amber-800">
            <span>Tienes <strong>{data?.misPagosPendientes}</strong> factura(s) pendiente(s) de pago.</span>
            <Button size="sm" variant="outline" onClick={() => navigate("/paciente/pagos")}>Pagar</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {acciones.map((a) => (
          <Link key={a.title} to={a.to}>
            <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-md">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <a.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm text-muted-foreground">{a.desc}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
