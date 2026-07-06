import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { getChecklistWithItems, closeChecklist } from "@/server/services/checklists.service";
import { logAudit } from "@/lib/audit";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("checklists:read");
    const data = await getChecklistWithItems(session, params.id);
    if (!data) return apiError("Checklist no encontrado", 404);
    return json(data);
  });
}

export async function POST(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("checklists:close");
    const row = await closeChecklist(session, params.id);
    if (!row) return apiError("Checklist no encontrado", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "close_month",
      module: "checklists",
      entityType: "checklist",
      entityId: params.id,
    });
    return json(row);
  });
}
