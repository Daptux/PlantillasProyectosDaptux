import { NextRequest } from "next/server";
import { authContext, json, handle } from "@/lib/api";
import { listChecklists } from "@/server/services/checklists.service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("checklists:read");
    const now = new Date();
    const month = Number(req.nextUrl.searchParams.get("month") ?? now.getMonth() + 1);
    const year = Number(req.nextUrl.searchParams.get("year") ?? now.getFullYear());
    const rows = await listChecklists(session, month, year);
    return json({ rows, month, year });
  });
}
