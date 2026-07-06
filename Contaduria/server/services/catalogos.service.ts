import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documentTypes, obligations, messageTemplates } from "@/database/schema";

export async function listDocumentTypes(firmId: string) {
  return db
    .select({ id: documentTypes.id, name: documentTypes.name, requiredByDefault: documentTypes.requiredByDefault })
    .from(documentTypes)
    .where(and(eq(documentTypes.firmId, firmId), eq(documentTypes.status, "active")))
    .orderBy(documentTypes.name);
}

export async function listObligations(firmId: string) {
  return db
    .select()
    .from(obligations)
    .where(and(eq(obligations.firmId, firmId), eq(obligations.status, "active")))
    .orderBy(obligations.name);
}

export async function listTemplates(firmId: string) {
  return db
    .select()
    .from(messageTemplates)
    .where(and(eq(messageTemplates.firmId, firmId), eq(messageTemplates.status, "active")))
    .orderBy(messageTemplates.name);
}
