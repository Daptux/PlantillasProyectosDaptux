import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/sede.service";
import { createSedeSchema, updateSedeSchema } from "../validations/sede.validation";

/** GET /api/sedes */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listSedes(req.user!);
    return ok(res, data, "Sedes listadas");
  } catch (err) {
    next(err);
  }
}

/** GET /api/sedes/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getSede(Number(req.params.id), req.user!);
    return ok(res, data, "Sede encontrada");
  } catch (err) {
    next(err);
  }
}

/** POST /api/sedes */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSedeSchema.parse(req.body);
    const data = await service.createSede(input, req.user!);
    await audit(req, "CREATE_SEDE", "sedes", data.id);
    return created(res, data, "Sede creada");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/sedes/:id */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = updateSedeSchema.parse(req.body);
    const data = await service.updateSede(id, input, req.user!);
    await audit(req, "UPDATE_SEDE", "sedes", id);
    return ok(res, data, "Sede actualizada");
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/sedes/:id */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteSede(id, req.user!);
    await audit(req, "DELETE_SEDE", "sedes", id);
    return ok(res, null, "Sede desactivada");
  } catch (err) {
    next(err);
  }
}
