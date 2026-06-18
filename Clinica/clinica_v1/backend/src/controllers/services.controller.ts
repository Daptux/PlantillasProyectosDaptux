import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/services.service";
import { createServiceSchema, updateServiceSchema } from "../validations/service.validation";

/** GET /api/services */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listServices(req.user!);
    return ok(res, data, "Servicios listados");
  } catch (err) {
    next(err);
  }
}

/** GET /api/services/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getService(Number(req.params.id), req.user!);
    return ok(res, data, "Servicio encontrado");
  } catch (err) {
    next(err);
  }
}

/** POST /api/services */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createServiceSchema.parse(req.body);
    const data = await service.createService(input, req.user!);
    await audit(req, "CREATE_SERVICIO", "servicios", data.id);
    return created(res, data, "Servicio creado");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/services/:id */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = updateServiceSchema.parse(req.body);
    const data = await service.updateService(id, input, req.user!);
    await audit(req, "UPDATE_SERVICIO", "servicios", id);
    return ok(res, data, "Servicio actualizado");
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/services/:id */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteService(id, req.user!);
    await audit(req, "DELETE_SERVICIO", "servicios", id);
    return ok(res, null, "Servicio desactivado");
  } catch (err) {
    next(err);
  }
}
