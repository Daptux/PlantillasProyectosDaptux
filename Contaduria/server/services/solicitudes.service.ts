import "server-only";
import { and, desc, eq, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { requests, clients, documentTypes, users } from "@/database/schema";
import type { SessionPayload } from "@/lib/auth";
import type { RequestInput } from "@/lib/validations";
import { randomToken } from "@/lib/utils";
import { createDocumentWithFile } from "./documentos.service";
import { notify } from "./notifications.service";

export async function listRequests(
  session: SessionPayload,
  opts: { clientId?: string; status?: string } = {}
) {
  const filters: SQL[] = [eq(requests.firmId, session.firmId!)];
  if (opts.clientId) filters.push(eq(requests.clientId, opts.clientId));
  if (opts.status) filters.push(eq(requests.status, opts.status as never));

  return db
    .select({
      id: requests.id,
      title: requests.title,
      description: requests.description,
      status: requests.status,
      clientId: requests.clientId,
      clientName: clients.name,
      typeName: documentTypes.name,
      month: requests.month,
      year: requests.year,
      dueDate: requests.dueDate,
      token: requests.token,
      tokenActive: requests.tokenActive,
      sentAt: requests.sentAt,
      createdAt: requests.createdAt,
    })
    .from(requests)
    .leftJoin(clients, eq(requests.clientId, clients.id))
    .leftJoin(documentTypes, eq(requests.documentTypeId, documentTypes.id))
    .where(and(...filters))
    .orderBy(desc(requests.createdAt));
}

export async function createRequest(session: SessionPayload, input: RequestInput) {
  const [row] = await db
    .insert(requests)
    .values({
      firmId: session.firmId!,
      clientId: input.clientId,
      createdBy: session.userId,
      assignedUserId: input.assignedUserId ?? null,
      title: input.title,
      description: input.description ?? null,
      documentTypeId: input.documentTypeId ?? null,
      month: input.month ?? null,
      year: input.year ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      token: randomToken(20),
      tokenExpiresAt: input.dueDate
        ? new Date(new Date(input.dueDate).getTime() + 1000 * 60 * 60 * 24 * 7)
        : null,
      status: "borrador",
    })
    .returning();
  return row;
}

export async function sendRequest(session: SessionPayload, id: string) {
  const [row] = await db
    .update(requests)
    .set({ status: "enviada", sentAt: new Date(), updatedAt: new Date() })
    .where(and(eq(requests.id, id), eq(requests.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}

export async function closeRequest(session: SessionPayload, id: string) {
  const [row] = await db
    .update(requests)
    .set({ status: "cerrada", tokenActive: false, updatedAt: new Date() })
    .where(and(eq(requests.id, id), eq(requests.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}

/* -------- Publico (por token, sin sesion) -------- */

export async function getPublicRequest(token: string) {
  const [row] = await db
    .select({
      id: requests.id,
      firmId: requests.firmId,
      clientId: requests.clientId,
      clientName: clients.name,
      title: requests.title,
      description: requests.description,
      documentTypeId: requests.documentTypeId,
      typeName: documentTypes.name,
      month: requests.month,
      year: requests.year,
      dueDate: requests.dueDate,
      status: requests.status,
      tokenActive: requests.tokenActive,
      tokenExpiresAt: requests.tokenExpiresAt,
    })
    .from(requests)
    .leftJoin(clients, eq(requests.clientId, clients.id))
    .leftJoin(documentTypes, eq(requests.documentTypeId, documentTypes.id))
    .where(eq(requests.token, token))
    .limit(1);

  if (!row) return null;
  if (!row.tokenActive) return { ...row, invalid: "El enlace fue desactivado" };
  if (row.tokenExpiresAt && new Date(row.tokenExpiresAt) < new Date())
    return { ...row, invalid: "El enlace expiro" };

  // Marca como vista si estaba enviada
  if (row.status === "enviada") {
    await db
      .update(requests)
      .set({ status: "vista", viewedAt: new Date() })
      .where(eq(requests.id, row.id));
  }
  return row;
}

/** Sube archivos desde el link publico y crea documentos asociados. */
export async function respondPublicRequest(
  token: string,
  file: File,
  extra: { documentTypeId?: string | null; month?: number | null; year?: number | null; comment?: string | null }
) {
  const req = await getPublicRequest(token);
  if (!req || "invalid" in req) throw new Error("Enlace invalido");

  const doc = await createDocumentWithFile({
    firmId: req.firmId,
    clientId: req.clientId,
    documentTypeId: extra.documentTypeId ?? req.documentTypeId ?? null,
    month: extra.month ?? req.month ?? null,
    year: extra.year ?? req.year ?? null,
    file,
    requestId: req.id,
    notes: extra.comment ?? null,
    external: true,
  });

  await db
    .update(requests)
    .set({ status: "respondida", respondedAt: new Date(), updatedAt: new Date() })
    .where(eq(requests.id, req.id));

  // Notifica al creador de la solicitud
  const [r] = await db
    .select({ createdBy: requests.createdBy })
    .from(requests)
    .where(eq(requests.id, req.id))
    .limit(1);
  if (r?.createdBy) {
    await notify(r.createdBy, {
      title: "El cliente respondio una solicitud",
      message: `${req.clientName}: ${req.title}`,
      type: "solicitud_respondida",
      link: "/solicitudes",
    });
  }

  return doc;
}
