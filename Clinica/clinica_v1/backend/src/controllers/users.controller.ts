import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/users.service";
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
} from "../validations/user.validation";

/** GET /api/users/roles */
export async function roles(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listRoles();
    return ok(res, data, "Roles listados");
  } catch (err) {
    next(err);
  }
}

/** GET /api/users */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    const data = await service.listUsers(query, req.user!);
    return ok(res, data, "Usuarios listados");
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getUser(Number(req.params.id), req.user!);
    return ok(res, data, "Usuario encontrado");
  } catch (err) {
    next(err);
  }
}

/** POST /api/users */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createUserSchema.parse(req.body);
    const data = await service.createUser(input, req.user!);
    await audit(req, "CREATE_USUARIO", "usuarios", data.id, { rol_id: input.rol_id });
    return created(res, data, "Usuario creado");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/users/:id */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = updateUserSchema.parse(req.body);
    const data = await service.updateUser(id, input, req.user!);
    await audit(req, "UPDATE_USUARIO", "usuarios", id);
    return ok(res, data, "Usuario actualizado");
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/users/:id */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteUser(id, req.user!);
    await audit(req, "DELETE_USUARIO", "usuarios", id);
    return ok(res, null, "Usuario desactivado");
  } catch (err) {
    next(err);
  }
}
