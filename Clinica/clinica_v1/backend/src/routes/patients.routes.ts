import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import * as ctrl from "../controllers/patients.controller";

const router = Router();

router.use(authenticate);

// Lectura: staff clinico/administrativo (incluye laboratorio para asociar resultados).
const puedeLeer = authorize(
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN_CLINICA,
  ROLES.RECEPCION,
  ROLES.MEDICO,
  ROLES.FACTURACION,
  ROLES.LABORATORIO
);
// Escritura: solo administracion y recepcion.
const puedeEscribir = authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.RECEPCION);

router.get("/", puedeLeer, ctrl.list);
router.get("/:id", puedeLeer, ctrl.getById);
router.post("/", puedeEscribir, ctrl.create);
router.put("/:id", puedeEscribir, ctrl.update);
router.delete("/:id", puedeEscribir, ctrl.remove);

export default router;
