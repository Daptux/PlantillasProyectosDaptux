import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "./error.middleware";

/**
 * Verifica el token JWT del header Authorization: Bearer <token>
 * e inyecta req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("No autenticado: token requerido", 401);
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      rol: payload.rol,
      clinicaId: payload.clinicaId,
    };
    next();
  } catch {
    throw new AppError("Token invalido o expirado", 401);
  }
}

/**
 * Autenticacion OPCIONAL: si llega un token valido inyecta req.user;
 * si no llega (o es invalido), continua como anonimo sin lanzar error.
 * Util para endpoints publicos que enriquecen datos si el usuario esta logueado
 * (ej: PQRSF desde la landing o desde el portal del paciente).
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyToken(header.slice(7));
      req.user = { id: payload.sub, rol: payload.rol, clinicaId: payload.clinicaId };
    } catch {
      // Token invalido -> se ignora y se trata como anonimo.
    }
  }
  next();
}
