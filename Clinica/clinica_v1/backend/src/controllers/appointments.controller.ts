import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as appointmentsService from "../services/appointments.service";
import {
  createAppointmentSchema,
  rescheduleSchema,
  updateStatusSchema,
  listAppointmentsQuerySchema,
} from "../validations/appointment.validation";

/** GET /api/appointments */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAppointmentsQuerySchema.parse(req.query);
    const data = await appointmentsService.listAppointments(query, req.user!);
    return ok(res, data, "Citas listadas");
  } catch (err) {
    next(err);
  }
}

/** GET /api/appointments/options — catalogos para el formulario de cita. */
export async function options(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentsService.getAppointmentOptions(req.user!);
    return ok(res, data, "Catalogos de cita");
  } catch (err) {
    next(err);
  }
}

/** GET /api/appointments/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await appointmentsService.getAppointmentById(Number(req.params.id), req.user!);
    return ok(res, data, "Cita encontrada");
  } catch (err) {
    next(err);
  }
}

/** POST /api/appointments */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createAppointmentSchema.parse(req.body);
    const data = await appointmentsService.createAppointment(input, req.user!);
    await audit(req, "CREATE_CITA", "citas", data.id, {
      medico_id: data.medico_id,
      paciente_id: data.paciente_id,
      fecha_inicio: data.fecha_inicio,
    });
    return created(res, data, "Cita creada");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/appointments/:id/status */
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { estado } = updateStatusSchema.parse(req.body);
    const data = await appointmentsService.updateAppointmentStatus(id, estado, req.user!);
    await audit(req, "UPDATE_CITA_ESTADO", "citas", id, { estado });
    return ok(res, data, "Estado de la cita actualizado");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/appointments/:id/reschedule */
export async function reschedule(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = rescheduleSchema.parse(req.body);
    const data = await appointmentsService.rescheduleAppointment(id, input, req.user!);
    await audit(req, "RESCHEDULE_CITA", "citas", id, { fecha_inicio: data.fecha_inicio });
    return ok(res, data, "Cita reprogramada");
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/appointments/:id — cancelacion logica. */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const data = await appointmentsService.cancelAppointment(id, req.user!);
    await audit(req, "CANCEL_CITA", "citas", id);
    return ok(res, data, "Cita cancelada");
  } catch (err) {
    next(err);
  }
}
