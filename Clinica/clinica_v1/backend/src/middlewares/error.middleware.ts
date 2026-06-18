import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { fail } from "../utils/response";

/** Error de aplicacion con codigo HTTP explicito. */
export class AppError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Middleware para rutas no encontradas (404). */
export function notFound(_req: Request, res: Response) {
  return fail(res, "Recurso no encontrado", 404);
}

/** Middleware global de manejo de errores. Debe ir al final. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return fail(res, "Datos invalidos", 422, err.flatten());
  }

  if (err instanceof AppError) {
    return fail(res, err.message, err.status, err.details ?? null);
  }

  // Errores de MySQL (duplicados, etc.)
  const anyErr = err as { code?: string; sqlMessage?: string };
  if (anyErr?.code === "ER_DUP_ENTRY") {
    return fail(res, "Registro duplicado", 409, anyErr.sqlMessage ?? null);
  }

  // eslint-disable-next-line no-console
  console.error("❌ Error no controlado:", err);
  return fail(res, "Error interno del servidor", 500);
}
