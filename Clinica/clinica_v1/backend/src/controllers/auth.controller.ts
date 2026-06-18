import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as authService from "../services/auth.service";
import { loginSchema, registerPatientSchema } from "../validations/auth.validation";

/** POST /api/auth/login */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    // Inyectamos user para auditar el login.
    req.user = { id: result.user.id, rol: result.user.rol, clinicaId: result.user.clinicaId };
    await audit(req, "LOGIN", "usuarios", result.user.id);
    return ok(res, result, "Inicio de sesion exitoso");
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/register-patient */
export async function registerPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerPatientSchema.parse(req.body);
    const result = await authService.registerPatient(input);
    req.user = { id: result.user.id, rol: result.user.rol, clinicaId: result.user.clinicaId };
    await audit(req, "REGISTER_PATIENT", "usuarios", result.user.id);
    return created(res, result, "Registro exitoso");
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me */
export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.id);
    return ok(res, user, "Usuario autenticado");
  } catch (err) {
    next(err);
  }
}
