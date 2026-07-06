import "server-only";
import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./auth";
import { can } from "./permissions";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400, extra?: unknown) {
  return NextResponse.json({ error: message, details: extra }, { status });
}

export class ApiException extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Obtiene la sesion en un route handler y opcionalmente valida un permiso.
 * Lanza ApiException si no cumple.
 */
export async function authContext(permission?: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiException("No autenticado", 401);
  if (permission && !can(session, permission)) {
    throw new ApiException("No autorizado", 403);
  }
  return session;
}

/** Envuelve un handler capturando ApiException y errores comunes. */
export function handle(
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  return fn().catch((e) => {
    // Deja pasar el "bail" de renderizado dinamico de Next (cookies/headers en build)
    if (e?.digest === "DYNAMIC_SERVER_USAGE" || e?.digest?.startsWith?.("NEXT_")) throw e;
    if (e instanceof ApiException) return apiError(e.message, e.status);
    if (e?.message === "UNAUTHORIZED") return apiError("No autenticado", 401);
    if (e?.message === "FORBIDDEN") return apiError("No autorizado", 403);
    if (e?.name === "ZodError") return apiError("Datos invalidos", 422, e.errors);
    console.error("[api] error:", e);
    return apiError("Error interno del servidor", 500);
  });
}
