import { NextRequest } from "next/server";
import { authContext, json, handle } from "@/lib/api";
import { requestSchema } from "@/lib/validations";
import { listRequests, createRequest } from "@/server/services/solicitudes.service";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("requests:read");
    const sp = req.nextUrl.searchParams;
    const rows = await listRequests(session, {
      clientId: sp.get("clientId") ?? undefined,
      status: sp.get("status") ?? undefined,
    });
    return json({ rows });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("requests:create");
    const data = requestSchema.parse(await req.json());
    const request = await createRequest(session, data);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "create",
      module: "solicitudes",
      entityType: "request",
      entityId: request.id,
    });
    return json(request, 201);
  });
}
