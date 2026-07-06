import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { userSchema } from "@/lib/validations";
import { updateUser, deleteUser } from "@/server/services/usuarios.service";
import { logAudit } from "@/lib/audit";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("users:update");
    const data = userSchema.partial().parse(await req.json());
    const row = await updateUser(session, params.id, data);
    if (!row) return apiError("Usuario no encontrado", 404);
    await logAudit({
      firmId: session.firmId,
      userId: session.userId,
      action: "update",
      module: "usuarios",
      entityType: "user",
      entityId: params.id,
    });
    return json({ ok: true });
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await authContext("users:delete");
    try {
      const row = await deleteUser(session, params.id);
      if (!row) return apiError("Usuario no encontrado", 404);
      await logAudit({
        firmId: session.firmId,
        userId: session.userId,
        action: "delete",
        module: "usuarios",
        entityType: "user",
        entityId: params.id,
      });
      return json({ ok: true });
    } catch (e) {
      if ((e as Error).message === "SELF_DELETE")
        return apiError("No puedes eliminar tu propio usuario", 400);
      throw e;
    }
  });
}
