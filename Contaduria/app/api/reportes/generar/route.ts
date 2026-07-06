import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { generateClientMonthlyReport } from "@/server/services/reportes.service";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("reports:create");
    const body = await req.json();
    if (!body.clientId) return apiError("Cliente requerido", 422);
    const now = new Date();
    const month = Number(body.month ?? now.getMonth() + 1);
    const year = Number(body.year ?? now.getFullYear());

    try {
      const report = await generateClientMonthlyReport(session, body.clientId, month, year);
      await logAudit({
        firmId: session.firmId,
        userId: session.userId,
        action: "generate_report",
        module: "reportes",
        entityType: "report",
        entityId: report.id,
      });
      return json(report, 201);
    } catch (e) {
      if ((e as Error).message === "CLIENT_NOT_FOUND")
        return apiError("Cliente no encontrado", 404);
      throw e;
    }
  });
}
