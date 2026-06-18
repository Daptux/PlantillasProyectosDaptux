import { NextFunction, Request, Response } from "express";
import { ok } from "../utils/response";
import { AppError } from "../middlewares/error.middleware";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/landing.service";
import { updateLandingSchema } from "../validations/landing.validation";

/** GET /api/landing  (publico; ?clinica= por defecto 1) */
export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = Number(req.query.clinica);
    const clinicaId = Number.isInteger(raw) && raw > 0 ? raw : 1;
    const data = await service.getLanding(clinicaId);
    return ok(res, data, "Contenido de la landing");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/landing  (admin de la clinica) */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const clinicaId = req.user!.clinicaId;
    if (!clinicaId) throw new AppError("El usuario no esta asociado a una clinica", 403);
    const input = updateLandingSchema.parse(req.body);
    const data = await service.updateLanding(clinicaId, input);
    await audit(req, "UPDATE_LANDING", "contenido_landing", null, {
      secciones: input.secciones.map((s) => s.seccion),
    });
    return ok(res, data, "Landing actualizada");
  } catch (err) {
    next(err);
  }
}
