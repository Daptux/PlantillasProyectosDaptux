import "server-only";
import { and, count, eq, lt, gte, lte, sql, desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clients,
  tasks,
  documents,
  requests,
  monthlyChecklists,
  deadlines,
} from "@/database/schema";

export type DashboardData = {
  activeClients: number;
  pendingTasks: number;
  overdueTasks: number;
  documentsToReview: number;
  requestsSent: number;
  requestsOverdue: number;
  incompleteClients: number;
  upcomingDeadlines: number;
  closedMonths: number;
  openMonths: number;
  semaforo: { verde: number; amarillo: number; rojo: number };
  docsByMonth: { month: string; total: number }[];
  tasksByMonth: { month: string; total: number }[];
  priorities: {
    id: string;
    client: string;
    reason: string;
    level: "rojo" | "amarillo" | "verde";
  }[];
};

const MONTHS_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export async function getDashboardData(firmId: string): Promise<DashboardData> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [
    activeClientsRow,
    pendingTasksRow,
    overdueTasksRow,
    docsToReviewRow,
    requestsSentRow,
    requestsOverdueRow,
    upcomingDeadlinesRow,
    closedMonthsRow,
    openMonthsRow,
  ] = await Promise.all([
    db.select({ c: count() }).from(clients).where(and(eq(clients.firmId, firmId), eq(clients.status, "active"))),
    db.select({ c: count() }).from(tasks).where(and(eq(tasks.firmId, firmId), inArray(tasks.status, ["pendiente", "en_proceso"]))),
    db.select({ c: count() }).from(tasks).where(and(eq(tasks.firmId, firmId), eq(tasks.status, "vencida"))),
    db.select({ c: count() }).from(documents).where(and(eq(documents.firmId, firmId), eq(documents.status, "pendiente"))),
    db.select({ c: count() }).from(requests).where(and(eq(requests.firmId, firmId), inArray(requests.status, ["enviada", "vista", "parcial"]))),
    db.select({ c: count() }).from(requests).where(and(eq(requests.firmId, firmId), eq(requests.status, "vencida"))),
    db.select({ c: count() }).from(deadlines).where(and(eq(deadlines.firmId, firmId), eq(deadlines.status, "pendiente"), gte(deadlines.dueDate, now), lte(deadlines.dueDate, new Date(now.getTime() + 1000 * 60 * 60 * 24 * 15)))),
    db.select({ c: count() }).from(monthlyChecklists).where(and(eq(monthlyChecklists.firmId, firmId), eq(monthlyChecklists.year, currentYear), eq(monthlyChecklists.month, currentMonth), eq(monthlyChecklists.status, "cerrado"))),
    db.select({ c: count() }).from(monthlyChecklists).where(and(eq(monthlyChecklists.firmId, firmId), eq(monthlyChecklists.year, currentYear), eq(monthlyChecklists.month, currentMonth), inArray(monthlyChecklists.status, ["abierto", "en_proceso"]))),
  ]);

  // Semaforo por nivel de riesgo del cliente
  const riskRows = await db
    .select({ risk: clients.riskLevel, c: count() })
    .from(clients)
    .where(and(eq(clients.firmId, firmId), eq(clients.status, "active")))
    .groupBy(clients.riskLevel);

  const semaforo = { verde: 0, amarillo: 0, rojo: 0 };
  for (const r of riskRows) {
    semaforo[r.risk as keyof typeof semaforo] = r.c;
  }

  // Documentos por mes (año actual)
  const docsRows = await db
    .select({ month: documents.month, c: count() })
    .from(documents)
    .where(and(eq(documents.firmId, firmId), eq(documents.year, currentYear)))
    .groupBy(documents.month);

  const docsByMonth = MONTHS_SHORT.map((label, i) => ({
    month: label,
    total: docsRows.find((d) => d.month === i + 1)?.c ?? 0,
  }));

  // Tareas completadas por mes (año actual, usando completedAt)
  const tasksRows = await db
    .select({
      month: sql<number>`extract(month from ${tasks.completedAt})`,
      c: count(),
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.firmId, firmId),
        eq(tasks.status, "completada"),
        sql`extract(year from ${tasks.completedAt}) = ${currentYear}`
      )
    )
    .groupBy(sql`extract(month from ${tasks.completedAt})`);

  const tasksByMonth = MONTHS_SHORT.map((label, i) => ({
    month: label,
    total: Number(tasksRows.find((t) => Number(t.month) === i + 1)?.c ?? 0),
  }));

  // Prioridades del dia: clientes criticos + checklists incompletos
  const criticalClients = await db
    .select({ id: clients.id, name: clients.name, risk: clients.riskLevel })
    .from(clients)
    .where(and(eq(clients.firmId, firmId), eq(clients.status, "active"), inArray(clients.riskLevel, ["rojo", "amarillo"])))
    .orderBy(desc(clients.riskLevel))
    .limit(6);

  const priorities = criticalClients.map((c) => ({
    id: c.id,
    client: c.name,
    reason:
      c.risk === "rojo"
        ? "Cliente critico: revisar documentos y checklist"
        : "Requiere atencion: checklist mensual incompleto",
    level: c.risk as "rojo" | "amarillo" | "verde",
  }));

  // Clientes con informacion incompleta (checklist del mes < 100)
  const incompleteRow = await db
    .select({ c: count() })
    .from(monthlyChecklists)
    .where(and(eq(monthlyChecklists.firmId, firmId), eq(monthlyChecklists.year, currentYear), eq(monthlyChecklists.month, currentMonth), lt(monthlyChecklists.progress, 100)));

  return {
    activeClients: activeClientsRow[0]?.c ?? 0,
    pendingTasks: pendingTasksRow[0]?.c ?? 0,
    overdueTasks: overdueTasksRow[0]?.c ?? 0,
    documentsToReview: docsToReviewRow[0]?.c ?? 0,
    requestsSent: requestsSentRow[0]?.c ?? 0,
    requestsOverdue: requestsOverdueRow[0]?.c ?? 0,
    incompleteClients: incompleteRow[0]?.c ?? 0,
    upcomingDeadlines: upcomingDeadlinesRow[0]?.c ?? 0,
    closedMonths: closedMonthsRow[0]?.c ?? 0,
    openMonths: openMonthsRow[0]?.c ?? 0,
    semaforo,
    docsByMonth,
    tasksByMonth,
    priorities,
  };
}
