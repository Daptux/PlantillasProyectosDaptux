import { NextFunction, Request, Response } from "express";
import { ok } from "../utils/response";
import * as service from "../services/notifications.service";

/** GET /api/notifications */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listNotifications(req.user!);
    return ok(res, data, "Notificaciones");
  } catch (err) {
    next(err);
  }
}

/** GET /api/notifications/unread-count */
export async function unreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await service.unreadCount(req.user!);
    return ok(res, { count }, "Notificaciones sin leer");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/notifications/:id/read */
export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    await service.markRead(Number(req.params.id), req.user!);
    return ok(res, null, "Notificacion marcada como leida");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/notifications/read-all */
export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await service.markAllRead(req.user!);
    return ok(res, null, "Todas marcadas como leidas");
  } catch (err) {
    next(err);
  }
}
