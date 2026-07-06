import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/database/schema";
import type { SessionPayload } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import type { UserInput } from "@/lib/validations";

export async function listUsers(session: SessionPayload) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.firmId, session.firmId!))
    .orderBy(desc(users.createdAt));
}

export async function createUser(session: SessionPayload, input: UserInput) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);
  if (existing.length > 0) throw new Error("EMAIL_TAKEN");

  const [row] = await db
    .insert(users)
    .values({
      firmId: session.firmId!,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password || "contahub123"),
      role: input.role,
      phone: input.phone ?? null,
      status: input.status,
    })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });
  return row;
}

export async function updateUser(
  session: SessionPayload,
  id: string,
  input: Partial<UserInput>
) {
  const patch: Record<string, unknown> = {
    name: input.name,
    role: input.role,
    phone: input.phone,
    status: input.status,
    updatedAt: new Date(),
  };
  if (input.password) patch.passwordHash = await hashPassword(input.password);

  const [row] = await db
    .update(users)
    .set(patch)
    .where(and(eq(users.id, id), eq(users.firmId, session.firmId!)))
    .returning({ id: users.id });
  return row ?? null;
}

export async function deactivateUser(session: SessionPayload, id: string) {
  // No permitir desactivarse a si mismo
  if (id === session.userId) throw new Error("SELF_DEACTIVATE");
  const [row] = await db
    .update(users)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(and(eq(users.id, id), eq(users.firmId, session.firmId!)))
    .returning({ id: users.id });
  return row ?? null;
}

/**
 * Borrado definitivo del usuario. Las referencias en documentos, tareas,
 * solicitudes, etc. quedan en null (onDelete: set null en el schema).
 * No permite eliminarse a si mismo.
 */
export async function deleteUser(session: SessionPayload, id: string) {
  if (id === session.userId) throw new Error("SELF_DELETE");
  const [row] = await db
    .delete(users)
    .where(and(eq(users.id, id), eq(users.firmId, session.firmId!)))
    .returning({ id: users.id });
  return row ?? null;
}
