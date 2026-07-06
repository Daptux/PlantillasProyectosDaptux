import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { completeTask } from "@/server/services/tareas.service";
import { logAudit } from "@/lib/audit";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await authContext("tasks:update");
    const task = await completeTask(session, params.id);
    if (!task) return apiError("Tarea no encontrada", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "complete",
      module: "tareas",
      entityType: "task",
      entityId: params.id,
    });
    return json(task);
  });
}
