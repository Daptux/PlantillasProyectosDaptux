import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { createDocumentWithFile } from "@/server/services/documentos.service";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("documents:create");
    const form = await req.formData();
    const file = form.get("file");
    const clientId = form.get("clientId");

    if (!(file instanceof File) || !clientId) {
      return apiError("Archivo y cliente son obligatorios", 422);
    }

    const documentTypeId = (form.get("documentTypeId") as string) || null;
    const month = form.get("month") ? Number(form.get("month")) : null;
    const year = form.get("year") ? Number(form.get("year")) : null;
    const notes = (form.get("notes") as string) || null;

    const doc = await createDocumentWithFile({
      firmId: session.firmId!,
      clientId: String(clientId),
      documentTypeId,
      month,
      year,
      file,
      uploadedBy: session.userId,
      notes,
    });

    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "upload",
      module: "documentos",
      entityType: "document",
      entityId: doc.id,
    });

    return json(doc, 201);
  });
}
