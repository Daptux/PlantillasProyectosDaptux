import "server-only";
import { and, count, desc, eq, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents, clients, documentTypes, users } from "@/database/schema";
import type { SessionPayload } from "@/lib/auth";
import { buildInternalName, uploadFile, getExtension } from "@/lib/storage";

export async function listDocuments(
  session: SessionPayload,
  opts: { clientId?: string; documentTypeId?: string; month?: number; year?: number; status?: string } = {}
) {
  const filters: SQL[] = [eq(documents.firmId, session.firmId!)];
  if (opts.clientId) filters.push(eq(documents.clientId, opts.clientId));
  if (opts.documentTypeId) filters.push(eq(documents.documentTypeId, opts.documentTypeId));
  if (opts.month) filters.push(eq(documents.month, opts.month));
  if (opts.year) filters.push(eq(documents.year, opts.year));
  if (opts.status) filters.push(eq(documents.status, opts.status as never));

  return db
    .select({
      id: documents.id,
      clientId: documents.clientId,
      clientName: clients.name,
      typeName: documentTypes.name,
      month: documents.month,
      year: documents.year,
      originalName: documents.originalName,
      internalName: documents.internalName,
      fileUrl: documents.fileUrl,
      fileSize: documents.fileSize,
      status: documents.status,
      uploadedByExternal: documents.uploadedByExternal,
      reviewerName: users.name,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .leftJoin(clients, eq(documents.clientId, clients.id))
    .leftJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
    .leftJoin(users, eq(documents.reviewedBy, users.id))
    .where(and(...filters))
    .orderBy(desc(documents.createdAt))
    .limit(200);
}

/**
 * Crea un documento subiendo el archivo y generando el nombre interno.
 * Reutilizable desde el panel y desde la carga publica (uploadedByExternal).
 */
export async function createDocumentWithFile(params: {
  firmId: string;
  clientId: string;
  documentTypeId?: string | null;
  month?: number | null;
  year?: number | null;
  file: File;
  uploadedBy?: string | null;
  requestId?: string | null;
  notes?: string | null;
  external?: boolean;
}) {
  const [client] = await db
    .select({ name: clients.name })
    .from(clients)
    .where(eq(clients.id, params.clientId))
    .limit(1);

  let typeName = "Documento";
  if (params.documentTypeId) {
    const [t] = await db
      .select({ name: documentTypes.name })
      .from(documentTypes)
      .where(eq(documentTypes.id, params.documentTypeId))
      .limit(1);
    if (t) typeName = t.name;
  }

  // Secuencia por cliente/tipo/periodo
  const [seqRow] = await db
    .select({ c: count() })
    .from(documents)
    .where(
      and(
        eq(documents.clientId, params.clientId),
        params.documentTypeId ? eq(documents.documentTypeId, params.documentTypeId) : eq(documents.firmId, params.firmId)
      )
    );
  const sequence = (seqRow?.c ?? 0) + 1;

  const extension = getExtension((params.file as File).name ?? "archivo.bin");
  const internalName = buildInternalName({
    clientName: client?.name ?? "Cliente",
    documentTypeName: typeName,
    month: params.month,
    year: params.year,
    sequence,
    extension,
  });

  const stored = await uploadFile(params.file, internalName);

  const [row] = await db
    .insert(documents)
    .values({
      firmId: params.firmId,
      clientId: params.clientId,
      documentTypeId: params.documentTypeId ?? null,
      requestId: params.requestId ?? null,
      uploadedBy: params.uploadedBy ?? null,
      month: params.month ?? null,
      year: params.year ?? null,
      originalName: (params.file as File).name ?? internalName,
      internalName,
      fileUrl: stored.url,
      fileSize: stored.size,
      fileExtension: stored.extension,
      notes: params.notes ?? null,
      uploadedByExternal: params.external ?? false,
      status: "pendiente",
    })
    .returning();

  return row;
}

export async function reviewDocument(
  session: SessionPayload,
  id: string,
  status: string,
  notes?: string | null
) {
  const [row] = await db
    .update(documents)
    .set({
      status: status as never,
      notes: notes ?? null,
      reviewedBy: session.userId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(documents.id, id), eq(documents.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}
