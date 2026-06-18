import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import * as ctrl from "../controllers/sede.controller";

const router = Router();

router.use(authenticate);

// Lectura: cualquier rol autenticado (se usa en formularios de citas/servicios).
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);

// Escritura: solo administracion.
router.post("/", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA), ctrl.create);
router.put("/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA), ctrl.update);
router.delete("/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA), ctrl.remove);

export default router;
