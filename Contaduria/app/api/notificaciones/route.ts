import { authContext, json, handle } from "@/lib/api";
import { listNotifications, markAllRead } from "@/server/services/notifications.service";

export async function GET() {
  return handle(async () => {
    const session = await authContext();
    const rows = await listNotifications(session.userId);
    return json({ rows });
  });
}

export async function POST() {
  return handle(async () => {
    const session = await authContext();
    await markAllRead(session.userId);
    return json({ ok: true });
  });
}
