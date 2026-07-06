import { NextRequest, NextResponse } from "next/server";
import { authContext, apiError, handle } from "@/lib/api";
import { getReport } from "@/server/services/reportes.service";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await authContext("reports:read");
    const report = await getReport(session, params.id);
    if (!report?.fileUrl) return apiError("Reporte no disponible", 404);
    // Redirige a la URL almacenada (Vercel Blob o /uploads local)
    return NextResponse.redirect(
      report.fileUrl.startsWith("http")
        ? report.fileUrl
        : new URL(report.fileUrl, process.env.NEXT_PUBLIC_APP_URL ?? _req.url)
    );
  });
}
