import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import {
  listClientObligations,
  addClientObligation,
} from "@/server/services/clientes.service";
import { logAudit } from "@/lib/audit";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("clients:read");
    const rows = await listClientObligations(session, params.id);
    if (rows === null) return apiError("Cliente no encontrado", 404);
    return json({ rows });
  });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("obligations:create");
    const body = await req.json();
    if (!body.obligationId) return apiError("Obligacion requerida", 422);
    const row = await addClientObligation(session, params.id, {
      obligationId: body.obligationId,
      periodicity: body.periodicity,
      dueDay: body.dueDay ? Number(body.dueDay) : null,
      notes: body.notes ?? null,
    });
    if (!row) return apiError("Cliente no encontrado", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "add_obligation",
      module: "clientes",
      entityType: "client",
      entityId: params.id,
    });
    return json(row, 201);
  });
}
