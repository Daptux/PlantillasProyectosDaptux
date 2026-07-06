import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/database/schema";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { json, apiError, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return apiError("Correo o contraseña incorrectos", 401);
    }

    if (user.status !== "active") {
      return apiError("La cuenta esta inactiva o suspendida", 403);
    }

    await setSessionCookie({
      userId: user.id,
      firmId: user.firmId,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    await logAudit({
      firmId: user.firmId,
      userId: user.id,
      action: "login",
      module: "auth",
      entityType: "user",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for"),
    });

    return json({ ok: true, role: user.role });
  });
}
