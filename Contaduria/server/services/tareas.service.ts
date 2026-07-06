import "server-only";
import { and, desc, eq, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, clients, users } from "@/database/schema";
import type { SessionPayload } from "@/lib/auth";
import type { TaskInput } from "@/lib/validations";
import { notify } from "./notifications.service";

export async function listTasks(
  session: SessionPayload,
  opts: { status?: string; priority?: string; clientId?: string; assignedTo?: string } = {}
) {
  const filters: SQL[] = [eq(tasks.firmId, session.firmId!)];
  if (session.role === "auxiliar") filters.push(eq(tasks.assignedTo, session.userId));
  if (opts.status) filters.push(eq(tasks.status, opts.status as never));
  if (opts.priority) filters.push(eq(tasks.priority, opts.priority as never));
  if (opts.clientId) filters.push(eq(tasks.clientId, opts.clientId));
  if (opts.assignedTo) filters.push(eq(tasks.assignedTo, opts.assignedTo));

  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      taskType: tasks.taskType,
      dueDate: tasks.dueDate,
      clientId: tasks.clientId,
      clientName: clients.name,
      assignedTo: tasks.assignedTo,
      assignedName: users.name,
    })
    .from(tasks)
    .leftJoin(clients, eq(tasks.clientId, clients.id))
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .where(and(...filters))
    .orderBy(desc(tasks.createdAt));
}

export async function createTask(session: SessionPayload, input: TaskInput) {
  const [row] = await db
    .insert(tasks)
    .values({
      firmId: session.firmId!,
      createdBy: session.userId,
      clientId: input.clientId ?? null,
      assignedTo: input.assignedTo ?? null,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      status: input.status,
      taskType: input.taskType,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    })
    .returning();

  if (row.assignedTo) {
    await notify(row.assignedTo, {
      title: "Nueva tarea asignada",
      message: row.title,
      type: "tarea_asignada",
      link: "/tareas",
    });
  }
  return row;
}

export async function updateTask(
  session: SessionPayload,
  id: string,
  input: Partial<TaskInput>
) {
  const patch: Record<string, unknown> = { ...input, updatedAt: new Date() };
  if (input.dueDate !== undefined)
    patch.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.status === "completada") patch.completedAt = new Date();

  const [row] = await db
    .update(tasks)
    .set(patch)
    .where(and(eq(tasks.id, id), eq(tasks.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}

export async function completeTask(session: SessionPayload, id: string) {
  const [row] = await db
    .update(tasks)
    .set({ status: "completada", completedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.firmId, session.firmId!)))
    .returning();
  return row ?? null;
}

export async function deleteTask(session: SessionPayload, id: string) {
  await db
    .update(tasks)
    .set({ status: "cancelada", updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.firmId, session.firmId!)));
  return { ok: true };
}
