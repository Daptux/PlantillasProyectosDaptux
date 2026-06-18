import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/specialty.service";
import { createSpecialtySchema, updateSpecialtySchema } from "../validations/specialty.validation";

/** GET /api/specialties */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listSpecialties(req.user!);
    return ok(res, data, "Especialidades listadas");
  } catch (err) {
    next(err);
  }
}

/** GET /api/specialties/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getSpecialty(Number(req.params.id), req.user!);
    return ok(res, data, "Especialidad encontrada");
  } catch (err) {
    next(err);
  }
}

/** POST /api/specialties */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSpecialtySchema.parse(req.body);
    const data = await service.createSpecialty(input, req.user!);
    await audit(req, "CREATE_ESPECIALIDAD", "especialidades", data.id);
    return created(res, data, "Especialidad creada");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/specialties/:id */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = updateSpecialtySchema.parse(req.body);
    const data = await service.updateSpecialty(id, input, req.user!);
    await audit(req, "UPDATE_ESPECIALIDAD", "especialidades", id);
    return ok(res, data, "Especialidad actualizada");
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/specialties/:id */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteSpecialty(id, req.user!);
    await audit(req, "DELETE_ESPECIALIDAD", "especialidades", id);
    return ok(res, null, "Especialidad desactivada");
  } catch (err) {
    next(err);
  }
}
