import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import * as ctrl from "../controllers/doctors.controller";

const router = Router();

router.use(authenticate);

const admin = authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA);

// Lectura: cualquier rol autenticado (directorio/agenda/formularios).
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);

// Escritura del perfil: solo administracion.
router.post("/", admin, ctrl.create);
router.put("/:id", admin, ctrl.update);
router.delete("/:id", admin, ctrl.remove);

// Horarios (lectura abierta; escritura admin).
router.get("/:id/horarios", ctrl.listHorarios);
router.post("/:id/horarios", admin, ctrl.createHorario);
router.delete("/:id/horarios/:horarioId", admin, ctrl.deleteHorario);

// Bloqueos de agenda (lectura staff; escritura admin).
router.get("/:id/bloqueos", ctrl.listBloqueos);
router.post("/:id/bloqueos", admin, ctrl.createBloqueo);
router.delete("/:id/bloqueos/:bloqueoId", admin, ctrl.deleteBloqueo);

export default router;
