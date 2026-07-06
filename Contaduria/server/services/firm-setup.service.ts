import "server-only";
import { db } from "@/lib/db";
import {
  documentTypes,
  obligations,
  messageTemplates,
} from "@/database/schema";
import {
  DEFAULT_DOCUMENT_TYPES,
  DEFAULT_OBLIGATIONS,
  DEFAULT_TEMPLATES,
} from "@/database/defaults";

export { DEFAULT_DOCUMENT_TYPES, DEFAULT_OBLIGATIONS, DEFAULT_TEMPLATES };

/** Crea tipos de documento, obligaciones y plantillas por defecto para una firma. */
export async function seedFirmDefaults(firmId: string): Promise<void> {
  await db
    .insert(documentTypes)
    .values(DEFAULT_DOCUMENT_TYPES.map((d) => ({ ...d, firmId })));

  await db
    .insert(obligations)
    .values(DEFAULT_OBLIGATIONS.map((o) => ({ ...o, firmId })));

  await db
    .insert(messageTemplates)
    .values(DEFAULT_TEMPLATES.map((t) => ({ ...t, firmId })));
}
