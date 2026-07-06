import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { accountingFirms, notifications } from "@/database/schema";
import { getSession, type SessionPayload } from "./auth";
import { and, count } from "drizzle-orm";

export type DashboardContext = {
  session: SessionPayload;
  firmName: string;
  unread: number;
};

/** Devuelve el contexto para el layout del dashboard. Redirige si no hay sesion. */
export async function getDashboardContext(): Promise<DashboardContext | null> {
  const session = await getSession();
  if (!session) return null;

  let firmName = "Mi firma contable";
  if (session.firmId) {
    const [firm] = await db
      .select({ name: accountingFirms.name })
      .from(accountingFirms)
      .where(eq(accountingFirms.id, session.firmId))
      .limit(1);
    if (firm) firmName = firm.name;
  }

  const [unreadRow] = await db
    .select({ c: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.userId),
        eq(notifications.read, false)
      )
    );

  return { session, firmName, unread: unreadRow?.c ?? 0 };
}
