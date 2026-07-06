import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/database/schema";

export async function notify(
  userId: string,
  data: { title: string; message?: string; type?: string; link?: string }
) {
  if (!userId) return;
  await db.insert(notifications).values({
    userId,
    title: data.title,
    message: data.message ?? null,
    type: data.type ?? "info",
    link: data.link ?? null,
  });
}

export async function listNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(30);
}

export async function markRead(userId: string, id: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
}
