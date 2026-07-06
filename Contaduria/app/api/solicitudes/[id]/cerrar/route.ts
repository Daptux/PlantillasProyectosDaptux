import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { closeRequest } from "@/server/services/solicitudes.service";
import { logAudit } from "@/lib/audit";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await authContext("requests:create");
    const request = await closeRequest(session, params.id);
    if (!request) return apiError("Solicitud no encontrada", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "close",
      module: "solicitudes",
      entityType: "request",
      entityId: params.id,
    });
    return json(request);
  });
}
