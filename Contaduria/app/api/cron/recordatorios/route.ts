import { NextRequest } from "next/server";
import { json, apiError, handle } from "@/lib/api";
import { isAuthorizedCron } from "@/lib/cron";
import { runReminders, runUpdateStatuses } from "@/server/services/automations.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  return handle(async () => {
    if (!isAuthorizedCron(req)) return apiError("No autorizado", 401);
    // Actualiza estados y luego envia recordatorios
    await runUpdateStatuses();
    const result = await runReminders();
    return json({ ok: true, ...result });
  });
}
