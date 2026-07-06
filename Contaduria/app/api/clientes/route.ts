import { NextRequest } from "next/server";
import { authContext, json, handle } from "@/lib/api";
import { clientSchema } from "@/lib/validations";
import { listClients, createClient } from "@/server/services/clientes.service";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("clients:read");
    const sp = req.nextUrl.searchParams;
    const result = await listClients(session, {
      search: sp.get("search") ?? undefined,
      status: sp.get("status") ?? undefined,
      risk: sp.get("risk") ?? undefined,
      page: Number(sp.get("page") ?? 1),
    });
    return json(result);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("clients:create");
    const data = clientSchema.parse(await req.json());
    const client = await createClient(session, data);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "create",
      module: "clientes",
      entityType: "client",
      entityId: client.id,
      newData: client,
    });
    return json(client, 201);
  });
}
