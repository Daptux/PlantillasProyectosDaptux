import "server-only";
import { and, count, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clients,
  users,
  clientContacts,
  clientObligations,
  obligations,
  type NewClient,
} from "@/database/schema";
import type { SessionPayload } from "@/lib/auth";
import type { ClientInput } from "@/lib/validations";

/** Verifica que el cliente pertenezca a la firma de la sesion. */
async function assertClientInFirm(session: SessionPayload, clientId: string) {
  const [row] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.firmId, session.firmId!)))
    .limit(1);
  return Boolean(row);
}

/** Filtra clientes por firma. Los auxiliares solo ven los que tienen asignados. */
function scopeFilter(session: SessionPayload): SQL[] {
  const filters: SQL[] = [eq(clients.firmId, session.firmId!)];
  if (session.role === "auxiliar") {
    filters.push(eq(clients.assignedUserId, session.userId));
  }
  return filters;
}

export async function listClients(
  session: SessionPayload,
  opts: { search?: string; status?: string; risk?: string; page?: number; pageSize?: number } = {}
) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, opts.pageSize ?? 20);

  const filters = scopeFilter(session);
  if (opts.search) {
    filters.push(
      or(
        ilike(clients.name, `%${opts.search}%`),
        ilike(clients.documentNumber, `%${opts.search}%`),
        ilike(clients.businessName, `%${opts.search}%`)
      )!
    );
  }
  if (opts.status) filters.push(eq(clients.status, opts.status as never));
  if (opts.risk) filters.push(eq(clients.riskLevel, opts.risk as never));

  const where = and(...filters);

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: clients.id,
        name: clients.name,
        businessName: clients.businessName,
        documentNumber: clients.documentNumber,
        personType: clients.personType,
        status: clients.status,
        riskLevel: clients.riskLevel,
        city: clients.city,
        assignedUserId: clients.assignedUserId,
        assignedName: users.name,
      })
      .from(clients)
      .leftJoin(users, eq(clients.assignedUserId, users.id))
      .where(where)
      .orderBy(desc(clients.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ c: count() }).from(clients).where(where),
  ]);

  return { rows, total: totalRow[0]?.c ?? 0, page, pageSize };
}

export async function getClient(session: SessionPayload, id: string) {
  const [row] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.firmId, session.firmId!)))
    .limit(1);
  return row ?? null;
}

export async function createClient(session: SessionPayload, input: ClientInput) {
  const values: NewClient = {
    ...input,
    email: input.email || null,
    firmId: session.firmId!,
    assignedUserId: input.assignedUserId ?? null,
  };
  const [row] = await db.insert(clients).values(values).returning();
  return row;
}

