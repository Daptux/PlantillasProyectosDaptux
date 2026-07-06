import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { clientSchema } from "@/lib/validations";
import {
  getClient,
  updateClient,
  deleteClient,
} from "@/server/services/clientes.service";
import { logAudit } from "@/lib/audit";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("clients:read");
    const client = await getClient(session, params.id);
    if (!client) return apiError("Cliente no encontrado", 404);
    return json(client);
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("clients:update");
    const data = clientSchema.partial().parse(await req.json());
    const client = await updateClient(session, params.id, data);
    if (!client) return apiError("Cliente no encontrado", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "update",
      module: "clientes",
      entityType: "client",
      entityId: client.id,
      newData: data,
    });
    return json(client);
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("clients:delete");
    const client = await deleteClient(session, params.id);
    if (!client) return apiError("Cliente no encontrado", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "delete",
      module: "clientes",
      entityType: "client",
      entityId: params.id,
    });
    return json({ ok: true });
  });
}
