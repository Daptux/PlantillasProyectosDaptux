import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { reviewDocument } from "@/server/services/documentos.service";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await authContext("documents:reject");
    const body = await req.json().catch(() => ({}));
    const status = body.status ?? "rechazado";
    const doc = await reviewDocument(session, params.id, status, body.notes);
    if (!doc) return apiError("Documento no encontrado", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "reject",
      module: "documentos",
      entityType: "document",
      entityId: params.id,
    });
    return json(doc);
  });
}
