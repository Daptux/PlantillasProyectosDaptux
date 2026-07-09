import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/** Respuesta exitosa estandar. */
export function ok<T>(data: T, message?: string, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data },
    { status }
  );
}

/** Respuesta de error estandar. */
export function fail(error: string, status = 400, message?: string) {
  return NextResponse.json<ApiResponse>(
    { success: false, error, message },
    { status }
  );
}

/** 401 No autenticado. */
export function unauthorized(message = "No autenticado") {
  return fail(message, 401);
}

/** 403 Sin permisos. */
export function forbidden(message = "No tienes permiso para esta accion") {
  return fail(message, 403);
}

/** 404 No encontrado. */
export function notFound(message = "Recurso no encontrado") {
  return fail(message, 404);
}

/**
 * Envuelve un handler para capturar errores de forma centralizada.
 * Transforma ZodError en 422 con detalle legible.
 */
export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    const detalle = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    return fail(detalle || "Datos invalidos", 422, "Validacion fallida");
  }
  if (err instanceof Error) {
    // Errores de Postgres (ej. solapamiento de reservas) llegan con mensaje util
    return fail(err.message, 400);
  }
  return fail("Error inesperado", 500);
}
