import { NextRequest } from "next/server";
import { authContext, json, handle } from "@/lib/api";
import { taskSchema } from "@/lib/validations";
import { listTasks, createTask } from "@/server/services/tareas.service";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("tasks:read");
    const sp = req.nextUrl.searchParams;
    const rows = await listTasks(session, {
      status: sp.get("status") ?? undefined,
      priority: sp.get("priority") ?? undefined,
      clientId: sp.get("clientId") ?? undefined,
      assignedTo: sp.get("assignedTo") ?? undefined,
    });
    return json({ rows });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("tasks:create");
    const data = taskSchema.parse(await req.json());
    const task = await createTask(session, data);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "create",
      module: "tareas",
      entityType: "task",
      entityId: task.id,
    });
    return json(task, 201);
  });
}
