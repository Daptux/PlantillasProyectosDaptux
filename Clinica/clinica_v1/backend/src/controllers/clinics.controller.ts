import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/clinics.service";
import { createClinicSchema, updateClinicSchema } from "../validations/clinic.validation";

/** GET /api/clinics */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listClinics(req.user!);
    return ok(res, data, "Clinicas listadas");
  } catch (err) {
    next(err);
  }
}

/** GET /api/clinics/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getClinic(Number(req.params.id), req.user!);
    return ok(res, data, "Clinica encontrada");
  } catch (err) {
    next(err);
  }
}

/** POST /api/clinics */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createClinicSchema.parse(req.body);
    const data = await service.createClinic(input, req.user!);
    await audit(req, "CREATE_CLINICA", "clinicas", data.id);
    return created(res, data, "Clinica creada");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/clinics/:id */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = updateClinicSchema.parse(req.body);
    const data = await service.updateClinic(id, input, req.user!);
    await audit(req, "UPDATE_CLINICA", "clinicas", id);
    return ok(res, data, "Clinica actualizada");
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/clinics/:id */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteClinic(id, req.user!);
    await audit(req, "DELETE_CLINICA", "clinicas", id);
    return ok(res, null, "Clinica desactivada");
  } catch (err) {
    next(err);
  }
}
