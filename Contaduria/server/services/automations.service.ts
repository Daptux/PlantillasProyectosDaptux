import "server-only";
import { and, eq, inArray, lt, lte, gte, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accountingFirms,
  requests,
  tasks,
  deadlines,
} from "@/database/schema";
import { generateChecklistsForFirm } from "./checklists.service";
import { notify } from "./notifications.service";

/** Automatizacion 1: genera checklists del mes actual para todas las firmas activas. */
export async function runGenerateChecklists(): Promise<{ firms: number; created: number }> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const firms = await db
    .select({ id: accountingFirms.id })
    .from(accountingFirms)
    .where(eq(accountingFirms.status, "active"));

  let created = 0;
  for (const f of firms) {
    created += await generateChecklistsForFirm(f.id, month, year);
  }
  return { firms: firms.length, created };
}

/**
 * Automatizacion 3 y 4: marca vencidos (solicitudes, tareas, vencimientos)
 * y actualiza estados automaticamente.
 */
export async function runUpdateStatuses(): Promise<{
  requests: number;
  tasks: number;
  deadlines: number;
}> {
  const now = new Date();

  const overdueRequests = await db
    .update(requests)
    .set({ status: "vencida", updatedAt: now })
    .where(
      and(
        isNotNull(requests.dueDate),
        lt(requests.dueDate, now),
        inArray(requests.status, ["enviada", "vista", "parcial"])
      )
    )
    .returning({ id: requests.id });

  const overdueTasks = await db
    .update(tasks)
    .set({ status: "vencida", updatedAt: now })
    .where(
      and(
        isNotNull(tasks.dueDate),
        lt(tasks.dueDate, now),
        inArray(tasks.status, ["pendiente", "en_proceso"])
      )
    )
    .returning({ id: tasks.id, assignedTo: tasks.assignedTo });

  const overdueDeadlines = await db
    .update(deadlines)
    .set({ status: "vencido", updatedAt: now })
    .where(and(lt(deadlines.dueDate, now), eq(deadlines.status, "pendiente")))
    .returning({ id: deadlines.id });

  for (const t of overdueTasks) {
    if (t.assignedTo)
      await notify(t.assignedTo, {
        title: "Tarea vencida",
        message: "Una tarea asignada supero su fecha limite.",
        type: "tarea_vencida",
        link: "/tareas",
      });
  }

  return {
    requests: overdueRequests.length,
    tasks: overdueTasks.length,
    deadlines: overdueDeadlines.length,
  };
}

/**
 * Automatizacion 4 y 6: recordatorios y notificaciones de vencimientos proximos.
 * Notifica solicitudes y vencimientos que vencen en los proximos 2 dias.
 */
export async function runReminders(): Promise<{ reminders: number }> {
  const now = new Date();
  const soon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2);

  const dueRequests = await db
    .select({ id: requests.id, title: requests.title, createdBy: requests.createdBy })
    .from(requests)
    .where(
      and(
        isNotNull(requests.dueDate),
        gte(requests.dueDate, now),
        lte(requests.dueDate, soon),
        inArray(requests.status, ["enviada", "vista", "parcial"])
      )
    );

  const dueDeadlines = await db
    .select({ id: deadlines.id, title: deadlines.title, assignedTo: deadlines.assignedTo })
    .from(deadlines)
    .where(
      and(
        gte(deadlines.dueDate, now),
        lte(deadlines.dueDate, soon),
        eq(deadlines.status, "pendiente")
      )
    );

  let reminders = 0;
  for (const r of dueRequests) {
    if (r.createdBy) {
      await notify(r.createdBy, {
        title: "Solicitud proxima a vencer",
        message: r.title,
        type: "vencimiento_proximo",
        link: "/solicitudes",
      });
      reminders++;
    }
  }
  for (const d of dueDeadlines) {
    if (d.assignedTo) {
      await notify(d.assignedTo, {
        title: "Vencimiento proximo",
        message: d.title,
        type: "vencimiento_proximo",
        link: "/vencimientos",
      });
      reminders++;
    }
  }

  return { reminders };
}
