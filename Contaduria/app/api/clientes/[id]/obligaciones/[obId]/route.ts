import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { removeClientObligation } from "@/server/services/clientes.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; obId: string } }
) {
  return handle(async () => {
    const session = await authContext("obligations:delete");
    const res = await removeClientObligation(session, params.id, params.obId);
    if (!res) return apiError("Cliente no encontrado", 404);
    return json({ ok: true });
  });
}
