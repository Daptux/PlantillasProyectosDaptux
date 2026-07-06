import { NextRequest } from "next/server";
import { authContext, json, apiError, handle } from "@/lib/api";
import { userSchema } from "@/lib/validations";
import { listUsers, createUser } from "@/server/services/usuarios.service";
import { logAudit } from "@/lib/audit";

export async function GET() {
  return handle(async () => {
    const session = await authContext("users:read");
    const rows = await listUsers(session);
    return json({ rows });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await authContext("users:create");
    const data = userSchema.parse(await req.json());
    try {
      const user = await createUser(session, data);
      await logAudit({
        firmId: session.firmId,
        userId: session.userId,
        action: "create",
        module: "usuarios",
        entityType: "user",
        entityId: user.id,
      });
      return json(user, 201);
    } catch (e) {
      if ((e as Error).message === "EMAIL_TAKEN")
        return apiError("Ya existe un usuario con ese correo", 409);
      throw e;
    }
  });
}
