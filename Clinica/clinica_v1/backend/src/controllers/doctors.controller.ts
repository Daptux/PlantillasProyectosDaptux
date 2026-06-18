import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/doctors.service";
import {
  createDoctorSchema,
  updateDoctorSchema,
  createHorarioSchema,
  createBloqueoSchema,
} from "../validations/doctor.validation";

// --- Medicos ---------------------------------------------------------------

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listDoctors(req.user!);
    return ok(res, data, "Medicos listados");
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getDoctor(Number(req.params.id), req.user!);
    return ok(res, data, "Medico encontrado");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createDoctorSchema.parse(req.body);
    const data = await service.createDoctor(input, req.user!);
    await audit(req, "CREATE_MEDICO", "medicos", data.id);
    return created(res, data, "Medico creado");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = updateDoctorSchema.parse(req.body);
    const data = await service.updateDoctor(id, input, req.user!);
    await audit(req, "UPDATE_MEDICO", "medicos", id);
    return ok(res, data, "Medico actualizado");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteDoctor(id, req.user!);
    await audit(req, "DELETE_MEDICO", "medicos", id);
    return ok(res, null, "Medico desactivado");
  } catch (err) {
    next(err);
  }
}

// --- Horarios --------------------------------------------------------------

export async function listHorarios(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listHorarios(Number(req.params.id), req.user!);
    return ok(res, data, "Horarios listados");
  } catch (err) {
    next(err);
  }
}

export async function createHorario(req: Request, res: Response, next: NextFunction) {
  try {
    const medicoId = Number(req.params.id);
    const input = createHorarioSchema.parse(req.body);
    const data = await service.createHorario(medicoId, input, req.user!);
    await audit(req, "CREATE_HORARIO", "horarios_medicos", (data as { id: number }).id);
    return created(res, data, "Horario creado");
  } catch (err) {
    next(err);
  }
}

export async function deleteHorario(req: Request, res: Response, next: NextFunction) {
  try {
    const medicoId = Number(req.params.id);
    const horarioId = Number(req.params.horarioId);
    await service.deleteHorario(medicoId, horarioId, req.user!);
    await audit(req, "DELETE_HORARIO", "horarios_medicos", horarioId);
    return ok(res, null, "Horario eliminado");
  } catch (err) {
    next(err);
  }
}

// --- Bloqueos --------------------------------------------------------------

export async function listBloqueos(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listBloqueos(Number(req.params.id), req.user!);
    return ok(res, data, "Bloqueos listados");
  } catch (err) {
    next(err);
  }
}

export async function createBloqueo(req: Request, res: Response, next: NextFunction) {
  try {
    const medicoId = Number(req.params.id);
    const input = createBloqueoSchema.parse(req.body);
    const data = await service.createBloqueo(medicoId, input, req.user!);
    await audit(req, "CREATE_BLOQUEO", "bloqueos_agenda", (data as { id: number }).id);
    return created(res, data, "Bloqueo creado");
  } catch (err) {
    next(err);
  }
}

export async function deleteBloqueo(req: Request, res: Response, next: NextFunction) {
  try {
    const medicoId = Number(req.params.id);
    const bloqueoId = Number(req.params.bloqueoId);
    await service.deleteBloqueo(medicoId, bloqueoId, req.user!);
    await audit(req, "DELETE_BLOQUEO", "bloqueos_agenda", bloqueoId);
    return ok(res, null, "Bloqueo eliminado");
  } catch (err) {
    next(err);
  }
}
