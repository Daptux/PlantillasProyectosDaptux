import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { updateDeadline } from "@/server/services/vencimientos.service";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await authContext("deadlines:update");
    const body = await req.json();
    const row = await updateDeadline(session, params.id, body);
    if (!row) return apiError("Vencimiento no encontrado", 404);
    return json(row);
  });
}
