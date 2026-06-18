import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import * as ctrl from "../controllers/payments.controller";

const router = Router();

router.use(authenticate);

// Gestion de pagos: administracion y facturacion.
const gestion = authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.FACTURACION);

// Listado/detalle: gestion + el paciente (el service filtra los suyos).
router.get("/", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.FACTURACION, ROLES.PACIENTE), ctrl.list);
router.get("/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.FACTURACION, ROLES.PACIENTE), ctrl.getById);

// Crear factura / cambiar estado: solo gestion.
router.post("/", gestion, ctrl.create);
router.put("/:id/status", gestion, ctrl.updateStatus);

// Pagar factura propia: el paciente (o gestion en su nombre).
router.post(
  "/:id/pay",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.FACTURACION, ROLES.PACIENTE),
  ctrl.pay
);

export default router;
