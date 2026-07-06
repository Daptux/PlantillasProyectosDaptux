import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { clientContactSchema } from "@/lib/validations";
import { listContacts, addContact } from "@/server/services/clientes.service";
import { logAudit } from "@/lib/audit";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("clients:read");
    const rows = await listContacts(session, params.id);
    if (rows === null) return apiError("Cliente no encontrado", 404);
    return json({ rows });
  });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("clients:update");
    const data = clientContactSchema.parse(await req.json());
    const contact = await addContact(session, params.id, data);
    if (!contact) return apiError("Cliente no encontrado", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "add_contact",
      module: "clientes",
      entityType: "client",
      entityId: params.id,
    });
    return json(contact, 201);
  });
}
