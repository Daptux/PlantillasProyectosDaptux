import { NextRequest } from "next/server";
import { authContext, json, handle } from "@/lib/api";
import { listDocuments } from "@/server/services/documentos.service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("documents:read");
    const sp = req.nextUrl.searchParams;
    const rows = await listDocuments(session, {
      clientId: sp.get("clientId") ?? undefined,
      documentTypeId: sp.get("documentTypeId") ?? undefined,
      month: sp.get("month") ? Number(sp.get("month")) : undefined,
      year: sp.get("year") ? Number(sp.get("year")) : undefined,
      status: sp.get("status") ?? undefined,
    });
    return json({ rows });
  });
}
