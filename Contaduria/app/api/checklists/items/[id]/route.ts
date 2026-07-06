import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { updateChecklistItem } from "@/server/services/checklists.service";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await authContext("checklists:update");
    const body = await req.json();
    const item = await updateChecklistItem(session, params.id, {
      status: body.status,
      notes: body.notes,
      assignedTo: body.assignedTo,
    });
    if (!item) return apiError("Item no encontrado", 404);
    return json(item);
  });
}
