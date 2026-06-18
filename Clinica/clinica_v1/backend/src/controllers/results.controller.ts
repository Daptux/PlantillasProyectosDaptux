import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/results.service";
import { uploadResultSchema } from "../validations/document.validation";

/** Borra el archivo subido si la operacion falla. */
function cleanupFile(req: Request) {
  if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => undefined);
}

/** GET /api/results  (staff: admin/laboratorio/medico) */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const pacienteId = req.query.paciente_id ? Number(req.query.paciente_id) : undefined;
    const data = await service.listResults(req.user!, pacienteId);
    return ok(res, data, "Resultados listados");
  } catch (err) {
    next(err);
  }
}

/** POST /api/results/upload */
export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    // El archivo es opcional: un resultado puede registrarse y adjuntarse despues.
    const input = uploadResultSchema.parse(req.body);
    const data = await service.createResult(req.file, input, req.user!);
    await audit(req, "UPLOAD_RESULTADO", "resultados_medicos", data.id);
    return created(res, data, "Resultado registrado");
  } catch (err) {
    cleanupFile(req);
    next(err);
  }
}

/** GET /api/results/mine — resultados del paciente autenticado. */
export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listMyResults(req.user!);
    return ok(res, data, "Mis resultados");
  } catch (err) {
    next(err);
  }
}

/** GET /api/results/patient/:patientId */
export async function listByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listResultsByPatient(Number(req.params.patientId), req.user!);
    return ok(res, data, "Resultados del paciente");
  } catch (err) {
    next(err);
  }
}

/** GET /api/results/:id/download */
export async function download(req: Request, res: Response, next: NextFunction) {
  try {
    const { absPath, nombre } = await service.getResultFile(Number(req.params.id), req.user!);
    return res.download(absPath, nombre);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/results/:id  (no RECEPCION; se controla en la ruta) */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteResult(id, req.user!);
    await audit(req, "DELETE_RESULTADO", "resultados_medicos", id);
    return ok(res, null, "Resultado eliminado");
  } catch (err) {
    next(err);
  }
}
