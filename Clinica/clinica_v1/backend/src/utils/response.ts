import { Response } from "express";

/**
 * Respuestas JSON uniformes para toda la API.
 * Formato:
 *   { success: boolean, message: string, data?: any, errors?: any }
 */
export function ok(res: Response, data: unknown = null, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function created(res: Response, data: unknown = null, message = "Creado") {
  return ok(res, data, message, 201);
}

export function fail(
  res: Response,
  message = "Error",
  status = 400,
  errors: unknown = null
) {
  return res.status(status).json({ success: false, message, errors });
}
