import "server-only";
import { NextRequest } from "next/server";

/**
 * Valida que la peticion venga de Vercel Cron o de un llamado autorizado.
 * Vercel envia: Authorization: Bearer <CRON_SECRET>
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production"; // en dev permite pruebas
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
