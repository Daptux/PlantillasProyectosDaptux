import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/pqrsf.service";
import {
  createPqrsfSchema,
  respondPqrsfSchema,
  updatePqrsfStatusSchema,
  listPqrsfQuerySchema,
} from "../validations/pqrsf.validation";

/** POST /api/pqrsf  (publico; auth opcional) */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPqrsfSchema.parse(req.body);
    const data = await service.createPqrsf(input, req.user);
    await audit(req, "CREATE_PQRSF", "pqrsf", data.id, { tipo: data.tipo });
    return created(res, data, "PQRSF enviada");
  } catch (err) {
    next(err);
  }
}

/** GET /api/pqrsf  (admin/recepcion) */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listPqrsfQuerySchema.parse(req.query);
    const data = await service.listPqrsf(query, req.user!);
    return ok(res, data, "PQRSF listadas");
  } catch (err) {
    next(err);
  }
}

/** GET /api/pqrsf/mine  (paciente) */
export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listMyPqrsf(req.user!);
    return ok(res, data, "Mis PQRSF");
  } catch (err) {
    next(err);
  }
}

/** GET /api/pqrsf/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getPqrsf(Number(req.params.id), req.user!);
    return ok(res, data, "PQRSF encontrada");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/pqrsf/:id/respond */
export async function respond(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = respondPqrsfSchema.parse(req.body);
    const data = await service.respondPqrsf(id, input, req.user!);
    await audit(req, "RESPOND_PQRSF", "pqrsf", id, { estado: input.estado });
    return ok(res, data, "PQRSF respondida");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/pqrsf/:id/status */
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { estado } = updatePqrsfStatusSchema.parse(req.body);
    const data = await service.updatePqrsfStatus(id, estado, req.user!);
    await audit(req, "UPDATE_PQRSF_ESTADO", "pqrsf", id, { estado });
    return ok(res, data, "Estado actualizado");
  } catch (err) {
    next(err);
  }
}
