import Link from "next/link";
import {
  Users,
  CheckSquare,
  AlertTriangle,
  FileText,
  Send,
  CalendarClock,
  Lock,
  FolderX,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getDashboardData } from "@/server/services/dashboard.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { DocumentsChart, TasksChart } from "@/components/dashboard/charts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RISK_LEVEL } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.firmId) {
    return (
      <div className="text-muted-foreground">
        Tu usuario no esta asociado a una firma contable.
      </div>
    );
  }

  const data = await getDashboardData(session.firmId);
  const totalSemaforo =
    data.semaforo.verde + data.semaforo.amarillo + data.semaforo.rojo || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${session.name.split(" ")[0]}`}
        description="Este es el estado general de tu firma contable hoy."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clientes activos" value={data.activeClients} icon={Users} tone="primary" href="/clientes" />
        <StatCard label="Tareas pendientes" value={data.pendingTasks} icon={CheckSquare} tone="warning" href="/tareas" />
        <StatCard label="Tareas vencidas" value={data.overdueTasks} icon={AlertTriangle} tone="destructive" href="/tareas" />
        <StatCard label="Docs por revisar" value={data.documentsToReview} icon={FileText} tone="warning" href="/documentos" />
        <StatCard label="Solicitudes activas" value={data.requestsSent} icon={Send} tone="primary" href="/solicitudes" />
        <StatCard label="Solicitudes vencidas" value={data.requestsOverdue} icon={AlertTriangle} tone="destructive" href="/solicitudes" />
        <StatCard label="Clientes incompletos" value={data.incompleteClients} icon={FolderX} tone="warning" href="/clientes" />
        <StatCard label="Vencimientos proximos" value={data.upcomingDeadlines} icon={CalendarClock} tone="primary" href="/vencimientos" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Semaforo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Semaforo de clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["verde", "amarillo", "rojo"] as const).map((level) => {
              const val = data.semaforo[level];
              const pct = Math.round((val / totalSemaforo) * 100);
              return (
                <div key={level}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${RISK_LEVEL[level].color}`} />
                      {RISK_LEVEL[level].label}
                    </span>
                    <span className="font-medium">{val}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className={`h-full rounded-full ${RISK_LEVEL[level].color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-2 text-sm border-t">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" /> Meses cerrados
              </span>
              <span className="font-medium">
                {data.closedMonths} / {data.closedMonths + data.openMonths}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Prioridades del dia */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Prioridades del dia</CardTitle>
          </CardHeader>
          <CardContent>
            {data.priorities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Todo en orden. No hay clientes criticos en este momento.
              </p>
            ) : (
              <ul className="divide-y">
                {data.priorities.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${RISK_LEVEL[p.level].color}`} />
                      <div className="min-w-0">
                        <Link href={`/clientes/${p.id}`} className="font-medium hover:underline block truncate">
                          {p.client}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">{p.reason}</p>
                      </div>
                    </div>
                    <Badge variant={RISK_LEVEL[p.level].variant}>{RISK_LEVEL[p.level].label}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graficas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentsChart data={data.docsByMonth} />
        <TasksChart data={data.tasksByMonth} />
      </div>
    </div>
  );
}
