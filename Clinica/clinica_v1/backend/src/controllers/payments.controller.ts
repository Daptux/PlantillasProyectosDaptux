import { NextFunction, Request, Response } from "express";
import { ok, created } from "../utils/response";
import { audit } from "../middlewares/audit.middleware";
import * as service from "../services/payments.service";
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  payPaymentSchema,
  listPaymentsQuerySchema,
} from "../validations/payment.validation";

/** GET /api/payments */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listPaymentsQuerySchema.parse(req.query);
    const data = await service.listPayments(query, req.user!);
    return ok(res, data, "Pagos listados");
  } catch (err) {
    next(err);
  }
}

/** GET /api/payments/:id */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getPayment(Number(req.params.id), req.user!);
    return ok(res, data, "Pago encontrado");
  } catch (err) {
    next(err);
  }
}

/** POST /api/payments */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPaymentSchema.parse(req.body);
    const data = await service.createPayment(input, req.user!);
    await audit(req, "CREATE_PAGO", "pagos", data.id, { monto: data.monto, estado: data.estado });
    return created(res, data, "Pago registrado");
  } catch (err) {
    next(err);
  }
}

/** PUT /api/payments/:id/status */
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = updatePaymentStatusSchema.parse(req.body);
    const data = await service.updatePaymentStatus(id, input, req.user!);
    await audit(req, "UPDATE_PAGO_ESTADO", "pagos", id, { estado: input.estado });
    return ok(res, data, "Estado del pago actualizado");
  } catch (err) {
    next(err);
  }
}

/** POST /api/payments/:id/pay */
export async function pay(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const input = payPaymentSchema.parse(req.body);
    const data = await service.payPayment(id, input, req.user!);
    await audit(req, "PAY_PAGO", "pagos", id, { metodo: data.metodo });
    return ok(res, data, "Pago realizado");
  } catch (err) {
    next(err);
  }
}
