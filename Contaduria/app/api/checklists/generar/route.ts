import { NextRequest } from "next/server";
import { authContext, json, handle } from "@/lib/api";
import { generateChecklistsForFirm } from "@/server/services/checklists.service";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("checklists:update");
    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const month = Number(body.month ?? now.getMonth() + 1);
    const year = Number(body.year ?? now.getFullYear());
    const created = await generateChecklistsForFirm(session.firmId!, month, year);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "generate_checklists",
      module: "checklists",
      newData: { month, year, created },
    });
    return json({ ok: true, created, month, year });
  });
}
