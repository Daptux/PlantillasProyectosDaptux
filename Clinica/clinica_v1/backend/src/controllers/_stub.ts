import { Request, Response } from "express";
import { fail } from "../utils/response";

/**
 * Handler temporal para endpoints aun no implementados.
 * Permite que la estructura de rutas exista y sea navegable
 * mientras se desarrollan los modulos en las siguientes entregas.
 */
export function notImplemented(module: string) {
  return (_req: Request, res: Response) =>
    fail(res, `Modulo "${module}" pendiente de implementacion`, 501);
}
