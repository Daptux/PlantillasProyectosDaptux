import { NextRequest } from "next/server";
import { authContext, json, handle } from "@/lib/api";
import { deadlineSchema } from "@/lib/validations";
import { listDeadlines, createDeadline } from "@/server/services/vencimientos.service";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("deadlines:read");
    const sp = req.nextUrl.searchParams;
    const rows = await listDeadlines(session, {
      status: sp.get("status") ?? undefined,
      clientId: sp.get("clientId") ?? undefined,
    });
    return json({ rows });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("deadlines:create");
    const data = deadlineSchema.parse(await req.json());
    const deadline = await createDeadline(session, data);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "create",
      module: "vencimientos",
      entityType: "deadline",
      entityId: deadline.id,
    });
    return json(deadline, 201);
  });
}
