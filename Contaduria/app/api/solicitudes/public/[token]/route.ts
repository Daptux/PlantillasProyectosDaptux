import { NextRequest } from "next/server";
import { json, apiError, handle } from "@/lib/api";
import { getPublicRequest } from "@/server/services/solicitudes.service";

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  return handle(async () => {
    const req = await getPublicRequest(params.token);
    if (!req) return apiError("Enlace no encontrado", 404);
    return json(req);
  });
}
