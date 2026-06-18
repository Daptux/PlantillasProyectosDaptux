import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import * as ctrl from "../controllers/appointments.controller";

const router = Router();

// Todas las rutas de citas requieren autenticacion.
router.use(authenticate);

// Catalogos para el formulario (antes de "/:id" para que no lo capture).
router.get("/options", ctrl.options);

// Listado (el service filtra por rol: paciente/medico/staff).
router.get("/", ctrl.list);

// Crear cita: paciente (la suya), recepcion, admin.
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.RECEPCION, ROLES.PACIENTE),
  ctrl.create
);

// Detalle (el service valida propiedad).
router.get("/:id", ctrl.getById);

// Cambiar estado: staff y medico (no el paciente).
router.put(
  "/:id/status",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.RECEPCION, ROLES.MEDICO),
  ctrl.updateStatus
);

// Reprogramar: staff y paciente (la suya).
router.put(
  "/:id/reschedule",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.RECEPCION, ROLES.PACIENTE),
  ctrl.reschedule
);

// Cancelar (logico): staff y paciente (la suya).
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.RECEPCION, ROLES.PACIENTE),
  ctrl.remove
);

export default router;