export async function updateClient(
  session: SessionPayload,
  id: string,
  input: Partial<ClientInput>
) {
  const [row] = await db
    .update(clients)
    .set({ ...input, email: input.email || null, updatedAt: new Date() })
    .where(and(eq(clients.id, id), eq(clients.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}

/** Soft delete: marca el cliente como inactivo. */
export async function deactivateClient(session: SessionPayload, id: string) {
  const [row] = await db
    .update(clients)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(and(eq(clients.id, id), eq(clients.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}

/**
 * Borrado definitivo del cliente. Elimina en cascada sus documentos, tareas,
 * solicitudes, checklists, vencimientos, contactos y obligaciones (definido en
 * el schema con onDelete: cascade). Accion irreversible.
 */
export async function deleteClient(session: SessionPayload, id: string) {
  const [row] = await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.firmId, session.firmId!)))
    .returning({ id: clients.id });
  return row ?? null;
}

/** Cambia el estado del cliente (active | inactive | suspended). */
export async function setClientStatus(
  session: SessionPayload,
  id: string,
  status: "active" | "inactive" | "suspended"
) {
  const [row] = await db
    .update(clients)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(clients.id, id), eq(clients.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}

/* -------- Contactos del cliente -------- */

export async function listContacts(session: SessionPayload, clientId: string) {
  if (!(await assertClientInFirm(session, clientId))) return null;
  return db
    .select()
    .from(clientContacts)
    .where(eq(clientContacts.clientId, clientId))
    .orderBy(desc(clientContacts.isPrimary), desc(clientContacts.createdAt));
}

export async function addContact(
  session: SessionPayload,
  clientId: string,
  input: { name: string; role?: string | null; email?: string | null; phone?: string | null; isPrimary?: boolean }
) {
  if (!(await assertClientInFirm(session, clientId))) return null;
  const [row] = await db
    .insert(clientContacts)
    .values({
      clientId,
      name: input.name,
      role: input.role ?? null,
      email: input.email || null,
      phone: input.phone ?? null,
      isPrimary: input.isPrimary ?? false,
    })
    .returning();
  return row;
}

export async function deleteContact(
  session: SessionPayload,
  clientId: string,
  contactId: string
) {
  if (!(await assertClientInFirm(session, clientId))) return null;
  await db
    .delete(clientContacts)
    .where(and(eq(clientContacts.id, contactId), eq(clientContacts.clientId, clientId)));
  return { ok: true };
}

/* -------- Obligaciones (perfil tributario) del cliente -------- */

export async function listClientObligations(session: SessionPayload, clientId: string) {
  if (!(await assertClientInFirm(session, clientId))) return null;
  return db
    .select({
      id: clientObligations.id,
      obligationId: clientObligations.obligationId,
      name: obligations.name,
      periodicity: clientObligations.periodicity,
      dueDay: clientObligations.dueDay,
      active: clientObligations.active,
      notes: clientObligations.notes,
    })
    .from(clientObligations)
    .innerJoin(obligations, eq(clientObligations.obligationId, obligations.id))
    .where(eq(clientObligations.clientId, clientId))
    .orderBy(obligations.name);
}

export async function addClientObligation(
  session: SessionPayload,
  clientId: string,
  input: {
    obligationId: string;
    periodicity?: "mensual" | "bimestral" | "trimestral" | "cuatrimestral" | "anual" | "personalizada";
    dueDay?: number | null;
    notes?: string | null;
  }
) {
  if (!(await assertClientInFirm(session, clientId))) return null;
  // Evita duplicar la misma obligacion para el cliente
  const [existing] = await db
    .select({ id: clientObligations.id })
    .from(clientObligations)
    .where(and(eq(clientObligations.clientId, clientId), eq(clientObligations.obligationId, input.obligationId)))
    .limit(1);
  if (existing) return existing;

  const [row] = await db
    .insert(clientObligations)
    .values({
      clientId,
      obligationId: input.obligationId,
      periodicity: input.periodicity ?? "mensual",
      dueDay: input.dueDay ?? null,
      notes: input.notes ?? null,
      active: true,
    })
    .returning();
  return row;
}

export async function removeClientObligation(
  session: SessionPayload,
  clientId: string,
  clientObligationId: string
) {
  if (!(await assertClientInFirm(session, clientId))) return null;
  await db
    .delete(clientObligations)
    .where(and(eq(clientObligations.id, clientObligationId), eq(clientObligations.clientId, clientId)));
  return { ok: true };
}

/** Resumen del cliente con contadores para la pestaña Resumen del detalle. */
export async function getClientSummary(session: SessionPayload, id: string) {
  const client = await getClient(session, id);
  if (!client) return null;

  const { documents, tasks, requests, monthlyChecklists } = await import(
    "@/database/schema"
  );
  const { count, and: and2, eq: eq2, inArray: inArray2 } = await import(
    "drizzle-orm"
  );
  const now = new Date();

  const [docs, pendingDocs, pendingTasks, activeRequests, checklist] =
    await Promise.all([
      db.select({ c: count() }).from(documents).where(eq2(documents.clientId, id)),
      db.select({ c: count() }).from(documents).where(and2(eq2(documents.clientId, id), eq2(documents.status, "pendiente"))),
      db.select({ c: count() }).from(tasks).where(and2(eq2(tasks.clientId, id), inArray2(tasks.status, ["pendiente", "en_proceso"]))),
      db.select({ c: count() }).from(requests).where(and2(eq2(requests.clientId, id), inArray2(requests.status, ["enviada", "vista", "parcial"]))),
      db.select({ progress: monthlyChecklists.progress }).from(monthlyChecklists).where(and2(eq2(monthlyChecklists.clientId, id), eq2(monthlyChecklists.month, now.getMonth() + 1), eq2(monthlyChecklists.year, now.getFullYear()))).limit(1),
    ]);

  return {
    client,
    stats: {
      documents: docs[0]?.c ?? 0,
      pendingDocuments: pendingDocs[0]?.c ?? 0,
      pendingTasks: pendingTasks[0]?.c ?? 0,
      activeRequests: activeRequests[0]?.c ?? 0,
      checklistProgress: checklist[0]?.progress ?? 0,
    },
  };
}

/** Opciones ligeras de clientes activos para selects. */
export async function listClientOptions(session: SessionPayload) {
  const filters = scopeFilter(session);
  filters.push(eq(clients.status, "active"));
  return db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(and(...filters))
    .orderBy(clients.name);
}

export async function listFirmUsers(firmId: string) {
  return db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(and(eq(users.firmId, firmId), eq(users.status, "active")));
}
