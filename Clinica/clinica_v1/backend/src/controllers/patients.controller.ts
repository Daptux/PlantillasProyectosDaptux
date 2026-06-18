import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/patients.service";
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsQuerySchema,
} from "../validations/patient.validation";

/** GET /api/patients */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listPatientsQuerySchema.parse(req.query);
    const data = await service.listPatients(query, req.user!);
    return ok(res, data, "Pacientes listados");
  } catch (err) {
    next(err);
  }
}

/** GET /api/patients/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getPatient(Number(req.params.id), req.user!);
    return ok(res, data, "Paciente encontrado");
  } catch (err) {
    next(err);
  }
}

/** POST /api/patients */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPatientSchema.parse(req.body);
    const data = await service.createPatient(input, req.user!);
    await audit(req, "CREATE_PACIENTE", "pacientes", data.id);
    return created(res, data, "Paciente creado");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/patients/:id */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = updatePatientSchema.parse(req.body);
    const data = await service.updatePatient(id, input, req.user!);
    await audit(req, "UPDATE_PACIENTE", "pacientes", id);
    return ok(res, data, "Paciente actualizado");
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/patients/:id */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deletePatient(id, req.user!);
    await audit(req, "DELETE_PACIENTE", "pacientes", id);
    return ok(res, null, "Paciente desactivado");
  } catch (err) {
    next(err);
  }
}
