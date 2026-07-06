import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  monthlyChecklists,
  monthlyChecklistItems,
  clients,
  clientObligations,
  obligations,
  type Client,
} from "@/database/schema";
import type { SessionPayload } from "@/lib/auth";

/** Define los items base del checklist segun el perfil del cliente. */
function buildItemsForClient(
  client: Pick<Client, "isVatResponsible">,
  obligationNames: string[]
): { title: string; isCritical: boolean }[] {
  const has = (name: string) =>
    obligationNames.some((o) => o.toLowerCase().includes(name));

  const items: { title: string; isCritical: boolean }[] = [
    { title: "Facturas de venta recibidas", isCritical: true },
    { title: "Facturas de compra recibidas", isCritical: true },
    { title: "Extractos bancarios recibidos", isCritical: true },
    { title: "Comprobantes de pago recibidos", isCritical: false },
  ];

  if (has("nomina")) {
    items.push({ title: "Nomina revisada", isCritical: false });
  }
  if (has("seguridad")) {
    items.push({ title: "Seguridad social revisada", isCritical: false });
  }
  if (has("documento soporte")) {
    items.push({ title: "Documento soporte revisado", isCritical: false });
  }
  if (client.isVatResponsible || has("iva")) {
    items.push({ title: "IVA preparado", isCritical: true });
  }
  if (has("retencion")) {
    items.push({ title: "Retencion preparada", isCritical: true });
  }

  items.push({ title: "Reporte enviado", isCritical: false });
  items.push({ title: "Mes cerrado", isCritical: true });
  return items;
}

/** Genera (si no existe) el checklist mensual de un cliente. Devuelve el id. */
export async function generateChecklistForClient(
  firmId: string,
  clientId: string,
  month: number,
  year: number
): Promise<string | null> {
  const existing = await db
    .select({ id: monthlyChecklists.id })
    .from(monthlyChecklists)
    .where(
      and(
        eq(monthlyChecklists.clientId, clientId),
        eq(monthlyChecklists.month, month),
        eq(monthlyChecklists.year, year)
      )
    )
    .limit(1);
  if (existing.length > 0) return existing[0].id;

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);
  if (!client) return null;

  const obs = await db
    .select({ name: obligations.name })
    .from(clientObligations)
    .innerJoin(obligations, eq(clientObligations.obligationId, obligations.id))
    .where(and(eq(clientObligations.clientId, clientId), eq(clientObligations.active, true)));

  const items = buildItemsForClient(client, obs.map((o) => o.name));

  const [checklist] = await db
    .insert(monthlyChecklists)
    .values({ firmId, clientId, month, year, status: "abierto", progress: 0, riskLevel: "rojo" })
    .returning();

  await db.insert(monthlyChecklistItems).values(
    items.map((it, idx) => ({
      checklistId: checklist.id,
      title: it.title,
      isCritical: it.isCritical,
      sortOrder: idx,
      status: "pendiente" as const,
    }))
  );

  return checklist.id;
}

/** Genera el checklist del periodo para todos los clientes activos de la firma. */
export async function generateChecklistsForFirm(
  firmId: string,
  month: number,
  year: number
): Promise<number> {
  const active = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.firmId, firmId), eq(clients.status, "active")));

  let created = 0;
  for (const c of active) {
    const before = await db
      .select({ id: monthlyChecklists.id })
      .from(monthlyChecklists)
      .where(and(eq(monthlyChecklists.clientId, c.id), eq(monthlyChecklists.month, month), eq(monthlyChecklists.year, year)))
      .limit(1);
    await generateChecklistForClient(firmId, c.id, month, year);
    if (before.length === 0) created++;
  }
  return created;
}

/** Recalcula progreso y semaforo de un checklist y sincroniza el riesgo del cliente. */
export async function recalcChecklist(checklistId: string): Promise<void> {
  const items = await db
    .select({ status: monthlyChecklistItems.status, isCritical: monthlyChecklistItems.isCritical })
    .from(monthlyChecklistItems)
    .where(eq(monthlyChecklistItems.checklistId, checklistId));

  const applicable = items.filter((i) => i.status !== "no_aplica");
  const completed = applicable.filter((i) => i.status === "completado").length;
  const progress = applicable.length
    ? Math.round((completed / applicable.length) * 100)
    : 0;

  const criticalPending = items.some(
    (i) => i.isCritical && i.status !== "completado" && i.status !== "no_aplica"
  );

  let risk: "verde" | "amarillo" | "rojo";
  if (progress >= 80 && !criticalPending) risk = "verde";
  else if (progress >= 50) risk = "amarillo";
  else risk = "rojo";

  const [cl] = await db
    .update(monthlyChecklists)
    .set({ progress, riskLevel: risk, updatedAt: new Date() })
    .where(eq(monthlyChecklists.id, checklistId))
    .returning({ clientId: monthlyChecklists.clientId });

  if (cl) {
    await db.update(clients).set({ riskLevel: risk, updatedAt: new Date() }).where(eq(clients.id, cl.clientId));
  }
}

export async function getChecklistWithItems(
  session: SessionPayload,
  checklistId: string
) {
  const [checklist] = await db
    .select()
    .from(monthlyChecklists)
    .where(and(eq(monthlyChecklists.id, checklistId), eq(monthlyChecklists.firmId, session.firmId!)))
    .limit(1);
  if (!checklist) return null;
  const items = await db
    .select()
    .from(monthlyChecklistItems)
    .where(eq(monthlyChecklistItems.checklistId, checklistId))
    .orderBy(monthlyChecklistItems.sortOrder);
  return { checklist, items };
}

export async function listChecklists(
  session: SessionPayload,
  month: number,
  year: number
) {
  return db
    .select({
      id: monthlyChecklists.id,
      clientId: monthlyChecklists.clientId,
      clientName: clients.name,
      month: monthlyChecklists.month,
      year: monthlyChecklists.year,
      status: monthlyChecklists.status,
      progress: monthlyChecklists.progress,
      riskLevel: monthlyChecklists.riskLevel,
    })
    .from(monthlyChecklists)
    .innerJoin(clients, eq(monthlyChecklists.clientId, clients.id))
    .where(
      and(
        eq(monthlyChecklists.firmId, session.firmId!),
        eq(monthlyChecklists.month, month),
        eq(monthlyChecklists.year, year)
      )
    )
    .orderBy(clients.name);
}

export async function updateChecklistItem(
  session: SessionPayload,
  itemId: string,
  patch: { status?: string; notes?: string | null; assignedTo?: string | null }
) {
  const [item] = await db
    .select({ checklistId: monthlyChecklistItems.checklistId })
    .from(monthlyChecklistItems)
    .innerJoin(monthlyChecklists, eq(monthlyChecklistItems.checklistId, monthlyChecklists.id))
    .where(and(eq(monthlyChecklistItems.id, itemId), eq(monthlyChecklists.firmId, session.firmId!)))
    .limit(1);
  if (!item) return null;

  const [updated] = await db
    .update(monthlyChecklistItems)
    .set({
      status: (patch.status as never) ?? undefined,
      notes: patch.notes ?? undefined,
      assignedTo: patch.assignedTo ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(monthlyChecklistItems.id, itemId))
    .returning();

  await recalcChecklist(item.checklistId);
  return updated;
}

export async function closeChecklist(session: SessionPayload, checklistId: string) {
  const [row] = await db
    .update(monthlyChecklists)
    .set({ status: "cerrado", closedBy: session.userId, closedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(monthlyChecklists.id, checklistId), eq(monthlyChecklists.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}
