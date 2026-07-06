import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/database/schema";
import { json, handle } from "@/lib/api";
import { randomToken } from "@/lib/utils";
import { sendMail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const { email } = await req.json();
    if (!email) return json({ ok: true });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, String(email).toLowerCase()))
      .limit(1);

    // Respuesta identica exista o no el usuario (evita enumeracion de correos)
    if (user) {
      const token = randomToken(24);
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
      await db
        .update(users)
        .set({ resetToken: token, resetTokenExpiresAt: expires })
        .where(eq(users.id, user.id));

      const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/recuperar/${token}`;
      await sendMail({
        to: user.email,
        subject: "Restablecer contraseña - ContaHub",
        html: `<p>Hola ${user.name},</p><p>Solicitaste restablecer tu contraseña. Usa el siguiente enlace (valido 1 hora):</p><p><a href="${url}">${url}</a></p>`,
      });
    }

    return json({ ok: true });
  });
}
