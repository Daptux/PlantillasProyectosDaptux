import { NextRequest } from "next/server";
import { json, apiError, handle } from "@/lib/api";
import { isAuthorizedCron } from "@/lib/cron";
import { runGenerateChecklists } from "@/server/services/automations.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  return handle(async () => {
    if (!isAuthorizedCron(req)) return apiError("No autorizado", 401);
    const result = await runGenerateChecklists();
    return json({ ok: true, ...result });
  });
}
