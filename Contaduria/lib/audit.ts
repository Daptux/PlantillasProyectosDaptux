import "server-only";
import { db } from "./db";
import { auditLogs } from "@/database/schema";

export type AuditEntry = {
  firmId?: string | null;
  userId?: string | null;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string | null;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string | null;
};

/** Registra un evento de auditoria. Nunca lanza para no romper el flujo principal. */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      firmId: entry.firmId ?? null,
      userId: entry.userId ?? null,
      action: entry.action,
      module: entry.module,
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      oldData: entry.oldData ?? null,
      newData: entry.newData ?? null,
      ipAddress: entry.ipAddress ?? null,
    });
  } catch (e) {
    console.error("[audit] no se pudo registrar:", e);
  }
}
