import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import { AppError } from "../middlewares/error.middleware";
import * as service from "../services/documents.service";
import { uploadDocumentSchema } from "../validations/document.validation";

/** Borra el archivo subido si la operacion falla (evita archivos huerfanos). */
function cleanupFile(req: Request) {
  if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => undefined);
}

/** POST /api/documents/upload */
export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError("Archivo requerido (campo 'archivo')", 422);
    const input = uploadDocumentSchema.parse(req.body);
    const data = await service.createDocument(req.file, input, req.user!);
    await audit(req, "UPLOAD_DOCUMENTO", "documentos_paciente", data.id);
    return created(res, data, "Documento subido");
  } catch (err) {
    cleanupFile(req);
    next(err);
  }
}

/** GET /api/documents/mine — documentos del paciente autenticado. */
export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listMyDocuments(req.user!);
    return ok(res, data, "Mis documentos");
  } catch (err) {
    next(err);
  }
}

/** GET /api/documents/patient/:patientId */
export async function listByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listDocumentsByPatient(Number(req.params.patientId), req.user!);
    return ok(res, data, "Documentos del paciente");
  } catch (err) {
    next(err);
  }
}

/** GET /api/documents/:id/download */
export async function download(req: Request, res: Response, next: NextFunction) {
  try {
    const { absPath, nombre } = await service.getDocumentFile(Number(req.params.id), req.user!);
    return res.download(absPath, nombre);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/documents/:id */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteDocument(id, req.user!);
    await audit(req, "DELETE_DOCUMENTO", "documentos_paciente", id);
    return ok(res, null, "Documento eliminado");
  } catch (err) {
    next(err);
  }
}
