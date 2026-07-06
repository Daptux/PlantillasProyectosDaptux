import { authContext, json, handle } from "@/lib/api";
import { markRead } from "@/server/services/notifications.service";

export async function PUT(_req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await authContext();
    await markRead(session.userId, params.id);
    return json({ ok: true });
  });
}
