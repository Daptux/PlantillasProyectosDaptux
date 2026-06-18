import { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware";

/** Codigos de rol del sistema. */
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN_CLINICA: "ADMIN_CLINICA",
  RECEPCION: "RECEPCION",
  MEDICO: "MEDICO",
  LABORATORIO: "LABORATORIO",
  FACTURACION: "FACTURACION",
  PACIENTE: "PACIENTE",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

/**
 * Permite el acceso solo a los roles indicados.
 * Uso: router.get("/", authenticate, authorize("ADMIN_CLINICA", "RECEPCION"), ...)
 */
export function authorize(...allowed: RoleCode[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("No autenticado", 401);
    }
    if (!allowed.includes(req.user.rol as RoleCode)) {
      throw new AppError("No tienes permisos para esta accion", 403);
    }
    next();
  };
}
