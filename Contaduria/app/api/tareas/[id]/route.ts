import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { taskSchema } from "@/lib/validations";
import { updateTask, deleteTask } from "@/server/services/tareas.service";
import { logAudit } from "@/lib/audit";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("tasks:update");
    const data = taskSchema.partial().parse(await req.json());
    const task = await updateTask(session, params.id, data);
    if (!task) return apiError("Tarea no encontrada", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "update",
      module: "tareas",
      entityType: "task",
      entityId: params.id,
    });
    return json(task);
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("tasks:update");
    await deleteTask(session, params.id);
    return json({ ok: true });
  });
}
