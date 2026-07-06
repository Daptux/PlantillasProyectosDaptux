import "server-only";
import { and, asc, eq, gte, lte, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { deadlines, clients } from "@/database/schema";
import type { SessionPayload } from "@/lib/auth";
import type { DeadlineInput } from "@/lib/validations";

export async function listDeadlines(
  session: SessionPayload,
  opts: { from?: Date; to?: Date; status?: string; clientId?: string } = {}
) {
  const filters: SQL[] = [eq(deadlines.firmId, session.firmId!)];
  if (opts.from) filters.push(gte(deadlines.dueDate, opts.from));
  if (opts.to) filters.push(lte(deadlines.dueDate, opts.to));
  if (opts.status) filters.push(eq(deadlines.status, opts.status as never));
  if (opts.clientId) filters.push(eq(deadlines.clientId, opts.clientId));

  return db
    .select({
      id: deadlines.id,
      title: deadlines.title,
      description: deadlines.description,
      type: deadlines.type,
      dueDate: deadlines.dueDate,
      status: deadlines.status,
      priority: deadlines.priority,
      clientId: deadlines.clientId,
      clientName: clients.name,
    })
    .from(deadlines)
    .leftJoin(clients, eq(deadlines.clientId, clients.id))
    .where(and(...filters))
    .orderBy(asc(deadlines.dueDate));
}

export async function createDeadline(session: SessionPayload, input: DeadlineInput) {
  const [row] = await db
    .insert(deadlines)
    .values({
      firmId: session.firmId!,
      clientId: input.clientId ?? null,
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      dueDate: new Date(input.dueDate),
      priority: input.priority,
      assignedTo: input.assignedTo ?? null,
      status: "pendiente",
    })
    .returning();
  return row;
}

export async function updateDeadline(
  session: SessionPayload,
  id: string,
  patch: Partial<DeadlineInput> & { status?: string }
) {
  const set: Record<string, unknown> = { ...patch, updatedAt: new Date() };
  if (patch.dueDate) set.dueDate = new Date(patch.dueDate);
  const [row] = await db
    .update(deadlines)
    .set(set)
    .where(and(eq(deadlines.id, id), eq(deadlines.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}
