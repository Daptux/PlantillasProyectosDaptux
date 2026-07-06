import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { deleteContact } from "@/server/services/clientes.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; contactId: string } }
) {
  return handle(async () => {
    const session = await authContext("clients:update");
    const res = await deleteContact(session, params.id, params.contactId);
    if (!res) return apiError("Cliente no encontrado", 404);
    return json({ ok: true });
  });
}
