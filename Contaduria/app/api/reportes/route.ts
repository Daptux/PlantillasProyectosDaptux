import { authContext, json, handle } from "@/lib/api";
import { listReports } from "@/server/services/reportes.service";

export async function GET() {
  return handle(async () => {
    const session = await authContext("reports:read");
    const rows = await listReports(session);
    return json({ rows });
  });
}
