import { NextFunction, Request, Response } from "express";
import { ok } from "../utils/response";
import * as service from "../services/dashboard.service";

/** GET /api/dashboard/summary */
export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getSummary(req.user!);
    return ok(res, data, "Resumen del dashboard");
  } catch (err) {
    next(err);
  }
}
