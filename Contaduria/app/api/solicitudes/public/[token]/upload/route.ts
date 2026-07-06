import { NextRequest } from "next/server";
import { json, apiError, handle } from "@/lib/api";
import { respondPublicRequest } from "@/server/services/solicitudes.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  return handle(async () => {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return apiError("Archivo obligatorio", 422);

    const documentTypeId = (form.get("documentTypeId") as string) || null;
    const month = form.get("month") ? Number(form.get("month")) : null;
    const year = form.get("year") ? Number(form.get("year")) : null;
    const comment = (form.get("comment") as string) || null;

    try {
      const doc = await respondPublicRequest(params.token, file, {
        documentTypeId, month, year, comment,
      });
      return json({ ok: true, id: doc.id }, 201);
    } catch {
      return apiError("El enlace no es valido o expiro", 410);
    }
  });
}
